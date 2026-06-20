# ClearCare+

An AI-first patient navigation prototype: symptom check → find a doctor (or AI-recommended specialist) → book/reschedule an appointment. Multilingual UI (English, Spanish, German, Turkish, Hindi, Arabic). Auth, data, and AI run on Supabase (Postgres + Edge Functions); the same flows are also mapped in n8n for the live demo.

## AI Assistance Disclosure
- Claude Pro was used for parallel development of the application code.
- The workflow and decision-making/architecture process were directed by the student.

## Live demo (GitHub Pages)
The app is fully static, so it can be hosted on GitHub Pages and still talks to the live
backend directly from the browser (Supabase Auth + Postgres + Edge Functions; the
publishable/anon key in `script.js` is browser-safe and RLS protects the data).

**Enable:** repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
**URL:** `https://pcsphsb.github.io/clearcare-plus/`

Before demoing live, confirm:
- The Supabase project is **active** (free projects pause when idle — open the dashboard to wake it).
- Supabase Auth **email confirmation is OFF** (so demo sign-ups log in immediately).
- Edge Functions `symptom-check` + `find-doctors` are **deployed** with CORS (see Edge Functions Setup).
- `USE_N8N = false` (default) runs the standalone Supabase path; set `true` only to demo the n8n workflow live.

> Note: GitHub Pages on a **private** repo requires GitHub Pro/Education; otherwise make the repo public.

## Pages
| File | Purpose |
|------|---------|
| `index.html` | Register / log in |
| `homepage.html` | Dashboard: actions + appointments sheet + profile |
| `symptom.html` | Symptom checker (recommends a specialist) |
| `doctors.html` | Doctor directory (DB-first, OSM fallback) |
| `booking.html` | Book or reschedule an appointment |
| `script.js` | Shared logic for all pages (auto-detects the page) |
| `style.css` | Shared styles |
| `supabase/functions/` | Edge Functions: `symptom-check` (Groq), `find-doctors` (OSM) |
| `doctors.csv` / `doctors_raw.xlsx` | Doctor data (import file / original source) |

## Run modes (standalone vs n8n)
Two flags at the top of `script.js` switch the whole app:
- `USE_N8N` — `false` (default): booking writes directly to Supabase; the Symptom Checker and the doctor OSM fallback use Supabase **Edge Functions**. `true`: all three route through **n8n** for a live workflow demo.
- `N8N_PRODUCTION` — `true` for hands-free production webhooks, `false` for the manual "Listen for test event" demo flow.

## Documentation
All docs live in `Audit/Documentation/Workflow Documentation/`:

- [System Overview & Build Log](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_System Overview.md>) — architecture, data model + RLS, run modes, and the full build history. **Start here.**
- [Edge Functions Setup](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_Edge Functions Setup.md>) — deploy `symptom-check` + `find-doctors` (standalone engine).
- [n8n Consolidation & Cleanup](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_n8n Consolidation and Cleanup.md>) — the three flows merged into one importable workflow + NULL fixes (n8n engine).
- [Doctor File Import](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_Doctor File Import.md>) — `doctors.csv` schema, import steps, RLS SQL.
- [Doctor Data Architecture](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_Doctor Data Architecture.md>) — OSM sourcing (Nominatim + Overpass).
- [ArztAPI Scaffolding](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_ArztAPI Scaffolding.md>) — inactive future-integration placeholder.
- [n8n Workflow](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_n8n Workflow.md>) — the n8n mapping used for the demo.
- [AI Health Insurance SaaS](<Audit/Documentation/Workflow Documentation/MDT_25-27_Change Process MGT_AI Health Insurance SaaS.md>) — concept / vision.

Workflow exports and SQL are in `Audit/Documentation/Workflow JSON SQL/`.
