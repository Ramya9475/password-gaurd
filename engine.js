/* Password Guard – shared engine (scoring, wordlist check, generator).
   Used by content.js, popup.js and options.js. Runs fully offline. */
(function (g) {
  const words = new Set();

  const LEET_A = { "@": "a", "4": "a", "8": "b", "3": "e", "6": "g", "1": "i", "!": "i", "0": "o", "$": "s", "5": "s", "7": "t", "+": "t", "2": "z" };
  const LEET_B = Object.assign({}, LEET_A, { "1": "l" });

  function addWords(list) {
    for (let w of list) {
      w = (w || "").trim().toLowerCase();
      if (w && !w.startsWith("#")) words.add(w);
    }
  }

  function rebuild(cb) {
    words.clear();
    addWords(g.PSC_BASE_WORDS || []);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({ customWords: "" }, (r) => {
        addWords((r.customWords || "").split(/\r?\n/));
        cb && cb(words.size);
      });
    } else {
      cb && cb(words.size);
    }
  }

  function init(cb) {
    rebuild(cb);
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((c, area) => {
        if (area === "local" && c.customWords) rebuild(cb);
      });
    }
  }

  const normalise = (s, map) =>
    s.toLowerCase().split("").map((c) => map[c] || c).join("").replace(/[^a-z]/g, "");

  // Which wordlist words are hidden inside the password?
  function findWords(pw) {
    const raw = pw.toLowerCase();
    const variants = [raw, normalise(pw, LEET_A), normalise(pw, LEET_B)];
    const found = new Set();
    if (words.has(raw)) found.add(raw);
    for (const v of variants) {
      if (words.has(v)) found.add(v);
      for (let i = 0; i < v.length; i++) {
        for (let len = 4; len <= Math.min(20, v.length - i); len++) {
          const sub = v.substr(i, len);
          if (!words.has(sub)) continue;
          // avoid false alarms: 4-letter hits only count if they are a big part of the password
          if (len >= 5 || len / pw.length >= 0.4) found.add(sub);
        }
      }
    }
    return [...found];
  }

  function hasSequence(pw) {
    const s = pw.toLowerCase();
    let run = 1, dir = 0;
    for (let i = 1; i < s.length; i++) {
      const d = s.charCodeAt(i) - s.charCodeAt(i - 1);
      const alnum = /[a-z0-9]/.test(s[i]) && /[a-z0-9]/.test(s[i - 1]);
      if (alnum && (d === 1 || d === -1) && (dir === 0 || d === dir)) { run++; dir = d; }
      else { run = alnum && (d === 1 || d === -1) ? 2 : 1; dir = alnum && (d === 1 || d === -1) ? d : 0; }
      if (run >= 4) return true;
    }
    return false;
  }
  const hasRepeat = (pw) => /(.)\1{2,}/.test(pw);

  function evaluate(password) {
    const pw = password || "";
    const length = pw.length;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasDigit = /\d/.test(pw);
    const hasSpecial = /[^A-Za-z0-9\s]/.test(pw);
    const found = length ? findWords(pw) : [];
    const isCommon = words.has(pw.toLowerCase());
    const pattern = hasSequence(pw) || hasRepeat(pw);

    const criteria = [
      { label: "At least 8 characters", passed: length >= 8 },
      { label: "At least 12 characters (bonus)", passed: length >= 12 },
      { label: "Uppercase letter (A-Z)", passed: hasUpper },
      { label: "Lowercase letter (a-z)", passed: hasLower },
      { label: "Number (0-9)", passed: hasDigit },
      { label: "Special character (!@#$…)", passed: hasSpecial },
      { label: "No words from your local wordlist", passed: found.length === 0 },
      { label: "No sequences / repeats (1234, aaa)", passed: !pattern },
    ];

    let score = 0;
    if (length >= 16) score += 30; else if (length >= 12) score += 25; else if (length >= 8) score += 15; else if (length > 0) score += 5;
    if (hasUpper) score += 15;
    if (hasLower) score += 15;
    if (hasDigit) score += 20;
    if (hasSpecial) score += 20;

    if (found.length) score -= Math.min(45, 25 * found.length);
    if (pattern) score -= 10;
    if (isCommon) score = Math.min(score, 10);
    score = Math.max(0, Math.min(100, score));
    if (!length) score = 0;

    const s = [];
    if (length && length < 8) s.push("Use at least 8 characters (12+ is ideal).");
    else if (length && length < 12) s.push("Lengthen it to 12+ characters for extra security.");
    if (length && !hasUpper) s.push("Add an uppercase letter (A-Z).");
    if (length && !hasLower) s.push("Add a lowercase letter (a-z).");
    if (length && !hasDigit) s.push("Add a number (0-9).");
    if (length && !hasSpecial) s.push("Add a special character (e.g. ! @ # $ %).");
    if (found.length) s.push("Remove common words: " + found.slice(0, 4).join(", ") + (found.length > 4 ? "…" : "") + ".");
    if (pattern) s.push("Avoid sequences (abcd, 1234) and repeated characters (aaa).");
    if (length && !s.length) s.push("Great job! This password meets every recommended criterion.");

    let pool = 0;
    if (hasLower) pool += 26; if (hasUpper) pool += 26; if (hasDigit) pool += 10; if (hasSpecial) pool += 32;
    const entropy = pool ? Math.round(length * Math.log2(pool)) : 0;

    return { score, criteria, suggestions: s, foundWords: found, entropy };
  }

  function label(score) {
    if (score < 30) return { text: "Very Weak", color: "#ff4d4d" };
    if (score < 50) return { text: "Weak", color: "#ff9933" };
    if (score < 70) return { text: "Moderate", color: "#e6b800" };
    if (score < 90) return { text: "Strong", color: "#4cb860" };
    return { text: "Very Strong", color: "#1fa84a" };
  }

  // ---------- Secure password generator ----------
  function randInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function generate(len, o) {
    const sets = [];
    if (o.upper) sets.push("ABCDEFGHJKLMNPQRSTUVWXYZ");
    if (o.lower) sets.push("abcdefghijkmnopqrstuvwxyz");
    if (o.digits) sets.push("23456789");
    if (o.symbols) sets.push("!@#$%^&*()-_=+?");
    if (!sets.length) sets.push("abcdefghijkmnopqrstuvwxyz");
    len = Math.max(len, sets.length);
    const pool = sets.join("");
    for (let attempt = 0; attempt < 30; attempt++) {
      const out = sets.map((s) => s[randInt(s.length)]);
      while (out.length < len) out.push(pool[randInt(pool.length)]);
      for (let i = out.length - 1; i > 0; i--) { const j = randInt(i + 1); [out[i], out[j]] = [out[j], out[i]]; }
      const pw = out.join("");
      if (findWords(pw).length === 0 && !hasSequence(pw) && !hasRepeat(pw)) return pw;
    }
    return sets.map((s) => s[0]).join("");
  }

  g.PSC = { init, evaluate, label, generate, count: () => words.size };
})(self);
