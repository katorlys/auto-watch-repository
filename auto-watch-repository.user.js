// ==UserScript==
// @name         Auto Watch Repository
// @namespace    https://github.com/katorlys/auto-watch-repository
// @version      1.0.0
// @description  Automatically watch the repositories you owned and you created, in response to GitHub's sunset of automatic watching
// @author       Katorly Lab
// @match        https://github.com/*/*
// @grant        none
// @license      MPL-2.0
// @homepageURL  https://github.com/katorlys/auto-watch-repository
// @supportURL   https://github.com/katorlys/auto-watch-repository/issues
// ==/UserScript==

(function() {
    'use strict';

    // Wait for page to fully load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Check if we're on a repository page
        if (!isRepositoryPage()) {
            return;
        }

        // Get the current logged-in user
        const currentUser = getCurrentUser();
        if (!currentUser) {
            console.log('[Auto Watch] No logged-in user detected');
            return;
        }

        // Get the repository owner
        const repoOwner = getRepositoryOwner();
        if (!repoOwner) {
            console.log('[Auto Watch] Could not determine repository owner');
            return;
        }

        // Check if the current user owns this repository
        if (currentUser.toLowerCase() !== repoOwner.toLowerCase()) {
            console.log(`[Auto Watch] Repository not owned by current user (${currentUser} vs ${repoOwner})`);
            return;
        }

        console.log(`[Auto Watch] Current user ${currentUser} owns this repository`);

        // Wait for the page to fully render the watch button
        waitForElement('[data-hydro-click*="WATCH"], button[aria-label*="Watch"]', () => {
            watchRepository();
        });
    }

    function waitForElement(selector, callback, maxAttempts = 10, interval = 500) {
        let attempts = 0;
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                callback();
                return;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkElement, interval);
            } else {
                console.log(`[Auto Watch] Timeout waiting for element: ${selector}`);
            }
        };
        
        checkElement();
    }

    function isRepositoryPage() {
        // Check if we're on a repository page (not on user profile, settings, etc.)
        const pathParts = window.location.pathname.split('/').filter(p => p);
        
        // Repository pages have format: /owner/repo or /owner/repo/...
        // But not: /settings, /notifications, etc.
        if (pathParts.length < 2) {
            return false;
        }

        // Exclude non-repository pages (pages where first path segment is not a user/org)
        const excludedFirstSegments = [
            'settings', 'notifications', 'marketplace', 'explore', 
            'topics', 'trending', 'collections', 'events', 'watching', 
            'stars', 'login', 'logout', 'signup', 'sessions', 
            'organizations', 'enterprise', 'team', 'about', 
            'pricing', 'search', 'features', 'security', 'customer-stories'
        ];

        if (excludedFirstSegments.includes(pathParts[0])) {
            return false;
        }

        // Verify we have the repository structure indicator
        // Repository pages typically have certain elements
        return document.querySelector('[data-hovercard-type="repository"]') !== null ||
               document.querySelector('meta[name="octolytics-dimension-repository_nwo"]') !== null;
    }

    function getCurrentUser() {
        // Try to get the current user from the avatar menu
        const avatarButton = document.querySelector('meta[name="user-login"]');
        if (avatarButton) {
            return avatarButton.getAttribute('content');
        }

        // Fallback: try to get from the dropdown menu
        const userMenuButton = document.querySelector('[data-target="user-menu.button"]');
        if (userMenuButton) {
            const avatarImg = userMenuButton.querySelector('img');
            if (avatarImg && avatarImg.alt) {
                // Avatar alt text is usually "@username"
                return avatarImg.alt.replace('@', '');
            }
        }

        return null;
    }

    function getRepositoryOwner() {
        // Get repository owner from the URL or page structure
        const pathParts = window.location.pathname.split('/').filter(p => p);
        if (pathParts.length >= 1) {
            return pathParts[0];
        }

        return null;
    }

    function watchRepository() {
        // Find the watch button - GitHub uses different structures
        // Modern GitHub uses a specific button structure
        
        // Try to find the watch/unwatch button
        let watchButton = findWatchButton();
        
        if (!watchButton) {
            console.log('[Auto Watch] Watch button not found');
            return;
        }

        // Check current watch state
        const currentState = getWatchState(watchButton);
        console.log(`[Auto Watch] Current watch state: ${currentState}`);

        if (currentState === 'watching') {
            console.log('[Auto Watch] Already watching this repository');
            return;
        }

        if (currentState === 'not-watching' || currentState === 'unknown') {
            // Click the button to open the watch menu
            console.log('[Auto Watch] Attempting to watch repository...');
            watchButton.click();

            // Wait for the dropdown menu to appear
            waitForElement('details[open] button[role="menuitemradio"], details[open] a[role="menuitemradio"]', () => {
                clickWatchOption();
            }, 5, 200);
        }
    }

    function findWatchButton() {
        // GitHub's watch button can be found in multiple ways
        // Try different selectors
        
        // Modern GitHub structure
        let button = document.querySelector('[data-hydro-click*="WATCH"]');
        if (button) return button;

        // Try finding by aria-label
        button = document.querySelector('button[aria-label*="Watch"]');
        if (button) return button;

        // Try finding the subscription button
        button = document.querySelector('[data-view-component="true"] summary:has([data-target="notifications-list-subscription-form.subscriptionButton"])');
        if (button) return button;

        // Alternative selector for the watch dropdown
        const forms = document.querySelectorAll('details');
        for (const form of forms) {
            const summary = form.querySelector('summary');
            if (summary && summary.textContent.trim().includes('Watch')) {
                return summary;
            }
        }

        return null;
    }

    function getWatchState(button) {
        // Try to determine if we're already watching
        const buttonText = button.textContent.trim().toLowerCase();
        
        if (buttonText.includes('unwatch') || buttonText.includes('watching')) {
            return 'watching';
        }
        
        if (buttonText.includes('watch')) {
            return 'not-watching';
        }

        // Check for visual indicators
        const isWatching = button.querySelector('[aria-label*="Unwatch"]') || 
                          button.querySelector('[aria-label*="Watching"]');
        if (isWatching) {
            return 'watching';
        }

        return 'unknown';
    }

    function clickWatchOption() {
        // After clicking the watch button, a menu appears
        // We need to click on the "All Activity" or "Watch" option
        
        // Look for the menu items
        const menuItems = document.querySelectorAll('button[role="menuitemradio"], a[role="menuitemradio"]');
        
        for (const item of menuItems) {
            const text = item.textContent.trim().toLowerCase();
            // Click on "All Activity" option to watch all updates
            if (text.includes('all activity') || (text.includes('watch') && !text.includes('unwatch'))) {
                console.log(`[Auto Watch] Clicking watch option: ${item.textContent.trim()}`);
                item.click();
                console.log('[Auto Watch] Repository is now being watched');
                return;
            }
        }

        // Alternative: try to find any watch-related buttons in the dropdown
        const allButtons = document.querySelectorAll('details[open] button, details[open] a');
        for (const button of allButtons) {
            if (button.textContent.includes('Watch') && !button.textContent.includes('Unwatch')) {
                console.log(`[Auto Watch] Clicking watch button: ${button.textContent.trim()}`);
                button.click();
                console.log('[Auto Watch] Repository is now being watched');
                return;
            }
        }

        console.log('[Auto Watch] Could not find watch option in dropdown');
    }

    // Handle dynamic page navigation (GitHub uses pjax/turbo)
    // Re-run the script when navigation occurs
    document.addEventListener('turbo:load', init);
    document.addEventListener('pjax:end', init);
})();
