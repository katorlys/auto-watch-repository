<a name="readme-top"></a>
<div align="center">

<!-- <a href="#">
  <img src="https://github.com/katorlys/.github/blob/main/assets/mark/mark.png" height="100">
</a><br> -->

<h1>
  Auto Watch Repository
</h1>

<p>
  Automatically watch the repositories you own and create.
</p>

[![Pull Requests][github-pr-badge]][github-pr-link]
[![Issues][github-issue-badge]][github-issue-link]
[![License][github-license-badge]](LICENSE)

</div>


<!-- Main Body -->

## Introduction

A Tampermonkey userscript that automatically watches repositories you own or create on GitHub.

This script was created in response to [GitHub's sunset of automatic watching of repositories and teams](https://github.blog/changelog/2025-05-22-sunset-of-automatic-watching-of-repositories-and-teams/). When GitHub stopped automatically watching repositories you create, this script fills that gap by using front-end UI interactions to automatically enable watching on your own repositories.

## Features

- 🔍 Automatically detects when you visit a repository you own
- 👁️ Automatically watches repositories you own (if not already watching)
- 🎯 Uses front-end UI clicking to interact with GitHub's native watch functionality
- 🚀 Works seamlessly with GitHub's dynamic page navigation (Turbo/PJAX)
- 📝 Provides console logging for transparency and debugging

## Installation

1. **Install a Userscript Manager**
   
   First, install a userscript manager extension for your browser:
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome, Firefox, Safari, Edge, Opera)
   - [Violentmonkey](https://violentmonkey.github.io/) (Chrome, Firefox, Edge)
   - [Greasemonkey](https://www.greasespot.net/) (Firefox)

2. **Install the Script**
   
   Click on the script file and install it:
   - [Install auto-watch-repository.user.js](../../raw/main/auto-watch-repository.user.js)
   
   Or manually:
   1. Copy the contents of `auto-watch-repository.user.js`
   2. Open your userscript manager dashboard
   3. Create a new script
   4. Paste the contents and save

3. **That's it!**
   
   The script will now automatically run on GitHub repository pages.

## Usage

Once installed, the script works automatically:

1. Navigate to any GitHub repository page
2. If you are the owner of that repository, the script will:
   - Check if you're already watching the repository
   - If not, it will automatically click the "Watch" button
   - Select "All Activity" to watch all repository updates

You can monitor the script's activity by opening your browser's Developer Console (F12) and looking for messages prefixed with `[Auto Watch]`.

## How It Works

The script:
1. Detects when you're on a GitHub repository page
2. Identifies the current logged-in user from the page metadata
3. Compares the repository owner with the current user
4. If they match (you own the repository), it:
   - Locates the "Watch" button on the page
   - Checks if you're already watching
   - If not, clicks the button and selects "All Activity"

All actions are performed using front-end DOM manipulation and UI clicks, just as if you were clicking manually.

## Compatibility

- ✅ Works on all GitHub repository pages (`https://github.com/*/*`)
- ✅ Compatible with GitHub's modern UI
- ✅ Handles dynamic page navigation
- ✅ Respects existing watch state (won't change if already watching)

## Privacy & Security

- ✅ No external network requests - runs entirely in your browser
- ✅ No data collection or tracking
- ✅ Open source - you can review all code
- ✅ Uses `@grant none` - minimal permissions required

## Troubleshooting

**Script not working?**

1. Check that you have a userscript manager installed and enabled
2. Open the browser console (F12) to see script logs
3. Verify you're on a repository page that you own
4. Make sure JavaScript is enabled
5. Try refreshing the page

**Still having issues?**

[Open an issue](https://github.com/katorlys/auto-watch-repository/issues) with:
- Your browser and userscript manager versions
- Console error messages (if any)
- Description of what's not working

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.

<!-- /Main Body -->


<div align="right">
  
[![BACK TO TOP][back-to-top-button]](#readme-top)

</div>

---

<div align="center">

<p>
  Copyright &copy; 2024-present <a target="_blank" href="https://github.com/katorlys">Katorly Lab</a>
</p>

[![License][github-license-badge-bottom]](LICENSE)

</div>

[back-to-top-button]: https://img.shields.io/badge/BACK_TO_TOP-151515?style=flat-square
[github-pr-badge]: https://img.shields.io/github/issues-pr/katorlys/auto-watch-repository?label=pulls&labelColor=151515&color=79E096&style=flat-square
[github-pr-link]: https://github.com/katorlys/auto-watch-repository/pulls
[github-issue-badge]: https://img.shields.io/github/issues/katorlys/auto-watch-repository?labelColor=151515&color=FFC868&style=flat-square
[github-issue-link]: https://github.com/katorlys/auto-watch-repository/issues
[github-license-badge]: https://img.shields.io/github/license/katorlys/auto-watch-repository?labelColor=151515&color=EFEFEF&style=flat-square
<!-- https://img.shields.io/badge/license-CC_BY--NC--SA_4.0-EFEFEF?labelColor=151515&style=flat-square -->
[github-license-badge-bottom]: https://img.shields.io/github/license/katorlys/auto-watch-repository?labelColor=151515&color=EFEFEF&style=for-the-badge
<!-- https://img.shields.io/badge/license-CC_BY--NC--SA_4.0-EFEFEF?labelColor=151515&style=for-the-badge -->
