# n8n Consolidation & Cleanup

How the three n8n flows were merged into one importable workflow, what was
cleaned up, and the NULL-field fixes. This is the n8n-engine companion to the
[System Overview](MDT_25-27_Change Process MGT_System Overview.md) (the main
notes) and the [Edge Functions Setup](MDT_25-27_Change Process MGT_Edge Functions Setup.md)
(the standalone engine). Either engine is selected by the `USE_N8N` flag in `script.js`.

---

## 1. The one workflow to import

**`Audit/Documentation/Workflow JSON SQL/ClearCare+ Complete Workflow.json`**

Import this single file into n8n and you get one canvas with all three webhook
entry points the app uses:

| Webhook path | Flow on the canvas |
|---|---|
| `symptom-check` | Symptom Check Webhook -> Load User Profile -> Medical Triage Agent (Groq + Structured Output Parser) -> Code (parse) -> Respond -> Route by Urgency -> Emergency branch OR Save Consultation -> Find Matching Doctors -> Merge -> Respond Success |
| `find-doctors` | Find Doctors Webhook -> Geocode (Nominatim) -> Overpass -> Normalize Doctors -> Respond Doctors |
| `book-appointment` | Booking Webhook -> Create Appointment (Supabase) -> Respond Booking |

26 nodes, no duplicate node names, register/login flow removed. The app URLs are
unchanged - n8n routes each request by its path inside this one workflow.

### Why one workflow (and what "simultaneous" really means)
n8n allows several Webhook trigger nodes in a single workflow, so all three flows
live on one canvas. They are **not** one execution: the app calls them at three
separate moments (symptom check, then find doctors, then booking = three HTTP
calls). For the presentation that is exactly what you want - **two screens**: the
app UI, and this one n8n tab. As you click through the app, open the **Executions**
panel and each flow's run appears with every node lighting up. A single linear run
would need an artificial orchestrator with fake data and would misrepresent how the
app actually works, so it is intentionally not done that way.

---

## 2. What was cleaned up
- **Removed the deprecated register/login flow** (`Register Webhook`, `Upsert
  Profile`, `Send Welcome Email`, `Respond Register`). It wrote profiles through a
  table hook instead of Supabase Auth, so it is inaccessible in the current app.
- **Rebranded** every `MediCare+` -> `ClearCare+` (workflow name, node names,
  sticky notes) here and in the source JSON exports.
- **CORS**: every Webhook node now has Allowed Origins (CORS) = `*` so the browser
  can call it.
- **Archived** the obsolete `translate-note` workflow (the in-app translation
  feature was removed) to `Workflow JSON SQL/Deprecated/`.
- **Removed the email nodes** (booking confirmation / welcome email). The project
  has no SMTP backend, and the app never sends mail - booking confirmation is shown
  in the UI from the saved Supabase row. So no email credentials are needed.

## 3. NULL-field fixes (the main correction)
Two Supabase insert nodes were writing NULLs because their field expressions
pointed at the wrong place:

1. **Save Consultation** read the AI fields from the Agent's raw
   `{{ $("Medical Triage Agent").item.json.output.* }}` - undefined, because the
   Agent returns the JSON as text. Fixed to read the **Code node** that parses that
   text into clean fields:
   `{{ $("Code in JavaScript").item.json.recommended_doctor_type }}` (and `urgency`,
   `referral_required`, `needs_human_review`). `symptoms`, `user_id` come from the
   webhook body; `language` from the loaded profile.
2. **Create Appointment** originally mapped only `doctor_id` and broke when it was a
   non-existent value. The app sends `doctor_name`, `doctor_specialty`,
   `doctor_address`, `datetime` (and `user_id`), so the node maps those — matching
   both the app payload and the live `appointments` table.

> Schema note: the live `appointments` table stores the `doctor_name` /
> `doctor_specialty` / `doctor_address` **text snapshot** AND a `doctor_id` foreign
> key to `doctors(id)`. As of the doctors_dummy retirement, `doctor_id` is a real FK
> again (it previously pointed at the prototype `doctors_dummy`). The app now sends
> `doctor_id` too — populated for doctors that come from the `doctors` table, null for
> OSM-fallback doctors (which have no `doctors.id`). The `book-appointment` workflow
> maps `doctor_id` as well, so the n8n booking path also writes the relationship.

---

## 4. Import, activate, present
1. n8n -> Workflows -> Import from File -> `ClearCare+ Complete Workflow.json`.
2. Re-link credentials if prompted (the **Supabase account** and **Groq account**
   nodes) - n8n maps them by name when they already exist.
3. Confirm each Webhook node still has CORS = `*` and Respond = "Using Respond to
   Webhook node".
4. **Activate** the workflow (production URLs, hands-free) OR leave it inactive and
   use "Listen for test event" for a manual, step-by-step demo.
5. In `script.js` set `USE_N8N = true` (and `N8N_PRODUCTION = false` if you want the
   manual "Listen for test event" walkthrough). Set it back to `false` to return to
   the standalone Supabase/Edge-Function engine.

---

## 5. Files in `Workflow JSON SQL/`
| File | Role |
|---|---|
| `ClearCare+ Complete Workflow.json` | **Import this** - the consolidated 3-flow workflow |
| `ClearCare+ Medical Triage.json` | source export of the symptom/booking flows (reference) |
| `find-doctors-workflow.json` | source export of the OSM flow (reference) |
| `book-appointment-workflow.json` | older standalone booking export (reference) |
| `supabase-setup.sql` | original table/RLS setup (see schema note above) |
| `Deprecated/translate-note-workflow.json` | archived - translation feature removed |

---

## 6. Optional future cleanup
- The symptom flow has a mid-flow `Respond to Webhook` (after the Code node) as well
  as `Respond Success` / `Respond Emergency`. It works (the app gets its result),
  but for a tidier single-responder design you could keep only the end responders.
  Left as-is to avoid changing tested behaviour.
