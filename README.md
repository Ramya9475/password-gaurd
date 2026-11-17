# 🔐 Password Guard

**A privacy-first browser extension that checks password strength in real time on any login or sign-up page, blocks weak patterns using a local wordlist, and generates secure passwords, all fully offline.**

Password Guard is the browser-extension upgrade of an earlier Python/Streamlit password strength checker. Instead of visiting a separate website, the checker now appears right where you type your password.

---

## 📖 About the project

Most people choose passwords that look strong but are easy to guess: `P@ssw0rd123`, `Krishna@2024`, `Summer#2025`. Simple rule checks (length, uppercase, digit, symbol) rate these as "strong", even though they are built from dictionary words.

Password Guard fixes this by combining rule-based scoring with a **local wordlist check** that understands leet-speak (`@` for `a`, `0` for `o`, `$` for `s`, and so on) and obvious patterns. It runs inside the browser as a Manifest V3 extension, so it works on every website, and your password never leaves your device.

---

## 🎯 Purpose

- Help users create stronger passwords **at the moment they sign up or change a password**.
- Demonstrate how password checks can go beyond basic composition rules.
- Keep the whole process **private and offline**: no servers, no network calls, no tracking.
- Serve as a learning project covering browser extensions, Shadow DOM, secure randomness and string-matching algorithms.

---

## ✨ Features

### Real-time strength checking
- A shield icon appears inside every password field on any website.
- Clicking or focusing the field opens a panel that updates as you type.
- A semicircular gauge shows the score (0–100) with labels: *Very Weak, Weak, Moderate, Strong, Very Strong*.
- A checklist shows which rules pass or fail:
  - At least 8 characters, and at least 12 (bonus)
  - Uppercase, lowercase, number, special character
  - No words from your local wordlist
  - No sequences or repeats
- Personalised suggestions explain exactly how to improve the password.
- An entropy estimate (bits) is shown alongside the score.

### Local wordlist protection
- A built-in wordlist is included in `wordlist.js` (common passwords, names, brands, cities, sports and similar terms).
- Add your own words or **import a `.txt` wordlist** on the Options page (company names, pet names, family names, etc.).
- **Leet-speak detection:** `p@ssw0rd`, `Pa$$word`, `adm1n` are all recognised.
- Words hidden inside longer passwords are found (`MyKrishna#88` triggers on "krishna").
- Smart false-positive control: short 4-letter hits only count when they make up a large part of the password.
- Changes to the wordlist apply to all open tabs immediately.

### Pattern detection
- Sequences such as `1234`, `abcd`, `4321`
- Repeated characters such as `aaa`, `111`
- Exact matches with very common passwords are capped at a very low score

### Secure password generator
- Built with `crypto.getRandomValues` (cryptographically secure), with rejection sampling to avoid modulo bias.
- Adjustable length (8–64) and toggles for A-Z, a-z, 0-9 and symbols.
- Guarantees at least one character from each selected type, then shuffles with Fisher-Yates.
- Avoids look-alike characters (`I`, `l`, `O`, `0`, `1`).
- Rejects results that contain wordlist words, sequences or repeats.
- **Copy**, **Regenerate** and **Use this password** buttons. "Use" fills the field and any confirm-password field using the native value setter, so it works with React and other frameworks.

### Extras
- Toolbar popup for testing any password manually.
- Options page for managing the wordlist.
- Automatic dark mode support.
- Works on dynamically loaded login forms (single-page apps).

---

## 🔒 Privacy and security

- **Fully offline:** no network permission, no external requests, no analytics.
- **Nothing is stored except your custom wordlist** (in `chrome.storage.local`). Passwords are read, scored and discarded.
- **Minimal permissions:** only `storage` and `unlimitedStorage`.
- **Isolation:** UI lives in a closed Shadow DOM, so website styles and scripts can't interfere with it.
- **XSS-safe rendering:** all dynamic text is HTML-escaped.

---

## 🛠️ Tech stack

| Area | Technology |
|---|---|
| Platform | Chrome Extension, Manifest V3 (works in Chrome, Edge, Brave) |
| Language | Vanilla JavaScript (ES6+), HTML, CSS |
| UI isolation | Shadow DOM |
| Visuals | Inline SVG gauge |
| Storage | `chrome.storage.local` |
| Randomness | Web Crypto API |
| Dynamic pages | MutationObserver |

---

## 📁 Project structure

```
password-guard/
├── manifest.json     # Extension configuration, permissions, script injection
├── wordlist.js       # Built-in local wordlist
├── engine.js         # Core logic: scoring, wordlist matching, patterns, generator
├── content.js        # Injected UI: icon, panel, events, positioning
├── popup.html / .js  # Toolbar popup tester
├── options.html / .js# Wordlist management page
├── icons/            # 16, 48, 128 px extension icons
└── README.md
```

### How the pieces connect
`engine.js` holds all logic and has no UI. `content.js`, `popup.js` and `options.js` all reuse it. The Options page saves custom words to `chrome.storage.local`; every open tab listens for storage changes and rebuilds its wordlist instantly.

---

## 🚀 Installation

1. Download or unzip the project folder.
2. Open `chrome://extensions` (Edge: `edge://extensions`, Brave: `brave://extensions`).
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `password-guard` folder.
5. Open any login or sign-up page and click the password field. Refresh pages that were already open.

**Using it**
- Click a password field to see the checker panel.
- Click **Generate a strong password** to open the generator, then **Use this password** to fill the form.
- Click the extension icon in the toolbar to test passwords manually.
- Right-click the icon, choose **Options**, to manage your wordlist.

---

## 📊 Scoring model

| Component | Points |
|---|---|
| Length ≥ 16 / ≥ 12 / ≥ 8 / shorter | 30 / 25 / 15 / 5 |
| Uppercase / lowercase | +15 / +15 |
| Digit / special character | +20 / +20 |
| Each wordlist hit | −25 (max −45) |
| Sequence or repeat pattern | −10 |
| Exact common password | score capped at 10 |

Final score is clamped to 0–100.

---

## ⚠️ Known limitations

- Scoring is rule-based and heuristic; it does not simulate real cracking tools.
- The entropy estimate assumes random characters and overstates human-chosen passwords.
- No breach-database lookup.
- Runs in the top-level page only (not inside iframes).
- Does not run on browser-internal pages (`chrome://…`) or the Web Store.
- Built-in wordlist is small; import a larger list for stronger coverage.

---

## 🔮 Future enhancements

**Detection quality**
- Integrate **zxcvbn**-style pattern matching (dates, keyboard walks, names, l33t variants, spatial patterns).
- Add keyboard-layout patterns (`qazwsx`, `1q2w3e`) and common date formats (`15081947`, `2024`).
- Detect passwords containing the username, email or site name on the current page.
- Support multi-language wordlists.

**Breach protection**
- Check against **Have I Been Pwned** using the k-anonymity API (send only the first 5 characters of the SHA-1 hash, never the password).
- Offer an optional offline Bloom filter of leaked passwords.

**Password manager features**
- Save credentials in an encrypted local vault (Web Crypto AES-GCM with a master password).
- Autofill and password-reuse detection.
- Passphrase generator (Diceware-style, memorable words).

**UX and platform**
- Support iframes (`all_frames`) and sites using custom password widgets.
- Warn when a site submits passwords over HTTP.
- Per-site enable/disable and a settings page for thresholds and generator defaults.
- Keyboard shortcut to open the generator.
- Localisation (Hindi, Kannada, Spanish, etc.).
- Firefox and Safari support via WebExtension polyfills.
- Publish to the Chrome Web Store.

**Engineering**
- Unit tests for `engine.js` (Jest/Vitest) and end-to-end tests (Playwright with the extension loaded).
- TypeScript migration and a build step (Vite/Rollup) for bundling.
- Replace the Set-based matcher with a trie or Bloom filter for multi-million-word lists.
- CI pipeline with linting and automated packaging.
- Accessibility audit (ARIA roles, focus management, screen-reader labels).

---

## 📄 License

Free to use and modify for learning and personal projects.

