# ClearCare+

An AI-first patient navigation prototype: symptom check → find a doctor (or AI-recommended specialist) → book/reschedule an appointment. Multilingual UI (English, Spanish, German, Turkish, Hindi, Arabic). Auth, data, and AI run on Supabase (Postgres + Edge Functions); the same flows are also mapped in n8n for the live demo.

Live via GitHub Pages: [https://pcsphsb.github.io/clearcare-plus/](https://pcsphsb.github.io/clearcare-plus/)

## AI Assistance Disclosure

AI Assistance was used in order to work twice faster given the current project timeline and limited manpower to deploy a full tech-stack application. The student's learning of udnerstanding the process is prioritized and AI was primarily used as a second engineer if completing the construction of the codebase.

- Claude Pro (Opus 4.8) was used for parallel development of the application code.
  - See Commits History for Co-Authored with Claude.
  - Most prominently used in post foundational construction (For Email Configuration setup and styling through Supabase Templates).
- Business Process Modelling, Workflow Modelling, Decision-Making, Tech Architecture and End-to-End Process Mapping all directed and constructed by the students.

## Live demo (GitHub Pages)

The app is fully static, so it can be hosted on GitHub Pages and still talks to the live
backend directly from the browser (Supabase Auth + Postgres + Edge Functions; the
publishable/anon key in `script.js` is browser-safe and RLS protects the data).

**Enable:** repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `root`.
**URL:** `https://pcsphsb.github.io/clearcare-plus/`

Before demoing live, confirm:

- The Supabase project is **active** (free projects pause when idle - open the dashboard to wake it).
- Supabase Auth **email confirmation is ON** - new sign-ups must click the confirmation link (the branded "Confirm signup" email, delivered via **Mailjet** SMTP) before they can log in. A **Resend it** link on the login screen re-sends it if the first email is slow. For a live demo, sign up a test account *before* presenting, or keep the inbox handy to click the link.
- Edge Functions `symptom-check` + `find-doctors` are **deployed** with CORS (see Edge Functions Setup).
- `USE_N8N = false` (default) runs the standalone Supabase path; set `true` only to demo the n8n workflow live.

## Pages

| File                                                     | Purpose                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `index.html`                                           | Register / log in                                               |
| `homepage.html`                                        | Dashboard: actions + appointments sheet + profile               |
| `symptom.html`                                         | Symptom checker (recommends a specialist)                       |
| `doctors.html`                                         | Doctor directory (DB-first, OSM fallback)                       |
| `booking.html`                                         | Book or reschedule an appointment                               |
| `script.js`                                            | Shared logic for all pages (auto-detects the page)              |
| `style.css`                                            | Shared styles                                                   |
| `supabase/functions/`                                  | Edge Functions:`symptom-check` (Groq), `find-doctors` (OSM) |
| `Datasets/doctors.csv` / `Datasets/doctors_raw.xlsx` | Doctor data (import file / original source)                     |

## Run modes (standalone vs n8n)

For Reference (N8N Workflow): [ClearCare+ Complete Workflow](https://pcsphsb.app.n8n.cloud/workflow/xh69iloQa5EHgLke)

> Note: that link is the team's **private n8n Cloud workspace**, so it opens only for an account with access (clicking it as a guest just shows a login). To view and run the workflow yourself, import the exported file [`Audit/Documentation/Workflow JSON SQL/ClearCare+ Complete Workflow.json`](Audit/Documentation/Workflow%20JSON%20SQL/ClearCare%2B%20Complete%20Workflow.json) into your own n8n (Workflows → Import from File). See the n8n Consolidation &amp; Cleanup doc for credential re-linking.

Two flags at the top of `script.js` switch the whole app:

- `USE_N8N` - `false` (default): booking writes directly to Supabase; the Symptom Checker and the doctor OSM fallback use Supabase **Edge Functions**. `true`: all three route through **n8n** for a live workflow demo.
- `N8N_PRODUCTION` - `true` for hands-free production webhooks, `false` for the manual "Listen for test event" demo flow.

## Documentation

All docs live in `Audit/Documentation/Workflow Documentation/`:

- [System Overview &amp; Build Log](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_System%20Overview.md) - architecture, data model + RLS, run modes, and the full build history. **Start here.**
- [Edge Functions Setup](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_Edge%20Functions%20Setup.md) - deploy `symptom-check` + `find-doctors` (standalone engine).
- [n8n Consolidation &amp; Cleanup](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_n8n%20Consolidation%20and%20Cleanup.md) - the three flows merged into one importable workflow + NULL fixes (n8n engine).
- [Doctor File Import](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_Doctor%20File%20Import.md) - `doctors.csv` schema, import steps, RLS SQL.
- [Doctor Data Architecture](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_Doctor%20Data%20Architecture.md) - OSM sourcing (Nominatim + Overpass).
- [ArztAPI Scaffolding](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_ArztAPI%20Scaffolding.md) - inactive future-integration placeholder.
- [n8n Workflow](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_n8n%20Workflow.md) - the n8n mapping used for the demo.
- [AI Health Insurance SaaS](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_AI%20Health%20Insurance%20SaaS.md) - concept / vision, BPMN, regulatory analysis, and the design reconciled with the delivered build (live vs. partial vs. future).
- [UI Prototyping](Audit/Documentation/Workflow%20Documentation/MDT_25-27_Change%20Process%20MGT_UI%20Prototyping.md) - the UI v1 wireframe, the AI-assisted design iterations and prompts, and how the prototype maps to the built pages.

Workflow exports and SQL are in `Audit/Documentation/Workflow JSON SQL/`.

## Future Sprints

Should the students have the opportunity to put this application in real production, the following features are to be considered:

- **Smart AI Emergency Response Identification and Routing:** This requires training the AI Agent in a more precise routing prompting.
- **Insurance Filtered Output Results:** This requires a more precise Database or an actual API designed for more detailed fitlers.
- **End-to-End Communication from User to Doctor via the App (as a third-party):** This requries a dedicated API for connecting the app to the doctor's private calendars, further more, stricter legal architecture to handle private, personal, and medical sensitive data.
- **UI Interface improvement:** Currently, the core feature and supporting feature sare directly present in the UI. In the future, other integrations can be included such as prescription recording, or a small calendar widget that highlights which dates ar emarked based.
- **From Mobile to Web Design Expansion:** The UI is designed with a mobile-facing interface at first in order to narrow the necessary features and avoid overengineering the current processes as well as avoiding adding unnecessary buttons/widgets/features to fill the empty space that a web would present (due to bigger screen size).
- **Legal Architecture:** Currently, Terms and Privacy policy look like links but are non-fucntional, it does not show anything. It is important for the students to also consider understanding the legal implications fo using the current tech architecture as well as datasets being used, how data was collected, and how it will be processed.
- **Cybersecurity layer:** Currently, basic cybersecurity measures are added such as using dedicated auth features to store user registration and having IDs properly hashed and unidentifiable while passwords are completely inaccessible. In the future, other measures should be considered such as 2FA for logins, stricter password policies (12 Letters Minimum, with Numbers and Symbols), and also adding anti-bot captchas and verification. This requires a proper hosting process which is not implemented as it is not a target priority for a demo presentation.
