// Builds public/ from worksheets.json: one page per worksheet at /<slug>, plus an index at /.
// To add a worksheet: add an entry to worksheets.json and push. Nothing else to touch.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const sheets = JSON.parse(read("worksheets.json"));
const head = read("templates/head.html");
const iconHref = head.match(/rel="icon" href="([^"]+)"/)[1];
const logo = `<img src="${iconHref}" alt="">`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`));

const out = new URL("../public/", import.meta.url);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
copyFileSync(new URL("../templates/styles.css", import.meta.url), new URL("styles.css", out));

const required = ["slug", "title", "headline", "sub", "accessUrl"];
for (const w of sheets) {
  for (const k of required) if (!w[k]) throw new Error(`worksheets.json: "${w.slug || "?"}" is missing ${k}`);
  if (!/^[a-z0-9-]+$/.test(w.slug)) throw new Error(`worksheets.json: slug "${w.slug}" must be lowercase-with-dashes`);

  const html = fill(read("templates/worksheet.html"), {
    head, logo,
    title: esc(w.title),
    sub: esc(w.sub),
    eyebrow: esc(w.eyebrow || "Free worksheet"),
    headline: w.headline, // may contain a <span class="v"> highlight
    button: esc(w.button || "Get the worksheet"),
    slugJson: JSON.stringify(w.slug),
  });
  writeFileSync(new URL(`${w.slug}.html`, out), html);
}

writeFileSync(new URL("index.html", out), fill(read("templates/index.html"), {
  head, logo,
  list: sheets.map((w) => `<a href="/${w.slug}">${esc(w.title)}<small>${esc(w.sub)}</small></a>`).join(""),
}));

console.log(`Built ${sheets.length} worksheet page(s): ${sheets.map((w) => "/" + w.slug).join(", ")}`);
