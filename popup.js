const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function render() {
  const pw = $("pw").value, r = PSC.evaluate(pw), l = PSC.label(r.score);
  $("fill").style.width = r.score + "%"; $("fill").style.background = l.color;
  $("verdict").textContent = pw ? `${l.text} — ${r.score}/100` : "—"; $("verdict").style.color = pw ? l.color : "#888";
  $("criteria").innerHTML = r.criteria.map((c) => `<div class="crit">${c.passed ? "✅" : "❌"} <span class="${c.passed ? "ok" : "no"}">${esc(c.label)}</span></div>`).join("") +
    (r.foundWords.length ? `<div class="crit no">⚠ Wordlist hits: ${esc(r.foundWords.slice(0, 5).join(", "))}</div>` : "");
  $("tip").hidden = !r.suggestions.length;
  $("tip").innerHTML = "<b>💡 Suggestions</b><ul>" + r.suggestions.map((s) => `<li>${esc(s)}</li>`).join("") + "</ul>";
}
$("pw").addEventListener("input", render);
$("show").addEventListener("change", () => ($("pw").type = $("show").checked ? "text" : "password"));
$("opts").addEventListener("click", () => chrome.runtime.openOptionsPage());
PSC.init((n) => { $("count").textContent = n; render(); });
