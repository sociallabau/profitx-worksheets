// Name + email from any worksheet page -> Kit subscriber, tagged with that worksheet's kitTag.
// Returns the worksheet link so the page can unlock it straight away. The link only lives
// here and in worksheets.json, never in the page HTML.
//
// Env: KIT_API_KEY (Kit > Settings > Developer > API keys, v4). Every signup is also logged
// as SIGNUP in the Vercel function logs.
const worksheets = require("../worksheets.json");
const { upsertSubscriber, tagByName } = require("./_lib/kit");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const name = String(body.name || "").trim().slice(0, 80);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const sheet = worksheets.find((w) => w.slug === body.slug);

  if (!sheet) return res.status(404).json({ ok: false, error: "unknown worksheet" });
  // Honeypot: real people never fill the hidden "company" field. Pretend it worked.
  if (body.company) return res.status(200).json({ ok: true, url: sheet.accessUrl });
  if (!name || !EMAIL.test(email)) return res.status(400).json({ ok: false, error: "invalid" });

  console.log("SIGNUP", JSON.stringify({ slug: sheet.slug, name, email, at: new Date().toISOString() }));

  try {
    await upsertSubscriber({ email, name });
    await tagByName(email, sheet.kitTag);
  } catch (e) {
    // Never block the download because Kit hiccuped. The SIGNUP log line has their details.
    console.error("subscribe: kit error", e);
  }
  return res.status(200).json({ ok: true, url: sheet.accessUrl });
};
