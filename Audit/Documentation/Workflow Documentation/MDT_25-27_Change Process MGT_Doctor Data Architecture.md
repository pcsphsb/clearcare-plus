# ClearCare+ — Doctor Data Architecture (free, ArztAPI-pluggable)

> **Problem:** There is no open German doctor database (GDPR). The real product,
> **ArztAPI**, costs ~€799/month. **Goal:** build a *pluggable* architecture that runs
> on free data sources now, and lets anyone drop in ArztAPI (or another provider)
> later without rewriting the app.

---

## 1. The Big Idea — Provider Adapter Pattern

Define ONE normalized "doctor" shape (the **contract**). Every data source is an
**adapter** that returns data in that shape. The app/n8n only ever talks to the
normalized shape, so providers are interchangeable.

```
                          ┌─ OSM Overpass adapter   (FREE — build now)
 app/n8n  ──> Normalizer ─┼─ Mock/seed adapter      (already have)
 (postcode, specialty)    └─ ArztAPI adapter        (PAID — future drop-in)
                               │
                               ▼  upsert
                        Supabase `doctors` (cache)
```

**Why this is a real, adoptable architecture:** the "normalizer + cache" stays the
same forever. Swapping to ArztAPI = adding one adapter and flipping a `PROVIDER`
variable. Anyone can fork this and plug their own paid key in.

---

## 2. The Normalized Doctor Schema (the contract)

This mirrors the kind of fields ArztAPI returns, so a future swap is 1:1.

| Field | Type | From OSM | From ArztAPI (future) |
|-------|------|----------|------------------------|
| name | text | `tags.name` | ✓ |
| specialty | text | `tags.healthcare:speciality` (mapped) | ✓ |
| languages | text | `tags.language*` (often missing) | ✓ |
| insurance_accepted | text | ❌ not in OSM | ✓ (GKV/PKV) |
| street | text | `tags.addr:street` + housenumber | ✓ |
| postcode | text | `tags.addr:postcode` | ✓ |
| city | text | `tags.addr:city` | ✓ |
| lat / lon | float | node lat/lon | ✓ |
| phone | text | `tags.phone` / `contact:phone` | ✓ |
| website | text | `tags.website` | ✓ |
| source | text | `"OSM"` | `"ArztAPI"` |
| osm_id | text | node id (for dedup) | n/a |

> **Note — normalized contract vs. the live `doctors` table.** The table above is the
> *target/aspirational* contract (what the OSM normalizer and a future ArztAPI emit), so a
> provider swap stays 1:1. The **live** `doctors` table as currently deployed differs in a
> few column names/shapes and is the source of truth for the running app:
> - `address` (single text column) instead of `street` + `lat`/`lon` — and the app
>   deliberately shows only postcode + city for DB doctors because the scraped `address`
>   is unreliable (see System Overview §5, "Known intentional behavior — doctor address").
> - `accepts_insurance` instead of `insurance_accepted`.
> - Opening hours as seven columns `hours_mon … hours_sun` (read by `openingHoursFromRow()`),
>   not a single free-text field.
> - No `osm_id` / `source` columns on the table today.
>
> Canonical, verified DDL for the live schema lives in `supabase-setup.sql` (§3). Treat
> this section as the design contract; treat that file as what's actually running.

### Extend your `doctors` table to hold this (run in Supabase SQL Editor)

```sql
alter table public.doctors add column if not exists street   text;
alter table public.doctors add column if not exists lat      double precision;
alter table public.doctors add column if not exists lon      double precision;
alter table public.doctors add column if not exists phone    text;
alter table public.doctors add column if not exists website  text;
alter table public.doctors add column if not exists source   text default 'manual';
alter table public.doctors add column if not exists osm_id   text unique;   -- dedup key for upserts
```

---

## 3. START HERE TODAY — see real data in 2 minutes

Before any n8n, prove the data exists. Go to **https://overpass-turbo.eu**, paste this,
click **Run**:

```
[out:json][timeout:25];
{{geocodeArea:Bremen, Germany}}->.a;
(
  node["amenity"="doctors"](area.a);
  node["healthcare"="doctor"](area.a);
);
out body 60;
```

> ⚠️ Don't use `area["name"="Bremen"]["admin_level"="4"]` — Bremen's level-4 area is
> named "Freie Hansestadt Bremen", so that returns nothing and overpass-turbo just
> shows its default map (near Rome). The `{{geocodeArea:...}}` shortcut avoids this.

You'll see real names, addresses, and some specialties. That's your free dataset.
(Swap "Bremen, Germany" for any city.)

**Coordinate version (works in overpass-turbo AND the raw API / n8n):**
```
[out:json][timeout:25];
(
  node["amenity"="doctors"](around:6000,53.0793,8.8017);
  node["healthcare"="doctor"](around:6000,53.0793,8.8017);
);
out body 60;
```
`6000` = metres radius; `53.0793,8.8017` = Bremen centre. This is the approach to use
in n8n (the `{{geocodeArea}}` macro is overpass-turbo ONLY — it won't work in the raw
Overpass API).

---

## 4. The n8n Pipeline (OSM adapter)

Reuse the same pattern as your symptom flow: Webhook → HTTP → normalize → cache → respond.

| # | Node | Config |
|---|------|--------|
| 1 | **Webhook** | POST `find-doctors`, responseNode, CORS `*`. Body: `{ postcode, city, specialty }` |
| 2 | **HTTP Request** | POST `https://overpass-api.de/api/interpreter`, body field `data` = the Overpass query (below) |
| 3 | **Code** | normalize OSM elements → the schema (code below) |
| 4 | **Supabase** | Upsert into `doctors` (match on `osm_id`) — caches results |
| 5 | **Respond to Webhook** | return the normalized list |

### Overpass query for n8n (coordinate/`around` — reliable)
In n8n you must geocode first (the `{{geocodeArea}}` macro is overpass-turbo only).
So: **Nominatim** turns postcode → lat/lon, then this Overpass query (sent as the
`data` parameter) finds doctors within a radius:

```
[out:json][timeout:25];
(
  node["amenity"="doctors"](around:6000,{{ $json.lat }},{{ $json.lon }});
  node["healthcare"="doctor"](around:6000,{{ $json.lat }},{{ $json.lon }});
);
out body 60;
```

(So the n8n order is: Webhook → Nominatim geocode → Overpass `around` → normalize →
upsert → respond. See the geocoding step just below.)

### Normalizer (n8n Code node, Run Once for All Items)

```js
const els = $json.elements || [];          // Overpass returns {elements:[...]}
const SPECIALTY_MAP = {                     // OSM speciality -> friendly label
  general: "General Practitioner", dermatology: "Dermatologist",
  cardiology: "Cardiologist", paediatrics: "Pediatrician",
  gynaecology: "Gynecologist", orthopaedics: "Orthopedist",
  psychiatry: "Psychiatrist", ophthalmology: "Ophthalmologist",
  otolaryngology: "ENT"
};
const out = els.filter(e => e.tags && e.tags.name).map(e => {
  const t = e.tags;
  const spec = (t["healthcare:speciality"] || "").split(";")[0].trim().toLowerCase();
  return {
    json: {
      osm_id: "osm-" + e.id,
      name: t.name,
      specialty: SPECIALTY_MAP[spec] || (spec || "General Practitioner"),
      languages: t["language"] || (t["language:en"] === "yes" ? "English" : ""),
      street: [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" "),
      postcode: t["addr:postcode"] || "",
      city: t["addr:city"] || "",
      lat: e.lat, lon: e.lon,
      phone: t.phone || t["contact:phone"] || "",
      website: t.website || t["contact:website"] || "",
      source: "OSM"
    }
  };
});
return out;
```

### Optional: precise radius search (add geocoding)
If you want "within 5 km of the user's postcode" instead of whole-city:
1. **HTTP Request → Nominatim:** `GET https://nominatim.openstreetmap.org/search?postalcode={{postcode}}&country=Germany&format=json` (set a `User-Agent` header — required). Take `[0].lat`, `[0].lon`.
2. Use a radius Overpass query: `node["amenity"="doctors"](around:5000,LAT,LON);`

---

## 5. The Adapter Switch (how you make it pluggable)

Put a single variable at the top of the flow — a **Set** node: `provider = "OSM"`.
Then a **Switch** node routes to the matching adapter branch; all branches feed the
**same normalizer output shape**:

```
[Set provider] → [Switch on provider]
     ├─ "OSM"     → Overpass HTTP → OSM normalizer ─┐
     ├─ "mock"    → return seed doctors ────────────┤→ [Respond / cache]
     └─ "ArztAPI" → ArztAPI HTTP → ArztAPI normalizer┘  (future)
```

**To adopt ArztAPI later:** add the ArztAPI branch (HTTP node + its own normalizer
mapping ArztAPI fields → the schema), set `provider = "ArztAPI"`. Nothing else changes.
That is the whole value of the architecture.

---

## 6. Honest Limitations (state these in your write-up — they're a strength, not a weakness)

| Gap in the free (OSM) version | How ArztAPI fills it |
|-------------------------------|----------------------|
| Doctor coverage is incomplete (not every practice is mapped) | Complete official registry |
| `specialty` often untagged → falls back to GP | Reliable specialty per doctor |
| **No insurance (GKV/PKV) data** | Insurance acceptance per doctor |
| No availability / bookable slots | Real-time availability |

So the free build is a **best-effort directory** — perfect to prove the architecture
and run a demo. The paid layer is *data completeness*, and your design swaps it in
cleanly. That's exactly the "real, adaptable architecture" you wanted.

### Usage notes (fair use)
- **Nominatim**: max ~1 request/sec, set a real `User-Agent`, don't bulk-scrape.
- **Overpass**: public instance is fair-use; cache results in Supabase (you already do)
  so you're not re-querying on every search. For production, self-host or use a paid tier.

---

## 7. Build Order
1. Run the overpass-turbo query (Section 3) — confirm data for your city. ✅ today
2. Extend the `doctors` table (Section 2 SQL).
3. Build the OSM n8n flow (Section 4): Webhook → Overpass → normalize → upsert → respond.
4. Re-enable the **doctor-matching** step in your symptom workflow, querying the cached
   `doctors` table by `specialty` (+ `city`).
5. Wrap it in the provider Switch (Section 5) so ArztAPI can drop in later.

---

*Companion to: MDT_25-27_Change Process MGT_n8n Workflow.md and the main project doc.*
*Free sources: OpenStreetMap (ODbL), Nominatim, Overpass. Paid drop-in: ArztAPI.*
