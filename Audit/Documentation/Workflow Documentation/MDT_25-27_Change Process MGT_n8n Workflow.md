# MediCare+ — n8n Workflow (Process Mirror)

> **Purpose:** n8n mirrors the *back-end process* of MediCare+. It does **not** own
> login — Supabase Auth (in the app) does. n8n operates on the **data tables**
> (`profiles`, `consultations`) and the **AI triage**, exactly the parts the BPMN
> automates. Two views of one process: the app = what the user sees; n8n = what the
> system does automatically.

---

## 0. Architecture Recap — Why n8n Can't Touch `auth.users`

| Door | What | Who uses it |
|------|------|-------------|
| **Auth API** (GoTrue) | sign-up, login, password hashing, `auth.users` | the MediCare+ app (`supabase-js`) |
| **Database API** (PostgREST) | normal tables: `profiles`, `consultations`, future `doctors` | **n8n** |

n8n's **Supabase node** uses the Database door only. So n8n mirrors the process by
working on the tables — never on `auth.users`. (If you ever truly need n8n to create a
user, use an **HTTP Request** node against `/auth/v1/signup`, but you don't need that here.)

**Key setup:** give n8n the **`service_role` (secret) key** in its Supabase credential
(n8n only — never the browser). service_role bypasses RLS so the backend can read/write
freely.

---

## ⚡ END-TO-END BUILDER PROMPT (paste into n8n's AI workflow builder)

This single prompt tells n8n's AI builder to generate the **whole MediCare+ process**
(registration mirror + symptom triage + doctor matching + booking) with Supabase
connections — not just the chatbot. After it builds, you set the credentials
(Supabase = service_role key; AI = Groq) on the generated nodes.

```
Build one n8n workflow called "MediCare+ End-to-End Process" that mirrors a health-insurance doctor-booking process and connects to Supabase (Postgres). Create THREE flows in the same workflow:

FLOW 1 — SYMPTOM TRIAGE + DOCTOR MATCHING (main flow):
1. Webhook trigger, POST, path "symptom-check", set to respond via a "Respond to Webhook" node. It receives JSON: user_id, symptoms, language.
2. Supabase node: GET a single row from table "profiles" where id equals the webhook's user_id (loads insurance_type, insurance_company, postcode, city, language).
3. AI Agent node using a Groq chat model. System prompt: it recommends ONE type of doctor from the symptoms (navigation, NOT diagnosis), sets urgency to one of routine/soon/emergency, sets referral_required and needs_human_review booleans, and writes explanation_for_user in the patient's language. Output strict JSON only with keys: recommended_doctor_type, urgency, referral_required, needs_human_review, explanation_for_user. Attach a Structured Output Parser with those fields.
4. Switch node on urgency:
   - "emergency" -> Set node that builds a "call 112" message -> Respond to Webhook.
   - "soon" or "routine" -> continue.
5. Supabase node: INSERT a row into table "consultations" with user_id, symptoms, recommended_doctor_type, urgency, referral_required, needs_human_review, language.
6. Supabase node: GET many rows from table "doctors" where specialty equals recommended_doctor_type, also matching the patient's insurance_company and city when possible. Limit 5.
7. Set node: merge the AI recommendation and the matched doctors into one object.
8. Respond to Webhook: return recommended_doctor_type, urgency, referral_required, explanation_for_user, and doctors (the matched list).

FLOW 2 — REGISTRATION MIRROR:
1. Webhook trigger, POST, path "register-hook". Receives user_id, email, first_name, last_name, language.
2. Supabase node: UPSERT a row in "profiles" (match on id) with those fields.
3. Send Email node: a short welcome email to the user's email.
4. Respond to Webhook: { "status": "ok" }.

FLOW 3 — BOOKING:
1. Webhook trigger, POST, path "book-appointment". Receives user_id, doctor_id (FK to
   doctors; null for OSM-fallback doctors), doctor_name, doctor_specialty,
   doctor_address, datetime (and note_original / note_de).
2. Supabase node: INSERT a row in "appointments" with those fields, status "confirmed".
3. Send Email node: a booking confirmation.
4. Respond to Webhook: { "status": "confirmed" }.

Use one Supabase credential (service_role key) for all Supabase nodes. If a table does not exist yet (doctors, appointments), still create the node so I can configure it.
```

> **After it builds:** (1) set the **Supabase credential** (service_role key) on every
> Supabase node; (2) set the **Groq credential** on the AI Agent; (3) paste the compact
> triage system prompt (see Workflow B below) into the AI Agent; (4) create the missing
> tables (`consultations`, `doctors`, `appointments`) — SQL for `consultations` is below.
>
> n8n's AI builder may not wire every node perfectly. Use the node-by-node breakdowns
> below (Workflows A & B) to fix anything it misses.

---

## WORKFLOW A — Registration Process Mirror

Mirrors the BPMN: *Registration → Database → Confirmation*. The app already signs the
user up; it then calls this webhook so n8n can run the downstream automation.

### Nodes

| # | Node | Config | Purpose |
|---|------|--------|---------|
| 1 | **Webhook** | POST, path `register-hook`, Respond = "Using Respond to Webhook node" | Entry point the app calls after sign-up |
| 2 | **Edit Fields (Set)** | map incoming JSON → `user_id`, `email`, `first_name`, `last_name`, `language` | Normalize the payload |
| 3 | **IF** | check `user_id` and `email` are not empty | Validate (mirrors a process gate) |
| 4 | **Supabase** | Operation: *Upsert* row in `profiles` (match on `id`) | Enrich/confirm the profile row in the DB |
| 5 | **Send Email** *(or Set, to simulate)* | to `email`, "Welcome to MediCare+" | The "Confirmation/Welcome" step |
| 6 | **Respond to Webhook** | body `{ "status": "ok", "user_id": "..." }` | Tell the app it succeeded |

### Incoming payload (what the app sends)

```json
{
  "user_id": "uuid-from-supabase",
  "email": "jane.doe+test@gmail.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "language": "English"
}
```

### Flow

```
[Webhook] → [Set: normalize] → [IF valid?] ──no──► [Respond: error]
                                   │ yes
                                   ▼
                            [Supabase: upsert profiles]
                                   ▼
                            [Send Email: welcome]
                                   ▼
                            [Respond: ok]
```

### How the app calls it (add to script.js after a successful sign-up — optional)

```js
await fetch("http://localhost:5678/webhook/register-hook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: data.user.id, email, first_name: first, last_name: last, language: lang
  })
});
```

> For a class demo you can also just trigger Workflow A with a **Manual Trigger** + pinned
> sample data — you don't strictly need the app to call it. The point is to *show the process*.

---

## WORKFLOW B — Symptom Checker AI (Next Sprint)

Mirrors: *Symptoms → AI recommends doctor type → store consultation → return result*.
This is the brain of the app's "Symptom Checker" tab.

### One-time DB setup — run in Supabase SQL Editor

```sql
create table if not exists public.consultations (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  symptoms text,
  recommended_doctor_type text,
  urgency text,
  referral_required boolean,
  needs_human_review boolean,
  language text,
  created_at timestamptz default now()
);

alter table public.consultations enable row level security;
create policy "insert own consultations" on public.consultations
  for insert with check (auth.uid() = user_id);
create policy "select own consultations" on public.consultations
  for select using (auth.uid() = user_id);
```

### Nodes

| # | Node | Config | Purpose |
|---|------|--------|---------|
| 1 | **Webhook** | POST, path `symptom-check`, Respond = "Using Respond to Webhook node" | Receives symptoms from the app |
| 2 | **Edit Fields (Set)** | `user_id`, `symptoms`, `language` | Normalize input |
| 3 | **Supabase** *(optional)* | *Get* the user's `profiles` row | Personalize (language, insurance, postcode) |
| 4 | **AI Agent** | Chat model = **Groq** (llama-3.x); System Message = triage prompt below | Recommend doctor TYPE (navigation, not diagnosis) |
| 5 | **Switch** | on `urgency`: `emergency` / `soon` / `routine` | Route by urgency |
| 6a | (emergency) **Set** | message: "Call 112 now" + `needs_human_review=true` | Safety path |
| 6b | (soon/routine) **Supabase** | *Insert* into `consultations` | Save the triage result |
| 7 | **Respond to Webhook** | return the AI JSON to the app | App shows the recommendation |

### AI Agent — System Message (paste into the AI Agent node)

> ⚠️ n8n's prompt field has a **5,000-character limit**. The version below is
> ~1,500 chars — well within budget — with the JSON format inlined so it works
> even WITHOUT the structured output parser.

```
You are the triage assistant for MediCare+, a health-insurance navigation app for immigrants in Germany. You help users reach the RIGHT TYPE of doctor. You are a navigator, NOT a diagnostician.

RULES:
1. Recommend ONE doctor type only (e.g. General Practitioner, Dermatologist, Cardiologist, ENT, Orthopedist, Gynecologist, Pediatrician, Psychiatrist, Ophthalmologist, Dentist, Urologist, Gastroenterologist).
2. NEVER name a disease, diagnosis, or treatment. If asked what is wrong, say you only help find the right doctor.
3. "urgency" is EXACTLY one of: routine, soon, emergency.
4. EMERGENCY OVERRIDE: if symptoms include red flags (chest pain, difficulty breathing, stroke signs, severe bleeding, fainting, suicidal thoughts, severe allergic reaction) set urgency=emergency, needs_human_review=true, recommended_doctor_type="Emergency (call 112)", and tell the user to call 112 now.
5. GERMAN REFERRAL RULE: specialists need a GP referral first. Set referral_required=true for a specialist; false for General Practitioner or Emergency.
6. Write "explanation_for_user" in the user's language: {{ $json.language }}. Warm, simple, 1-2 sentences, no jargon.
7. If symptoms are vague, default to General Practitioner. Prefer "soon" over "routine" if symptoms are painful, worsening, or persistent.
8. Also provide "doctor_summary_de": ONE short sentence in GERMAN summarising the symptoms for the doctor (e.g. "Patient hat seit 3 Tagen Kopfschmerzen, keine weiteren Symptome.").

Return ONLY valid JSON, no extra text or markdown:
{"recommended_doctor_type":"string","urgency":"routine|soon|emergency","referral_required":true,"needs_human_review":false,"explanation_for_user":"string","doctor_summary_de":"string"}
```

**User Message** (Source for Prompt = "Define below"):

```
Symptoms: "{{ $json.symptoms }}"
Language: {{ $json.language }}
```

> ⚠️ **Groq + Structured Output Parser is unreliable** (Llama wraps JSON in ```` ```json ````
> fences → the parser errors with "Error in sub-node 'Structured Output Parser'").
> **Recommended:** turn OFF "Require Specific Output Format", delete the parser, and
> add a **Code node** (Run Once for Each Item) right after the AI Agent:
>
> ```js
> let t = ($json.output || "").trim();
> t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
> let parsed;
> try {
>   parsed = JSON.parse(t);                 // clean JSON case
> } catch (e) {
>   // Fallback: Groq sometimes returns "Key: value" lines, not JSON
>   const get = (k) => {
>     const m = t.match(new RegExp(k + '\\s*[:=]\\s*"?([^"\\n]+)"?', "i"));
>     return m ? m[1].trim() : null;
>   };
>   parsed = {
>     recommended_doctor_type: get("recommended_doctor_type") || "General Practitioner",
>     urgency: (get("urgency") || "routine").toLowerCase(),
>     referral_required: /true/i.test(get("referral_required") || ""),
>     needs_human_review: /true/i.test(get("needs_human_review") || ""),
>     explanation_for_user: get("explanation_for_user") || t,
>     doctor_summary_de: get("doctor_summary_de") || ""
>   };
> }
> return { json: parsed };
> ```
>
> Then downstream nodes read clean top-level fields: `{{ $json.urgency }}`,
> `{{ $json.recommended_doctor_type }}`, etc.
>
> **Also reference the webhook explicitly** in the AI Agent's User Message (it sits after
> the Supabase "get profile" node, so `{{ $json.symptoms }}` would be empty there):
> `Symptoms: "{{ $('Webhook').item.json.body.symptoms }}"` and
> `Language: {{ $('Webhook').item.json.body.language }}`.
>
> The schema below is only needed if you DO use the parser:

```json
{
  "type": "object",
  "properties": {
    "recommended_doctor_type": { "type": "string" },
    "urgency": { "type": "string", "enum": ["routine", "soon", "emergency"] },
    "referral_required": { "type": "boolean" },
    "needs_human_review": { "type": "boolean" },
    "explanation_for_user": { "type": "string" },
    "doctor_summary_de": { "type": "string" }
  },
  "required": ["recommended_doctor_type", "urgency", "referral_required", "needs_human_review", "explanation_for_user"]
}
```

### Flow

```
[Webhook] → [Set] → [Supabase: get profile]
                          ▼
                  [AI Agent: triage (Groq)]
                          ▼
                  [Switch: urgency?]
        emergency ──► [Set: call 112] ──┐
        soon/routine ► [Supabase: insert consultation] ─┤
                                                         ▼
                                              [Respond to Webhook]
```

### How the app's symptom.html will call it (next sprint)

```js
const res = await fetch("http://localhost:5678/webhook/symptom-check", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ user_id: currentUserId, symptoms: text, language: currentProfile.language })
});
const r = await res.json();
// show r.recommended_doctor_type, r.urgency, r.explanation_for_user
// if r.urgency === "emergency" -> show the red 112 alert
```

This is the hook from the homepage's **Symptom Checker** button → `symptom.html` →
this n8n webhook → AI → back to the screen.

---

## Build Order (Recommended)

1. **Workflow B first** — it's the "wow" demo (symptoms → AI doctor type). You already
   proved the AI Agent + Groq works; this just wraps it in a Webhook + Switch + Supabase.
2. **Workflow A second** — quick to add; mirrors registration for completeness.
3. Then build **`symptom.html`** in the app and point the Symptom Checker button at it.

## Notes & Gotchas

- **Webhook URLs (self-hosted):** test mode = `http://localhost:5678/webhook-test/<path>`,
  active/production = `http://localhost:5678/webhook/<path>`. Activate the workflow for the
  production URL.
- **service_role key** goes in n8n's Supabase credential only (bypasses RLS for inserts).
- **Browser → localhost n8n** works when both run on the same machine (your demo setup).
- The app keeps doing the **real auth**; n8n mirrors the **process** — that's the
  deliberate front-end / orchestration split from the main project doc.

---

*Companion to: MDT_25-27_Change Process MGT_AI Health Insurance SaaS.md*
*Build target: self-hosted n8n (npx n8n) + Supabase "insurance" project + Groq AI.*
