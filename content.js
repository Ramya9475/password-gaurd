/* Password Guard – content script.
   Adds a shield icon + strength/generator panel to every password field. */
(function () {
  if (window.__pscLoaded) return;
  window.__pscLoaded = true;

  const CSS = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .icon { position: fixed; width: 26px; height: 26px; border: 0; border-radius: 7px; padding: 0; cursor: pointer;
          background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.28); display: none; align-items: center; justify-content: center; }
  .icon:hover { box-shadow: 0 2px 8px rgba(0,0,0,.35); }
  .icon svg { width: 17px; height: 17px; }
  .panel { position: fixed; width: 320px; background: #fff; color: #1b1f2a; border-radius: 6px;
           box-shadow: 0 6px 28px rgba(20,24,40,.28); overflow: hidden; font-size: 13px; line-height: 1.35; }
  .panel[hidden], [hidden] { display: none !important; }
  header { display: flex; align-items: center; gap: 8px; padding: 12px 14px; }
  header b { flex: 1; text-align: center; font-size: 15px; font-weight: 600; }
  .ghost { background: none; border: 0; cursor: pointer; font-size: 18px; color: #444; padding: 2px 6px; border-radius: 6px; }
  .ghost:hover { background: #eef0f5; }
  .gauge-wrap { background: #f1f3f6; padding: 10px 14px 12px; text-align: center; }
  .gauge-wrap svg { width: 150px; height: 88px; display: block; margin: 0 auto; }
  .track { fill: none; stroke: #d9dde5; stroke-width: 11; stroke-linecap: round; }
  .arc { fill: none; stroke-width: 11; stroke-linecap: round; transition: stroke-dashoffset .35s ease, stroke .35s ease; }
  .num { font-size: 22px; font-weight: 700; text-anchor: middle; }
  .verdict { font-weight: 700; font-size: 14px; margin-top: -2px; }
  .sub { color: #6a7283; font-size: 11.5px; margin-top: 2px; }
  .section { padding: 10px 14px; border-top: 1px solid #e6e9ef; }
  .crit { display: flex; gap: 7px; align-items: flex-start; padding: 2px 0; font-size: 12.5px; }
  .crit .ok { color: #1fa84a; } .crit .no { color: #e5365a; } .crit span:last-child { flex: 1; }
  .words { margin-top: 6px; font-size: 12px; color: #b23a52; }
  .tip { background: #fff7e8; border-left: 3px solid #ff9f1c; border-radius: 4px; padding: 7px 10px; font-size: 12px; color: #5d4a22; }
  .tip ul { margin: 0; padding-left: 16px; } .tip li { margin: 2px 0; }
  .btn { width: 100%; border: 0; border-radius: 8px; padding: 9px; font-weight: 700; font-size: 13.5px; color: #fff; cursor: pointer;
         background: linear-gradient(90deg, #7f5af0, #2cb67d); }
  .btn:hover { filter: brightness(1.07); }
  .btn.alt { background: #1f6fe0; }
  footer { display: flex; gap: 6px; align-items: center; padding: 9px 14px; border-top: 1px solid #e6e9ef; font-size: 11.5px; color: #4a5160; }
  .gen-box { background: #f1f3f6; padding: 12px 14px; }
  .gen-pw { font-size: 16px; word-break: break-all; font-family: ui-monospace, Menlo, Consolas, monospace; min-height: 22px; }
  .gen-pw .d { color: #1f6fe0; }
  .row { display: flex; align-items: center; justify-content: space-between; margin-top: 10px; gap: 8px; }
  .st { color: #1fa84a; font-weight: 600; font-size: 12.5px; }
  .sq { width: 32px; height: 32px; border: 1px solid #c9ceda; background: #fff; border-radius: 6px; cursor: pointer; font-size: 15px; }
  .sq:hover { background: #eef0f5; }
  .len { display: flex; align-items: center; gap: 10px; margin: 4px 0 8px; }
  .len input[type=range] { flex: 1; accent-color: #1f6fe0; }
  label.chk { display: flex; align-items: center; gap: 9px; padding: 5px 0; font-size: 13px; cursor: pointer; }
  label.chk input { width: 16px; height: 16px; accent-color: #1f6fe0; margin: 0; }
  @media (prefers-color-scheme: dark) {
    .panel, .icon { background: #161b22; color: #e8ebf2; }
    .gauge-wrap, .gen-box { background: #1d2430; } .track { stroke: #333c4d; }
    .section, footer { border-color: #2a3242; } footer, .sub { color: #98a2b6; }
    .ghost { color: #ddd; } .ghost:hover, .sq:hover { background: #2a3242; }
    .sq { background: #161b22; border-color: #3a4357; color: #eee; }
    .tip { background: #2b2415; color: #f0e6d2; } .words { color: #ff8aa0; }
  }`;

  const SHIELD = `<svg viewBox="0 0 24 24"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7f5af0"/><stop offset="1" stop-color="#2cb67d"/></linearGradient></defs><path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3z" fill="url(#g)"/><path d="m8.5 12 2.5 2.5 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const ARC_LEN = 157.08;

  const host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;";
  const root = host.attachShadow({ mode: "closed" });
  root.innerHTML = `
    <style>${CSS}</style>
    <div id="icons"></div>
    <div class="panel" id="panel" hidden>
      <div id="checkView">
        <header><span style="font-size:18px">🔐</span><b>Password Guard</b><button class="ghost" id="close" title="Close">✕</button></header>
        <div class="gauge-wrap">
          <svg viewBox="0 0 120 70">
            <path class="track" d="M10 62 A50 50 0 0 1 110 62"/>
            <path class="arc" id="arc" d="M10 62 A50 50 0 0 1 110 62" stroke-dasharray="${ARC_LEN}" stroke-dashoffset="${ARC_LEN}"/>
            <text class="num" id="num" x="60" y="56">0</text>
          </svg>
          <div class="verdict" id="verdict">Start typing…</div>
          <div class="sub" id="entropy"></div>
        </div>
        <div class="section" id="criteria"></div>
        <div class="section" id="tipWrap" hidden><div class="tip" id="tip"></div></div>
        <div class="section"><button class="btn" id="goGen">✨ Generate a strong password</button></div>
        <footer>🛡️ Checked locally — your password never leaves this browser.</footer>
      </div>
      <div id="genView" hidden>
        <header><button class="ghost" id="back" title="Back">←</button><b>Password generator</b><button class="ghost" id="close2" title="Close">✕</button></header>
        <div class="gen-box">
          <div class="gen-pw" id="genPw"></div>
          <div class="row">
            <span class="st" id="genStatus"></span>
            <span><button class="sq" id="copy" title="Copy">⧉</button> <button class="sq" id="regen" title="Regenerate">↻</button></span>
          </div>
        </div>
        <div class="section">
          <div>Length (characters)</div>
          <div class="len"><input type="range" id="len" min="8" max="64" value="20"><b id="lenVal">20</b></div>
          <label class="chk"><input type="checkbox" id="oU" checked> Use uppercase letters (A-Z)</label>
          <label class="chk"><input type="checkbox" id="oL" checked> Use lowercase letters (a-z)</label>
          <label class="chk"><input type="checkbox" id="oD" checked> Use digits (0-9)</label>
          <label class="chk"><input type="checkbox" id="oS" checked> Use symbols (@#$%^&amp;)</label>
        </div>
        <div class="section"><button class="btn alt" id="use">Use this password</button></div>
        <footer>🛡️ Generated locally with your browser's secure random source.</footer>
      </div>
    </div>`;
  const $ = (id) => root.getElementById(id);
  const panel = $("panel");
  const iconBox = $("icons");

  const fields = new Map();   // input -> icon button
  let active = null;
  let generated = "";

  /* ---------------- helpers ---------------- */
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    return r.width > 20 && r.height > 10 && cs.visibility !== "hidden" && cs.display !== "none"; };

  function setValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /* ---------------- positioning ---------------- */
  function positionIcons() {
    for (const [input, icon] of fields) {
      if (!input.isConnected) { icon.remove(); fields.delete(input); continue; }
      const r = input.getBoundingClientRect();
      const ok = visible(input) && r.bottom > 0 && r.top < innerHeight;
      icon.style.display = ok ? "flex" : "none";
      if (ok) { icon.style.left = r.right - 32 + "px"; icon.style.top = r.top + (r.height - 26) / 2 + "px"; }
    }
    if (active && !panel.hidden) positionPanel();
  }
  function positionPanel() {
    const r = active.getBoundingClientRect();
    const w = 320, h = panel.offsetHeight || 400;
    let left = Math.min(Math.max(8, r.left), innerWidth - w - 8);
    let top = r.bottom + 6;
    if (top + h > innerHeight - 8) top = r.top - h - 6 > 8 ? r.top - h - 6 : Math.max(8, innerHeight - h - 8);
    panel.style.left = left + "px"; panel.style.top = top + "px";
  }

  /* ---------------- checker view ---------------- */
  function render() {
    if (!active) return;
    const pw = active.value;
    const res = PSC.evaluate(pw);
    const lab = PSC.label(res.score);
    const color = pw ? lab.color : "#9aa3b5";
    $("arc").style.stroke = color;
    $("arc").setAttribute("stroke-dashoffset", String(ARC_LEN * (1 - res.score / 100)));
    $("num").textContent = res.score; $("num").style.fill = color;
    $("verdict").textContent = pw ? lab.text + " Password" : "Start typing…"; $("verdict").style.color = color;
    $("entropy").textContent = pw ? `~${res.entropy} bits of entropy · ${pw.length} characters` : "";
    $("criteria").innerHTML = res.criteria.map((c) =>
      `<div class="crit"><span class="${c.passed ? "ok" : "no"}">${c.passed ? "✔" : "✖"}</span><span>${esc(c.label)}</span></div>`).join("") +
      (res.foundWords.length ? `<div class="words">⚠ Found in wordlist: <b>${esc(res.foundWords.slice(0, 5).join(", "))}</b></div>` : "");
    $("tipWrap").hidden = !res.suggestions.length;
    $("tip").innerHTML = "<b>💡 Suggestions</b><ul>" + res.suggestions.map((s) => `<li>${esc(s)}</li>`).join("") + "</ul>";
    positionPanel();
  }

  /* ---------------- generator view ---------------- */
  const opts = () => ({ upper: $("oU").checked, lower: $("oL").checked, digits: $("oD").checked, symbols: $("oS").checked });
  function regen() {
    generated = PSC.generate(+$("len").value, opts());
    $("genPw").innerHTML = [...generated].map((c) => /\d/.test(c) ? `<span class="d">${c}</span>` : esc(c)).join("");
    const lab = PSC.label(PSC.evaluate(generated).score);
    $("genStatus").textContent = "✔ " + lab.text + " Password";
    $("genStatus").style.color = lab.color;
    $("lenVal").textContent = $("len").value;
    positionPanel();
  }
  async function copy() {
    try { await navigator.clipboard.writeText(generated); }
    catch (e) { const t = document.createElement("textarea"); t.value = generated; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove(); }
    $("copy").textContent = "✓"; setTimeout(() => ($("copy").textContent = "⧉"), 1200);
  }
  function usePassword() {
    if (!active) return;
    const scope = active.form || document;
    const all = [...scope.querySelectorAll('input[type="password"]')].filter(visible);
    (all.length ? all : [active]).forEach((i) => setValue(i, generated));
    showView("check"); render();
  }

  function showView(v) { $("checkView").hidden = v !== "check"; $("genView").hidden = v !== "gen"; positionPanel(); }
  function open(input) {
    active = input; panel.hidden = false; showView("check"); render();
  }
  function close() { panel.hidden = true; }

  /* ---------------- events ---------------- */
  $("close").onclick = $("close2").onclick = close;
  $("goGen").onclick = () => { showView("gen"); regen(); };
  $("back").onclick = () => showView("check");
  $("regen").onclick = regen; $("copy").onclick = copy; $("use").onclick = usePassword;
  ["len", "oU", "oL", "oD", "oS"].forEach((id) => $(id).addEventListener("input", regen));

  document.addEventListener("mousedown", (e) => {
    if (panel.hidden) return;
    const path = e.composedPath();
    if (path.includes(host) || path.includes(active)) return;
    close();
  }, true);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }, true);
  addEventListener("scroll", () => requestAnimationFrame(positionIcons), true);
  addEventListener("resize", positionIcons);

  /* ---------------- discover password fields ---------------- */
  function attach(input) {
    if (fields.has(input)) return;
    const icon = document.createElement("button");
    icon.className = "icon"; icon.type = "button"; icon.title = "Password Guard"; icon.innerHTML = SHIELD;
    icon.addEventListener("mousedown", (e) => e.preventDefault());
    icon.addEventListener("click", () => (!panel.hidden && active === input ? close() : open(input)));
    iconBox.appendChild(icon);
    fields.set(input, icon);
    input.addEventListener("focus", () => open(input));
    input.addEventListener("input", () => { if (active === input && !panel.hidden) render(); });
  }
  function scan() {
    document.querySelectorAll('input[type="password"]').forEach(attach);
    positionIcons();
  }

  PSC.init(() => { if (active && !panel.hidden) render(); });
  document.documentElement.appendChild(host);
  scan();
  let _t; new MutationObserver(() => { clearTimeout(_t); _t = setTimeout(scan, 150); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(positionIcons, 400);
})();
