# Password Guard – Chrome / Edge / Brave extension

Upgrade of the Streamlit password strength checker. Works on every website.

## Install (30 seconds)
1. Unzip this folder.
2. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `password-guard` folder.
5. Open any login/sign-up page, click a password field -> the panel appears.
   (Pages that were already open need a refresh once.)

## Features
- Shield icon inside every password field + panel with gauge, checklist, suggestions
- Local wordlist check (built-in `wordlist.js` + your own words / .txt import in Options)
- Detects leet-speak (p@ssw0rd), sequences (1234, abcd) and repeats (aaa)
- Password generator (secure random, length slider, A-Z / a-z / 0-9 / symbols), Copy, Regenerate, "Use this password" (also fills the confirm field)
- Toolbar popup for testing passwords; Options page for the wordlist
- 100% offline: no network permission, nothing leaves your browser

## Files
manifest.json, wordlist.js, engine.js, content.js, popup.html/js, options.html/js, icons/
