const $ = (id) => document.getElementById(id);
const say = (t) => { $("msg").textContent = t; setTimeout(() => ($("msg").textContent = ""), 3000); };
const clean = (t) => [...new Set(t.split(/\r?\n/).map((w) => w.trim()).filter(Boolean))].join("\n");
chrome.storage.local.get({ customWords: "" }, (r) => { $("words").value = r.customWords; });
PSC.init((n) => ($("count").textContent = `Active words (built-in + custom): ${n.toLocaleString()}`));
$("save").onclick = () => chrome.storage.local.set({ customWords: clean($("words").value) }, () => say("Saved ✔"));
$("clear").onclick = () => { $("words").value = ""; chrome.storage.local.set({ customWords: "" }, () => say("Custom words cleared")); };
$("import").onclick = () => $("file").click();
$("file").onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  const merged = clean($("words").value + "\n" + (await f.text()));
  $("words").value = merged;
  chrome.storage.local.set({ customWords: merged }, () => say(`Imported ${f.name} ✔`));
};
