// ==UserScript==
// @name         Auto Watch GitHub Repo
// @namespace    github-auto-watch
// @version      2026.01.30
// @description  Automatically watch your repositories and your newly created repositories on GitHub.
// @author       Katorly
// @match        *://github.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @icon         https://github.githubassets.com/favicons/favicon.svg
// ==/UserScript==

(function () {
    'use strict'

    const PREFIX = '[Auto Watch Repo] '
    const STORAGE_KEY = 'github-auto-watch-pending'
    let listenerAdded = false

    function getPendingRepos() {
        return GM_getValue(STORAGE_KEY, [])
    }

    function addPendingRepo(owner, repo) {
        const pending = getPendingRepos()
        const key = `${owner}/${repo}`
        if (!pending.includes(key)) {
            pending.push(key)
            GM_setValue(STORAGE_KEY, pending)
        }
    }

    function removePendingRepo(owner, repo) {
        const key = `${owner}/${repo}`
        GM_setValue(STORAGE_KEY, getPendingRepos().filter(r => r !== key))
    }

    function isCreateRepoPage() { // `/new` or `/organizations/*/repositories/new`
        return location.pathname === '/new' || /^\/organizations\/[^/]+\/repositories\/new$/.test(location.pathname)
    }

    function isRepoPage() { // `/owner/repo/*`
        const match = location.pathname.match(/^\/([^/]+)\/([^/]+)\/?$/)
        return match && !['new', 'settings', 'organizations'].includes(match[1])
    }

    function getCurrentRepo() { // { owner, repo }
        const match = location.pathname.match(/^\/([^/]+)\/([^/]+)/)
        return match ? { owner: match[1], repo: match[2] } : null
    }

    function setupCreateRepoListener() {
        if (listenerAdded) return
        listenerAdded = true

        document.addEventListener('submit', (e) => {
            if (!isCreateRepoPage()) return

            const form = e.target.closest('form')
            if (!form) return

            const ownerButton = form.querySelector('#owner-dropdown-header-button [data-component="text"]')
            const repoInput = form.querySelector('#repository-name-input')

            if (ownerButton && repoInput?.value) {
                const owner = ownerButton.textContent.trim()
                const repo = repoInput.value.trim()
                if (owner && repo) {
                    addPendingRepo(owner, repo)
                    console.log(`${PREFIX}Saved pending: ${owner}/${repo}`)
                }
            }
        }, true)
    }

    // Get current username from top-right corner
    function getCurrentUser() {
        return document.querySelector('[data-login]')?.getAttribute('data-login')
    }

    function autoWatch() {
        const current = getCurrentRepo()
        if (!current) return

        const key = `${current.owner}/${current.repo}`
        const pending = getPendingRepos()
        const isPending = pending.includes(key)
        const isOwnRepo = getCurrentUser()?.toLowerCase() === current.owner.toLowerCase()

        if (!isPending && !isOwnRepo) return

        const watchButton = document.querySelector('[data-testid="notifications-subscriptions-menu-button"]')
        if (!watchButton) return

        const buttonText = watchButton.textContent || ''
        if (buttonText.includes('Unwatch') || buttonText.includes('Watching')) {
            if (isPending) removePendingRepo(current.owner, current.repo)
            return
        }

        watchButton.click()
        setTimeout(() => {
            const option = [...document.querySelectorAll('[role="menuitemradio"]')] // menuitemradio = menu appeared after click
                .find(el => /All Activity|Watching/i.test(el.textContent))
            if (option) {
                option.click()
                if (isPending) removePendingRepo(current.owner, current.repo)
                console.log(`${PREFIX}Watched: ${key}`)
            }
        }, 300)
    }

    function runPageLogic() {
        setupCreateRepoListener()
        if (isRepoPage()) setTimeout(autoWatch, 1000)
    }

    // Script entry point
    runPageLogic()

    // GitHub page load events
    document.addEventListener('turbo:load', runPageLogic)
    document.addEventListener('pjax:end', runPageLogic)

    // Fallback: listen for URL changes
    let lastUrl = location.href
    let checkTimer = null
    new MutationObserver(() => {
        if (checkTimer) return
        checkTimer = setTimeout(() => {
            checkTimer = null
            if (location.href !== lastUrl) {
                lastUrl = location.href
                setTimeout(runPageLogic, 500)
            }
        }, 100)
    }).observe(document.body, { childList: true, subtree: true })
})()
