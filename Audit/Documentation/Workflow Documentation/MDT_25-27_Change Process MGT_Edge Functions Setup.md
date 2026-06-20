# Supabase Edge Functions setup

Two Edge Functions let the app run entirely inside **Supabase** with no n8n. Each
returns CORS headers so the browser can call it directly. They are used when
`USE_N8N = false`; when `USE_N8N = true`, the app uses the matching n8n webhook
instead (for the live workflow demo).

| Function | Code | Purpose | Secret |
|---|---|---|---|
| `symptom-check` | `supabase/functions/symptom-check/index.ts` | AI symptom triage via Groq (key server-side) | `GROQ_API_KEY` |
| `find-doctors` | `supabase/functions/find-doctors/index.ts` | OSM fallback (Nominatim + Overpass) for cities not in the imported DB | none |

Deploy **both** the same way (below). `find-doctors` needs no secret — it only
calls free public OSM APIs, but it must live server-side because Nominatim requires
a `User-Agent` (which browsers can't set) and to avoid CORS.

---

## Option A — Supabase Dashboard (no CLI)

For **each** function (`symptom-check`, then `find-doctors`):
1. Supabase → **Edge Functions** → **Create a function** → name it exactly (`symptom-check` / `find-doctors`).
2. Paste the contents of the matching `supabase/functions/<name>/index.ts` into the editor.
3. **Deploy**. Disable **"Verify JWT"** (these are public endpoints the browser calls; toggle is also in the function's settings).

Then add the Groq secret (only `symptom-check` needs it):
- **Edge Functions → Manage secrets** (or Project Settings → Edge Functions → Secrets) → `GROQ_API_KEY = gsk_…your key…`

With `USE_N8N = false` in `script.js`, the Symptom Checker and the doctor OSM
fallback now work on their own.

## Option B — Supabase CLI

```bash
# one-time
npm i -g supabase
supabase login
supabase link --project-ref ossxctklhsoiiigixuvt   # your project ref (from SUPABASE_URL)

# set the Groq key as a secret (never in the client) — only needed by symptom-check
supabase secrets set GROQ_API_KEY=gsk_xxxxxxxx

# deploy both as public functions (the browser calls them, so skip JWT verification)
supabase functions deploy symptom-check --no-verify-jwt
supabase functions deploy find-doctors  --no-verify-jwt
```

---

## Test it

```bash
curl -i -X POST "https://ossxctklhsoiiigixuvt.supabase.co/functions/v1/symptom-check" \
  -H "Content-Type: application/json" \
  -H "apikey: <your publishable/anon key>" \
  -d '{"symptoms":"sore throat and mild fever for 3 days","language":"English"}'
```

Expected JSON:
```json
{
  "urgency": "routine",
  "explanation_for_user": "…",
  "recommended_doctor_type": "General Practitioner",
  "referral_required": false
}
```

Doctor OSM fallback (use a city NOT in the imported table):
```bash
curl -i -X POST "https://ossxctklhsoiiigixuvt.supabase.co/functions/v1/find-doctors" \
  -H "Content-Type: application/json" \
  -H "apikey: <your publishable/anon key>" \
  -d '{"city":"Hamburg","specialty":"General Practitioner"}'
```
Returns an array of `{ name, specialty, street, postcode, city, phone, website, languages }`.

---

## Switching between standalone and the n8n demo

Two flags at the top of `script.js`:

| Goal | `USE_N8N` | `N8N_PRODUCTION` |
|------|-----------|------------------|
| App runs on its own (default) | `false` | `true` |
| Live n8n walkthrough (manual "Listen for test event") | `true` | `false` |
| Hands-free but still through n8n | `true` | `true` |

`USE_N8N` switches **booking** (direct Supabase vs n8n), the **Symptom Checker**
(Edge Function vs n8n) and the **doctor OSM fallback** (Edge Function vs n8n)
together — one flag flips the whole app between "own ecosystem" and "show the n8n
mapping."

---

## Notes
- **`find-doctors` resilience:** tries several Overpass mirrors with per-request
  timeouts; if every upstream fails it returns `200` with `[]` (UI shows "no
  doctors found") and logs the reason — check **Edge Functions → find-doctors → Logs**.
- **Model:** `symptom-check` uses `llama-3.3-70b-versatile`. If Groq deprecates it,
  change `MODEL` in its `index.ts`.
- **Key safety:** the Groq key lives only in the Supabase secret — never shipped to
  the browser, never in `script.js`.
- **CORS:** handled inside both functions (`Access-Control-Allow-Origin: *`).
