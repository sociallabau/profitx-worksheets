// Meta Conversions API (server-side Lead). Pairs with the browser pixel: both send the same
// event_id, so Meta counts one lead, not two. Pixel id comes from site.json (or META_PIXEL_ID);
// needs META_CAPI_TOKEN, otherwise it does nothing.
const crypto = require("crypto");
const site = require("../../site.json");

const sha = (v) => crypto.createHash("sha256").update(String(v)).digest("hex");
const cookie = (req, name) => (req.headers.cookie || "").split(/;\s*/).find((c) => c.startsWith(name + "="))?.slice(name.length + 1);

async function sendLead(req, { email, name, eventId, sourceUrl, worksheet }) {
  const pixel = process.env.META_PIXEL_ID || site.pixelId, token = process.env.META_CAPI_TOKEN;
  if (!pixel || !token) return;
  const first = name.toLowerCase().split(/\s+/)[0];
  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId || undefined,
    action_source: "website",
    event_source_url: sourceUrl || undefined,
    user_data: {
      em: [sha(email)],
      fn: first ? [sha(first)] : undefined,
      client_ip_address: (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || undefined,
      client_user_agent: req.headers["user-agent"],
      fbp: cookie(req, "_fbp"),
      fbc: cookie(req, "_fbc"),
    },
    custom_data: { content_name: worksheet },
  };
  const body = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) console.error("meta capi:", r.status, (await r.text()).slice(0, 300));
  } catch (e) {
    console.error("meta capi error", e.message);
  }
}

module.exports = { sendLead };
