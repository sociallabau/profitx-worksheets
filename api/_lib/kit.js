// Kit (ConvertKit) v4. Skips quietly if KIT_API_KEY isn't set.
const BASE = "https://api.kit.com/v4";

async function kit(path, body) {
  const key = process.env.KIT_API_KEY;
  if (!key) return null;
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Kit-Api-Key": key },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("Kit", path, res.status, text.slice(0, 300));
    return null;
  }
  try { return JSON.parse(text); } catch { return {}; }
}

// Creates the subscriber, or updates their first name if they already exist.
async function upsertSubscriber({ email, name }) {
  return kit("/subscribers", { email_address: email, first_name: name.split(" ")[0] });
}

// Kit returns the existing tag if one with this name already exists, so tags never need
// creating by hand: a new worksheet's tag appears in Kit the first time someone signs up.
const tagIds = new Map();
async function tagByName(email, tagName) {
  if (!tagName) return null;
  if (!tagIds.has(tagName)) {
    const out = await kit("/tags", { name: tagName });
    if (!out || !out.tag) return null;
    tagIds.set(tagName, out.tag.id);
  }
  return kit(`/tags/${tagIds.get(tagName)}/subscribers`, { email_address: email });
}

module.exports = { upsertSubscriber, tagByName };
