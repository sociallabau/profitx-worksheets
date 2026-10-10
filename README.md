# ProfitX Worksheets

One base site for every YouTube lead magnet. Each worksheet gets its own page at
`/<slug>` (e.g. `/golden-retainer`): headline, name + email, instant access.
Every signup goes to Kit, tagged with that worksheet's tag.

## Add a new worksheet

Add an entry to `worksheets.json` and push. That's it.

```json
{
  "slug": "pricing-calculator",
  "title": "The Pricing Worksheet",
  "eyebrow": "Free worksheet",
  "headline": "The Pricing <span class=\"v\">Worksheet</span>",
  "sub": "One line on what they'll get.",
  "button": "Get the worksheet",
  "accessUrl": "https://your-notion-link",
  "kitTag": "LM: Pricing"
}
```

- `slug`: the URL (lowercase-with-dashes)
- `headline`: wrap the highlighted words in `<span class="v">…</span>` for violet
- `accessUrl`: the Notion (or any) link they get after signing up; it's never in the page HTML
- `kitTag`: created in Kit automatically on the first signup, so you can trigger a Kit automation off it

## Site-wide settings (`site.json`)

- `pixelId`: Meta Pixel. PageView on every page, Lead on signup (deduped with CAPI by event id)
- `vsl`: the "Want to see how the full system works?" link under the download button.
  A worksheet can override it with its own `"vsl": { "text", "label", "url" }`

## Setup

- Vercel env vars: `KIT_API_KEY` (Kit > Settings > Developer > v4 API key),
  `META_CAPI_TOKEN` (Meta Events Manager > Settings > Conversions API > Generate access token).
  Optional `META_TEST_EVENT_CODE` to see CAPI events in Events Manager's Test Events tab.
- Signups are also logged as `SIGNUP` in the Vercel function logs

## Local preview

`npm run dev`, then open http://localhost:3005
