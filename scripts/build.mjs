// Builds public/ from worksheets.json: one page per worksheet at /<slug>, plus an index at /.
// To add a worksheet: add an entry to worksheets.json and push. Nothing else to touch.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
const sheets = JSON.parse(read("worksheets.json"));
const site = JSON.parse(read("site.json"));
const head = read("templates/head.html");
const iconHref = head.match(/rel="icon" href="([^"]+)"/)[1];
const logo = `<img src="${iconHref}" alt="">`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? vars[k] : `{{${k}}}`));

// Meta Pixel: PageView on load. The Lead event fires from the form script after signup.
const pixel = site.pixelId ? `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(site.pixelId)});
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${encodeURIComponent(site.pixelId)}&ev=PageView&noscript=1"></noscript>` : "";

// Link under the download button. A worksheet can override it with its own "vsl" block.
const vslBlock = (v) => (v && v.url ? `<p class="vsl">${esc(v.text || "")}<br><a href="${esc(v.url)}">${esc(v.label || "Watch the video")} →</a></p>` : "");

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
    pixel,
    vsl: vslBlock(w.vsl || site.vsl),
  });
  writeFileSync(new URL(`${w.slug}.html`, out), html);
}

writeFileSync(new URL("index.html", out), fill(read("templates/index.html"), {
  head, logo, pixel,
  list: sheets.map((w) => `<a href="/${w.slug}">${esc(w.title)}<small>${esc(w.sub)}</small></a>`).join(""),
}));

console.log(`Built ${sheets.length} worksheet page(s): ${sheets.map((w) => "/" + w.slug).join(", ")}`);
