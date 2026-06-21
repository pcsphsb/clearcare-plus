# BUSINESS PROCESS TRANSFORMATION: AI-FIRST HEALTH INSURANCE NAVIGATION FOR IMMIGRANTS IN GERMANY

### Software as a Service (SaaS) | Change and Process Management

> **Design Principle:** This is an AI-first company. Every process step that can be handled by AI, must be handled by AI. Human intervention is the exception, not the default.

---

## 1. The Problem - Bigger Than a Language Barrier

When a non-German-speaking immigrant arrives in Germany and needs medical help, they face not one barrier but an entire chain of unfamiliar process steps:

- **Insurance confusion:** Germany has two systems (statutory/GKV and private/PKV) with different rules, coverages, and doctor networks - explained entirely in German.
- **Referral dependency:** Most specialists require a GP referral (*Überweisung*) first. Immigrants who don't know this get turned away.
- **Finding the right doctor:** Not all doctors accept all insurance types. Not all speak English. Availability varies by region and waitlist.
- **The booking wall:** Even when a doctor is found, booking typically requires a phone call - in German - to a receptionist who may not speak English.
- **No guidance on what happens next:** Post-appointment follow-up, prescriptions, and specialist referrals are equally opaque.

**The result:** Immigrants delay seeking care, navigate incorrectly, or give up entirely. This is a process failure - not a personal one.

**Student Experience:** One of the students personally had to call for an appointment to the insurance provider as the insurance had English support, however, this still caused a few problems such as waiting times and the possibility of not being heard well through the phone. These middlemen for booking appointments also cause inefficiency in time saving as they are managing the same service for hundreds and thousands of other customers who are reuqesting different types of doctors. It would be better if the user has direct access in booking the appointment to a doctor, or rather digitizing and automating the process and removing the manual phone call and manul entry logging and searching.

---

## 2. The Benchmark - What TK Already Does (and Where It Stops)

**TK Insurance** (Techniker Krankenkasse) is the closest existing model. Its **TK-Doc app** offers:

| TK Feature          | What it does                                             | Where it falls short                                   |
| ------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| Symptom Checker     | AI/chatbot triage                                        | Isolated - does not connect to booking                 |
| Doctor Locator      | Filter by location, language, specialty                  | Manual search; user must interpret results             |
| Video Consultation  | Click-through filter to select practitioner              | Limited specialist range; German-first UX              |
| Appointment Booking | Handled by a human customer service agent via phone call | Slow, language-dependent, not scalable, not integrated |

**The critical gap:** TK's services are separate modules, not a connected end-to-end process. The booking step still requires a human phone call - which is precisely where non-German speakers drop off.

Our product eliminates that drop-off by making the entire journey a single, AI-driven, language-agnostic flow.

---

## 3. The Solution - What We Are Building

An **AI-first health navigation SaaS** that takes an immigrant from *"I don't feel well"* to *"appointment confirmed"* in their own language, without a single phone call or manual search.

**Name concept:** ClearCare+

**What makes it different from TK:**

|                       | TK-Doc           | ClearCare                                                                                                                                                                               |
| --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Services              | Separate modules | Single connected flow                                                                                                                                                                   |
| Booking               | Human phone call | Fully AI-automated, to be confirmed by user                                                                                                                                             |
| Language support      | German-first     | Language-first by design                                                                                                                                                                |
| Insurance explanation | None             | AI policy interpreter built in (For future sprint)                                                                                                                                      |
| Referral guidance     | None             | AI navigates referral chain (Active)                                                                                                                                                    |
| Post-appointment      | None             | AI follow-up and prescription tracker<br />(Rescheduling/Rebooking and Cancellation live, <br />prescriptions and other features for future sprint)                                     |
| User profile          | Basic            | Targeted user profile that drives every recommendation.<br />Features users can change the filters on the menu itself <br />or on the process before AI triggers to search for doctors. |

---

## 4. Core Value Proposition

> **For newly arrived immigrants in Germany, ClearCare replaces the confusing, German-language process of finding and booking a doctor with a single, AI-guided, end-to-end experience in the user's own language - from symptom to confirmed appointment, without a single phone call.**

Three layers of value:

- **Language:** The entire app experience, including doctor matching, is filtered by the user's language preference from the first screen. Furthermore, the AI Chatbot responds in the user's targeted language based on settings (still does not matter if you speak in English, it will reply in Spanish if you had chosen Spanish settings or vice versa)
- **Process:** AI connects every step that TK leaves disconnected - triage feeds into matching, matching feeds into booking, booking feeds into follow-up.
- **(Future Value) Understanding:** An AI policy explainer tells users in plain language what their insurance covers based on what is referred/available, what a referral is (already existing as a small footnote during the AI Chatbot interface), and what to expect - eliminating the knowledge gap that causes delays.

---

## 5. How We Deliver Value - AI at Every Step

The following maps every process step to its AI responsibility:

| Process Step         | Traditional (TK/Manual)             | ClearCare AI Action                                                                                                                  |
| -------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Onboarding           | Manual form filling                 | Manual form filling however the data saves automates the other processes<br />and only extracts insurance type, location, language. |
| Symptom triage       | Separate chatbot, no follow-through | AI triage engine assesses symptoms and recommends care level (GP, specialist, urgent care, or ER)                                    |
| Referral navigation  | User is unaware of the system       | AI explains whether a referral is needed and, if so, books the GP appointment first automatically                                    |
| Doctor matching      | Manual filter search                | AI matches based on: language, insurance acceptance, specialty, location, availability, and user ratings                             |
| Appointment booking  | Human phone call in German          | AI automated booking via API integration with doctor scheduling systems - no phone call required                                     |
| Confirmation & prep  | None                                | AI sends appointment confirmation, location info, what to bring, and language tips                                                   |
| *Post-appointment* | *None*                            | *AI follow-up (future feature): prescription tracking, referral next steps, feedback collection*                                   |

---

## 6. Customer Journey Map

The user's emotional and practical experience from first contact to post-care:

```
TRIGGER → ONBOARDING → UNDERSTAND → TRIAGE → MATCH → BOOK → ATTEND → FOLLOW-UP
```

### Stage-by-Stage Breakdown

**Stage 1 - Trigger**

- User feels unwell or needs a check-up.
- Opens ClearCare app.
- *Emotional state: uncertain, possibly anxious, unfamiliar with the system.*

**Stage 2 - Onboarding (AI-driven, one-time)**

- AI guides user through a conversational profile setup: language preference, insurance type (GKV/PKV), provider name, location, and basic medical history.
- Profile is stored and drives all future recommendations automatically.
- *Pain point eliminated: no confusing forms; no German required.*

**Stage 3 - Insurance Understanding (AI policy explainer)**

- AI surfaces a plain-language summary of what the user's insurance covers relevant to their current need.
  - Future feature includes the udnerstanding of insurance policies, however, a small footnote regarding the need for a General practitioner is presented to the user so they understand they must go to a General Practitioner first before getting a specialist doctor.
- Flags if a GP referral is required before seeing a specialist.
- *Pain point eliminated: user no longer needs to read a German policy document.*

**Stage 4 - Symptom Triage (AI triage engine)**

- User describes symptoms in their own language via chat or voice.
- AI recommends: GP visit / specialist / urgent care / emergency room.
- If referral needed: AI queues a GP booking first before specialist search.
- *Pain point eliminated: user is guided, not left to guess the correct care pathway.*

**Stage 5 - Doctor Matching (AI recommendation engine)**

- AI presents a shortlist of matched doctors: filtered by language, insurance acceptance, specialty, proximity, and availability.
- Each result shows: languages spoken, earliest slot, distance, and user ratings.
- User selects preferred doctor with one tap.
- *Pain point eliminated: no manual search; no filtering in German.*

**Stage 6 - Booking (AI automated)**

- AI calls or API-connects to the doctor's scheduling system and books the selected slot.
- User receives an in-app confirmation in their language.
- No phone call. No German. No waiting.
- *Pain point eliminated: the single biggest drop-off point in the current process is removed.*

**Stage 7 - Appointment Preparation (AI notification)**

- 24 hours before: AI sends location, what documents to bring (insurance card, referral letter if applicable), and a brief note on what to expect at a German doctor's office.
  - Future feature involves appointment preparation such as utilizing a Maps API for for proper directions to the suer to the clinic, etc.
- *Pain point eliminated: first-time uncertainty at the clinic.*

**Stage 8 - Post-Appointment Follow-Up (AI follow-up)**

- AI prompts user to log prescription details for tracking.
- If a specialist referral was issued, AI initiates the next booking flow automatically.
  - Future features include a comprehensive post-appointment experience. Currently, only reschedulign and cancellation are integrated, nonetheles,s continuity of suer experience is prioritized.
- User can rate the experience; feedback is used to refine doctor matching.
- *Pain point eliminated: the process doesn't end at the appointment - continuity of care is maintained.*

---

## 7. Process Journey Map

### 7.1 Core Process - The Primary Value-Creating Flow

```
User Profile Setup → Triage → Doctor Match → Booking → Confirmation → Follow-Up
```

This is the end-to-end flow the user directly experiences. Every step is AI-executed. Human staff are only triggered as escalation exceptions (e.g., if AI cannot find an available match in the area).

### 7.2 Management Process - Running the Business Behind the App

| Management Process              | Description                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Doctor Network Management       | Onboarding and vetting doctors/clinics to the platform; verifying language capabilities, insurance acceptance, and scheduling API availability.<br />**For the Demo Presentation:**<br />- Students downloaded data on publicly available databases, however there are limits to the types of data that can be extracted <br />(no insurance data, and limited opening hours data, and some do not present language capabilities). |
| Quality & Compliance Monitoring | Ensuring GDPR compliance on health data; monitoring AI recommendation accuracy; auditing booking success rates.<br />**For the Demo Presentation:**<br />- As the data is from real doctors, their contacts are stripped to ensure that the app does not actually communciate with them during testing.                                                                                                                            |
| AI Model Governance             | Regular review of triage accuracy, matching algorithm performance, and policy interpretation correctness - with human expert validation.<br />**For the Demo Presentation:**<br />- Specific prompts are drafted and engineered to ensure the AI responds accoridngly only to what is necessary.                                                                                                                                   |
| Partner Insurance Integration   | Maintaining API connections with GKV and PKV providers to verify user coverage in real time.<br />**For Demo Presnetation:**<br />- This is still a future value that is yet to be explored for the demo, however, is important to map out if it leaves the demo phase.                                                                                                                                                            |
| Performance Reporting           | Dashboards tracking: bookings completed, drop-off points, average time from symptom to appointment, user satisfaction scores.<br />**For Demo Presentation:**<br />- Currently, no dashboards are present and the students can only manually run analytics based on the supabase content.<br />- in the future, the ones running the database and application must have a company-facing dashboard to observe user behavior.       |

### 7.3 Support Process - What Enables the Core to Run

| Support Process                     | Description                                                                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customer Support (human escalation) | Available for edge cases the AI cannot resolve - but routed through in-app chat first, not phone.<br />**For Demo Presentation:**<br />- For future integration. |
| Doctor Scheduling API Maintenance   | Technical upkeep of integrations with clinic booking systems.<br />**For Demo Presentation:**<br />- For future integration.                                     |
| Language Model Updates              | Expanding language support and medical vocabulary accuracy in AI triage and matching.<br />**For Demo Presentation:**<br />- For future integration.             |
| User Feedback Loop                  | Post-appointment ratings and complaints feed back into the matching and triage models.<br />**For Demo Presentation:**<br />- For future integration.            |
| Onboarding Support for Clinics      | Helping partner clinics connect their scheduling systems to the platform.<br />**For Demo Presentation:**<br />- For future integration.                         |

---

## 8. BPMN 2.0 - AI Integration Points (Designed vs. Delivered)

The following maps each element of the standard BPMN flow to its **responsible party** and to **what was actually built and pushed to GitHub**. The design intent (every step that can be AI, is AI) is preserved; the *Status* column is the honest reality of the prototype.

**Legend:** ✅ Live (built & pushed) · 🟡 Partial (core built, parts deferred) · 🔵 Future scope (designed, not yet built).

| BPMN Element                      | Process Step                               | Responsible Party   | Status & As-Built Behaviour                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Start Event**             | User opens app / logs in                   | System              | ✅`index.html` - Supabase Auth register/login; new user picks language.                                                                                                                                             |
| **User Task**               | Language & profile setup                   | User + System       | ✅ Live, but a**manual form** (`homepage.html`: insurance, postcode, city), *not* a conversational AI agent. Saved to `profiles`.                                                                         |
| **Service Task**            | Insurance policy retrieval                 | AI                  | 🔵 Future - no insurer API connected;`INSURANCE_FILTER_ENABLED = false` scaffold awaits coverage data.                                                                                                              |
| **Gateway (XOR)**           | Referral required?                         | AI decision         | 🟡 Triage returns a `referral_required` flag + an in-chat footnote that German specialists need a GP *Überweisung*; **automatic GP pre-booking is not built**.                                             |
| **Service Task**            | Symptom triage (navigation, not diagnosis) | AI                  | ✅ Live -**Groq** LLM via the `symptom-check` Edge Function (or n8n Medical Triage Agent). Returns care type, never a diagnosis.                                                                              |
| **Gateway (XOR)**           | Urgent care needed?                        | AI decision         | ✅ Live - triage classifies `urgency` as routine / soon / emergency; emergency surfaces 112 guidance.                                                                                                               |
| **Manual Task (safeguard)** | High-stakes routing review (ER vs. GP)     | Human (in-the-loop) | 🟡**Scaffolded** - the `needs_human_review` flag is produced and stored, and the n8n flow has a `Send and Wait` node; a live human reviewer is **not staffed** in the demo.                           |
| **Service Task**            | Doctor matching                            | AI + System         | ✅ Live - DB-first query of the imported `doctors` table (filtered by postcode/city, language, specialty) with a live **OSM fallback**.                                                                       |
| **User Task**               | Doctor selection                           | User                | ✅ Live - one-tap selection from the pre-filtered list (`doctors.html`).                                                                                                                                            |
| **Service Task**            | Appointment booking                        | AI + System         | ✅ Live - writes to the `appointments` table (direct Supabase or n8n). **No AI voice call** - the `ArztAPI` paid-booking path is a `false` scaffold.                                                      |
| **Gateway (XOR)**           | Booking successful?                        | System              | ✅ Live - 0-row writes are surfaced (no false "saved"); closed-day/invalid slots rejected with a clear message.                                                                                                       |
| **Service Task**            | Confirmation & prep notification           | AI + System         | 🟡 In-app confirmation is read back from the saved row (live).**No outbound email is sent** and no multilingual prep message; doctors without hours get an `mailto:` draft to the **user's own** inbox. |
| **Intermediate Event**      | Appointment day reminder                   | System timer        | 🔵 Future - no 24h reminder/scheduler built.                                                                                                                                                                          |
| **Service Task**            | Post-appointment follow-up                 | AI                  | 🟡**Reschedule and Cancel are live** (with audit logs); prescription logging, referral chaining, and feedback collection are future scope.                                                                      |
| **End Event**               | Care cycle complete                        | System              | ✅ Live - booking persisted; cancellations/reschedules archived to audit tables.                                                                                                                                      |
| **Exception Flow**          | AI cannot resolve                          | Human agent         | 🔵 Future - human escalation/customer support not staffed (documented in §7.3 as future integration).                                                                                                                |

> **As built:** of the 16 BPMN elements, **9 are live**, **4 partially delivered**, and **3 are future scope**. The AI-first claim holds where it matters most - **triage, matching, and booking are all AI/automated and connected end-to-end** - while the heavier steps (insurer API, staffed human safeguard, reminders, follow-up) are honestly flagged as not-yet-built rather than overclaimed.

---

## 9. Regulatory, Compliance & Governance

An AI-first health platform operating in Germany sits at the intersection of two of the EU's strictest regimes: the **GDPR** (data protection) and the **EU AI Act** (AI risk regulation), with the **Medical Device Regulation (MDR)** lurking behind the triage feature. Treating compliance as a *designed process* - not an afterthought - is core to this project.

### 9.1 The Two Regimes at a Glance

| Component                  | Governing regime                                  | Risk level     | Burden                                           |
| -------------------------- | ------------------------------------------------- | -------------- | ------------------------------------------------ |
| Doctor matching            | EU AI Act (limited risk)                          | Low            | Transparency labels                              |
| Automated booking          | GDPR (Art. 22)                                    | Low–Medium    | Consent + optional human override                |
| Insurance/policy explainer | GDPR                                              | Medium         | Consent, output accuracy                         |
| **Symptom triage**   | **EU AI Act (potentially high-risk) + MDR** | **High** | **Conformity assessment, human oversight** |
| All health data handling   | GDPR (Art. 9) + DPIA                              | High           | Explicit consent, DPIA, data minimization        |

**Key insight:** The regulatory burden is *concentrated in one feature* - the triage engine. The core differentiator (matching + automated booking) is comparatively low-risk. This shapes the entire compliance strategy.

### 9.2 GDPR Obligations

- **Special category data (Art. 9):** Health data is prohibited to process by default. Our legal basis is **explicit, opt-in, informed consent**, captured separately from general terms.
- **DPIA (mandatory):** Large-scale processing of special-category data triggers a required Data Protection Impact Assessment *before* launch. This is a hard gate, not optional documentation.
- **Data minimization:** Each process step collects only the data it needs - directly tempering the AI-first instinct to gather everything.
- **Article 22 (automated decisions):** Users have the right not to be subject to solely automated decisions with significant effects. Low-stakes steps (booking) remain fully automated; high-stakes routing (e.g., ER vs. GP) is designed to pass through the **human-in-the-loop safeguard** in the BPMN above. *As built,* the safeguard exists as a `needs_human_review` flag and an n8n `Send and Wait` node (the hook is real and traceable); a staffed human reviewer is future operational scope, not part of the demo.

### 9.3 EU AI Act Obligations

- **Triage = the high-risk question.** If the triage AI is deemed to make medical recommendations, it can be classified as a medical device under MDR, which pulls it into the AI Act's **high-risk tier** (conformity assessment, risk management system, technical documentation, logging, human oversight, registration).
- **Our mitigation - "navigation, not diagnosis":** The triage engine recommends *which type of care to seek*, never *what condition the user has*. This positions it as an informational/navigational tool, aiming to stay clear of medical-device classification. This is a contested legal line, so it is paired with the human-in-the-loop safeguard rather than relied on alone.
- **Transparency (limited-risk obligations):** Users are always told when they are interacting with AI, and AI-generated outputs are clearly labeled.

### 9.4 Compliance by Design - A Named Management Process

Compliance is embedded as an ongoing **management process** (added to Section 7.2), not a one-time legal review:

| Governance Function         | Owner                   | Responsibility                                                                         |
| --------------------------- | ----------------------- | -------------------------------------------------------------------------------------- |
| Data Protection (DPO)       | Data Protection Officer | Maintains DPIA, consent records, breach response; GDPR point of contact                |
| AI Risk Classification      | AI Governance Lead      | Monitors whether features cross into high-risk/medical-device territory as they evolve |
| Human Oversight             | Clinical/Operations     | Staffs and audits the human-in-the-loop triage safeguard                               |
| Audit & Logging             | Engineering             | Maintains decision logs for AI Act traceability and accountability                     |
| Regulatory Horizon Scanning | Compliance Lead         | Tracks AI Act phased deadlines and MDR guidance changes                                |

### 9.5 Strategic Takeaway

The EU AI Act and GDPR are a **meaningful but navigable** obstacle. Crucially, they are *survivable without abandoning the AI-first model* - because only one feature carries the heavy burden, and it can be ring-fenced with a human safeguard and careful "navigation, not diagnosis" framing. For a process management perspective, regulation becomes a **set of designed process steps and governance roles**, which raises the maturity of the overall design rather than blocking it.

### 9.6 Compliance - Delivered vs. Future (Prototype Reality Check)

To keep the analysis honest, here is which compliance control is *actually wired into the GitHub build* versus *documented for a real launch*:

| Compliance control                       | Status in prototype | How it shows up in the build                                                                                                        |
| ---------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| "Navigation, not diagnosis" framing      | ✅ Live             | Enforced in the Groq triage system prompt (`symptom-check`): recommends a doctor *type* only, refuses to diagnose.              |
| Emergency escalation (112 guidance)      | ✅ Live             | Triage sets `urgency: emergency` + `needs_human_review`; the UI surfaces emergency guidance.                                    |
| AI Act audit log / decision traceability | ✅ Live             | Every triage decision is written to the `consultations` table (symptoms, recommendation, urgency, `needs_human_review`).        |
| Data minimization                        | ✅ Live (by design) | Onboarding stores only insurance type, postcode/city, language; doctor contacts are stripped so the app can't reach real practices. |
| RLS / data isolation                     | ✅ Live             | Per-user Row-Level Security on `appointments`; audit tables are INSERT-only and invisible to users (see System Overview §5).     |
| Explicit consent capture (Art. 9)        | 🔵 Future           | No separate opt-in consent screen yet - required before any real health-data processing.                                            |
| Human-in-the-loop reviewer (Art. 22)     | 🟡 Scaffolded       | Flag + n8n `Send and Wait` node exist; no staffed reviewer.                                                                       |
| DPIA / DPO / conformity assessment       | 🔵 Future           | Organizational/legal artifacts - documented as governance roles (§9.4), not implemented in a class prototype.                      |

> **Takeaway for the write-up:** the prototype already demonstrates the *technical* compliance hooks (prompt safeguards, audit logging, data minimization, RLS). The *organizational* controls (DPIA, DPO, staffed oversight, consent UX) are correctly scoped as launch prerequisites - which is itself the compliance-by-design point of §9.4.

---

## 10. Build Approach - Prototyping the Process in n8n

**n8n** is a workflow automation platform that connects services together using visual "nodes" (triggers, logic, AI, API calls). It is an excellent fit for **building and demonstrating the orchestration layer** of this product - the engine that connects triage → matching → booking → follow-up - without writing a full application from scratch.

> **As delivered (GitHub):** the project shipped **two interchangeable engines**, selected by a single `USE_N8N` flag in `script.js`:
>
> - `USE_N8N = false` (default) - a **standalone** engine: a real static front-end (`index/homepage/symptom/doctors/booking.html`) talking to **Supabase** (Auth + Postgres) and two **Edge Functions** (`symptom-check` → Groq, `find-doctors` → OpenStreetMap).
> - `USE_N8N = true` - the same three steps route through one consolidated **n8n workflow** (26 nodes, three webhook entry points) for the live "watch the engine run" demo.
>
> So the n8n orchestration described below is real and importable, *and* it has a fully working non-n8n twin. The AI engine actually used is **Groq** (not Anthropic Claude as the early draft below suggested); the sample prompt in §10.9 is engine-agnostic and runs as the Groq system prompt.

### 10.1 What n8n Is (and Isn't) Good For Here

| n8n is great for...                               | n8n is NOT the place for...                                  |
| ------------------------------------------------- | ------------------------------------------------------------ |
| The backend orchestration / "process brain"       | The polished consumer-facing mobile UI                       |
| Connecting AI + external APIs (insurers, clinics) | High-volume, millisecond-latency production traffic          |
| Rapid MVP / proof-of-concept for a class demo     | Storing sensitive health data long-term (use a compliant DB) |
| Visualizing the workflow (mirrors your BPMN)      | Replacing a dedicated medical-device-grade system            |

> **Honest framing for your project:** n8n lets you *prototype the entire process flow* and prove the AI-first concept works end-to-end. In a real launch, the consumer app (the UI) would be a separate mobile/web front-end that *calls* this n8n-orchestrated backend via a webhook.

### 10.2 Mapping the Process to n8n Nodes

Each BPMN step from Section 8 maps to a specific type of n8n node:

**Status legend:** ✅ built in the delivered workflow · 🟡 partial · 🔵 designed, not built.

| Process Step                   | n8n Node                                                      | What it does / As-built note                                                                         |
| ------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| User opens app / sends request | **Webhook** (Chat Trigger)                              | ✅ Three webhook entry points (`symptom-check`, `find-doctors`, `book-appointment`).           |
| Profile & language onboarding  | **AI Agent** node                                       | 🟡 As built this is a**manual form** in the front-end → Supabase; not a conversational agent. |
| Store profile                  | **Postgres / Supabase** node                            | ✅ Saved to the `profiles` table (Supabase Auth-owned).                                            |
| Insurance policy retrieval     | **HTTP Request** node                                   | 🔵 No insurer API connected.                                                                         |
| Policy explanation             | **Basic LLM Chain** node                                | 🔵 Future - no policy explainer built.                                                               |
| Referral required?             | **IF** node                                             | 🟡`referral_required` flag produced; no automatic GP-first branch.                                 |
| Symptom triage (navigation)    | **AI Agent** node (**Groq** Medical Triage Agent) | ✅ Core demo - classifies*which type of care* is needed.                                           |
| Urgent care needed?            | **Switch / Route by Urgency** node                      | ✅ Routes emergency vs. standard; emergency branch surfaces 112.                                     |
| High-risk routing safeguard    | **Send and Wait for Response** node                     | 🟡 Node exists; reviewer not staffed (GDPR Art. 22 hook).                                            |
| Doctor matching                | **HTTP Request** + normalize                            | ✅ Queries the `doctors` table, OSM (Nominatim + Overpass) fallback.                               |
| Doctor selection               | Front-end list response                                       | ✅ User taps from the pre-filtered list.                                                             |
| Appointment booking            | **Supabase / HTTP Request** node                        | ✅ Writes to `appointments`. (No clinic scheduling API - that's ArztAPI future scope.)             |
| Booking successful?            | **IF** node                                             | ✅ Success/failure handled; closed-day slots rejected.                                               |
| Confirmation & prep            | In-app (saved row)                                            | 🟡 Confirmation shown from the saved row;**email/SMTP nodes were removed** (no outbound mail). |
| Appointment reminder           | **Schedule Trigger** / **Wait** node              | 🔵 Future - no 24h reminder built.                                                                   |
| Post-appointment follow-up     | **AI Agent** + **Postgres**                       | 🟡 Reschedule/cancel live (with audit tables); prescription/feedback future.                         |

### 10.3 The Flow Visualized

```
[Chat Trigger]
      │
      ▼
[AI Agent: Onboarding] ──► [Postgres: Save Profile]
      │
      ▼
[HTTP: Get Insurance] ──► [LLM Chain: Explain Policy]
      │
      ▼
[IF: Referral needed?] ──Yes──► [Book GP first]
      │ No
      ▼
[AI Agent: Triage]
      │
      ▼
[Switch: Care level?] ──Urgent──► [Send & Wait: Human approval]
      │ Standard                         │
      ▼                                  ▼
[HTTP + AI: Match Doctor] ◄──────────────┘
      │
      ▼
[Form: User selects doctor]
      │
      ▼
[HTTP: Book Appointment] ──► [IF: Success?] ──No──► (loop: next slot)
      │ Yes
      ▼
[Send: Confirmation] ──► [Wait: 24h] ──► [Send: Reminder]
      │
      ▼
[AI Agent: Follow-up] ──► [Postgres: Log outcome]
```

### 10.4 Why This Matters for the Project

- **It makes the AI-first claim tangible.** Every AI Agent / LLM Chain node *is* an AI-responsible step from your BPMN - you can literally point at them.
- **It shows the human-in-the-loop safeguard as a real node** (Send and Wait for Response), not just a policy promise - directly addressing the GDPR Art. 22 requirement.
- **It mirrors your BPMN diagram**, so your process map and your build approach tell the same story.
- **It's demo-able.** For a class, you could build a stripped-down version of even 3–4 nodes to show the concept working live.

### 10.5 Build Phases

| Phase               | Goal                             | n8n Scope                                   | Status (as delivered)                                                                                                                     |
| ------------------- | -------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Proof of Concept | Show triage → matching works    | 3–4 nodes, mock data                       | ✅**Done** - and surpassed (mock data replaced with real imported doctors).                                                         |
| 2. Prototype        | Full flow with real APIs         | All nodes, test insurer/clinic APIs         | ✅**Done** - full flow live on real Groq + OSM; insurer/clinic APIs still 🔵.                                                       |
| 3. Pilot            | Connect a real front-end         | n8n as backend via webhook; UI calls it     | ✅**Done** - a real static front-end calls the backend (standalone *and* n8n).                                                    |
| 4. Scale            | Migrate hot paths to custom code | Keep n8n for orchestration, harden the rest | 🟡**Partial** - the standalone Supabase + Edge Function path *is* the hardened twin of n8n; production hosting/scaling is future. |

> **Where the project landed:** the build reached Phase 3 (working front-end on a real backend) with elements of Phase 4 (the standalone engine is the non-n8n production-style path). The remaining future work is external integrations (insurer/clinic APIs) and production hosting, not the core flow.

### 10.6 Front-End vs. Back-End - Who Builds What

This product is a **full-stack application**: a front-end the user touches, and a back-end that does the work. The two are built with different tools and connected by an API call.

```
┌─────────────────────────────────────────────────────────┐
│                      FRONT-END                          │
│              (What the user sees & touches)             │
│                                                         │
│   HTML  → structure (chat box, forms, doctor list)      │
│   CSS   → look & feel (layout, colors, clarity)         │
│   JS    → interactivity (taps, validation, display)     │
└─────────────────────────────────────────────────────────┘
                          │
                          │  HTTP request  (e.g. "Book this slot")
                          ▼
                  ┌───────────────┐
                  │  n8n WEBHOOK  │   ← the doorway into the back-end
                  └───────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                       BACK-END                          │
│            (The process brain - user never sees)        │
│                                                         │
│   n8n workflow → triage, AI matching, booking,          │
│                  insurer API calls, human safeguard,    │
│                  follow-up automation                   │
│   Database     → stores user profile, outcomes          │
└─────────────────────────────────────────────────────────┘
                          │
                          │  JSON response  (e.g. "Appointment confirmed")
                          ▼
              back up to the FRONT-END to display
```

| Layer                | Tool                          | Responsibility                                                                 |
| -------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| **Front-End**  | HTML / CSS / JavaScript       | The user interface - screens, forms, displaying AI responses, sending requests |
| **Connection** | HTTP request ↔ JSON response | The messenger that carries data between the two layers                         |
| **Back-End**   | n8n (+ database)              | The business logic and automation - triage, matching, booking, follow-up       |

> **The mental model:** HTML/CSS/JS is the *face*. n8n is the *engine*. An API call is the *messenger* between them. Together they form the full stack.

### 10.7 Refined Process Flow (v2) & Prototype Scope

This is the corrected flow based on the v1 BPMN draft. **Three fixes were applied:**

1. The **"First Time?" gateway now gates the Survey** (profile setup is one-time), not the symptoms.
2. **Symptoms + AI triage now run on every visit** (symptoms change each time), which is the logically correct path.
3. **Availability is captured BEFORE the doctor list** (v3 fix), so the list is pre-filtered to doctors who can actually see the user in their preferred window - instead of letting the user pick a doctor and hit a dead end with no matching slots.

```
                          ┌─────────────────────────────┐
   ● START                │  PROTOTYPE SCOPE (build it) │
   User clicks            └─────────────────────────────┘
   "Insurance Help"
        │
        ▼
   ◇ First Time? ──Yes──► [Survey: General Data, Company, Language]
        │ No                          │
        │  ◄─────────────────────────-┘
        ▼
   [Ask for Symptoms]                         ── every visit
        │
        ▼
   [AI: Recommend specific type of Doctor]    ◄── CORE AI STEP
        │
        ▼
   [⏸ Human-in-the-loop check]  (optional, GDPR Art. 22 safeguard)
        │
        ▼
   [Ask for Availability]   ◄── NEW: when can the user go?
   (e.g. mornings / this week / weekends)         (days + time-of-day window)
        │
        ▼
   [Database: Retrieve possible doctors]      ◄── mock data for demo
   FILTERED by: doctor type + language +           (availability narrows the list)
   insurance + AVAILABILITY match
        │
        ▼
   [User: Select a Doctor]   ◄── every doctor shown already fits the user's window
        │
        ▼
 ┌───────────────────────────────────────────────────────────┐
 │            FUTURE SCOPE (mock / simplify for demo)        │
 │                                                           │
 │  [Outlook + Outlook Calendar: check next-day availability]│
 │       │                                                   │
 │       ▼                                                   │
 │  [User: Select Appointment Date]                          │
 │       │                                                   │
 │       ▼                                                   │
 │  Send Confirmation  →  ● END                              |
 └───────────────────────────────────────────────────────────┘
```

### 10.8 What We Actually Build in 1 Week vs. Future Scope

| Process Step                            | Status                           | How (in the prototype)                                                                         |
| --------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------- |
| User entry (Insurance Help)             | ✅**Prototype**            | n8n Chat Trigger / Webhook                                                                     |
| First Time? gateway                     | ✅**Prototype**            | n8n IF node                                                                                    |
| Survey (profile)                        | ✅**Prototype**            | n8n Form / AI Agent                                                                            |
| Ask for Symptoms                        | ✅**Prototype**            | n8n Chat / AI Agent                                                                            |
| **AI doctor-type recommendation** | ✅**Prototype (core)**     | n8n AI Agent (Groq)                                                                            |
| Human-in-the-loop safeguard             | ✅**Prototype (optional)** | Branching from the Emergency                                                                   |
| **Ask for availability**          | ✅**Prototype**            | n8n Form (days + time-of-day preference)                                                       |
| Retrieve possible doctors               | ✅**Prototype**            | **Basic/Simplified doctor list**, filtered by type + language + insurance + availability |
| Select a Doctor                         | ✅**Prototype**            | n8n Form response (only doctors that fit the window are shown)                                 |
| Outlook calendar availability           | 🔵**Future Scope**         | Real Outlook OAuth -*mocked as sample slots for demo*                                        |
| Select Appointment Date                 | 🔵**Future Scope**         | Simplified pick from mock slots                                                                |
| Send Confirmation                       | ✅**Prototype**            | n8n Send Email node                                                                            |

> **Prototype deliverable for this course:** a working n8n flow demonstrating **Symptoms → AI doctor-type recommendation → match against a doctor list → confirmation**. 
>
> The Outlook/real-calendar booking integration is documented as **future production scope**, since live OAuth integration is out of reach for a 1-week build.
>
> **Update (as delivered):** the mock doctor list was replaced with real data. Doctor matching now queries an imported `doctors` table (primary) with a live OpenStreetMap fallback for areas outside the dataset. Booking, reschedule, and cancel are also built, and a booked appointment links back to its doctor row via a `doctor_id` foreign key. See the System Overview for the live data model.

### 10.9 Sample AI Triage Prompt (for the n8n AI Agent Node)

This is the **system prompt** delivered in the AI Agent node. In the shipped build the triage model is **Groq** (the n8n "Medical Triage Agent" node, and the `symptom-check` Edge Function in standalone mode); the prompt is model-agnostic and would run the same way on any capable LLM. It turns a user's symptoms + profile into a structured doctor-type recommendation - framed as **navigation, not diagnosis** to stay clear of medical-device classification (see Section 9.3).

**System Prompt:**

```
You are a health navigation assistant for an insurance booking app in Germany.
Your ONLY job is to recommend WHICH TYPE OF DOCTOR a user should see based on the
symptoms they describe. You do NOT diagnose conditions, name diseases, or suggest
treatments or medication. You help the user navigate to the right kind of care.

RULES:
1. Recommend a type of doctor (e.g., General Practitioner, Dermatologist,
   Cardiologist, ENT, Orthopedist, Gynecologist, Pediatrician, Psychiatrist).
2. NEVER state or guess a diagnosis. If the user asks "what's wrong with me?",
   reply that you only help find the right doctor, not diagnose.
3. Assess urgency into exactly one level: "routine", "soon", or "emergency".
4. If symptoms suggest a medical emergency (e.g., chest pain, difficulty
   breathing, stroke signs, severe bleeding, suicidal thoughts), set urgency to
   "emergency", set needs_human_review to true, and advise contacting emergency
   services (112 in Germany) immediately.
5. In Germany, most specialists require a referral (Überweisung) from a General
   Practitioner first. If a specialist is recommended, set referral_required to true
   unless a GP is the recommendation.
6. Respond in the user's preferred language: {{ $json.language }}.
7. Be warm, clear, and brief. Avoid medical jargon.

OUTPUT FORMAT - respond ONLY with valid JSON, no extra text:
{
  "recommended_doctor_type": "string",
  "urgency": "routine | soon | emergency",
  "referral_required": true/false,
  "needs_human_review": true/false,
  "explanation_for_user": "string (1-2 sentences in the user's language)",
  "reasoning": "string (brief internal note, in English)"
}
```

**Example User Input (passed into the node):**

```json
{
  "language": "English",
  "symptoms": "I've had an itchy red rash on my arm for 5 days, it's not painful."
}
```

**Example AI Output:**

```json
{
  "recommended_doctor_type": "Dermatologist",
  "urgency": "soon",
  "referral_required": true,
  "needs_human_review": false,
  "explanation_for_user": "Based on what you described, a skin doctor (Dermatologist) is the right specialist. In Germany you'll likely need a referral from a GP first - I can help you book that.",
  "reasoning": "Persistent skin rash, non-urgent, dermatology is appropriate; specialist requires GP referral."
}
```

**How this connects to your n8n flow:**

- The JSON output feeds directly into the next nodes - `urgency` drives the **Switch node** (emergency → 112 guidance; otherwise → booking).
- `needs_human_review: true` triggers the **Send and Wait** human-in-the-loop node (your GDPR Art. 22 safeguard).
- `recommended_doctor_type` becomes the filter for the **doctor lookup** against the real imported `doctors` table (with OSM fallback), via `matchesSpecialty()` which also normalizes British/American spelling.
- `explanation_for_user` is what the front-end displays to the user.

> **Safety note for your write-up:** The "navigation, not diagnosis" framing and the emergency escalation rule are deliberate compliance features, not just prompt style. They are what keep the AI advisory rather than a regulated medical device.

---

## 11. Interface (GUI/VUI), Inputs, Databases & Outputs

This section details *how the user interacts* with the system (the interface layer) and *how data flows* through it (inputs → storage → outputs). Every process step in Section 8 has a user-facing interface and an underlying data movement.

### 11.1 Interface Layer - GUI and VUI

The product is **designed** for **two interaction modes**, which matters because the core users are non-German speakers who may also have low digital literacy. **As delivered, only the GUI is built**; the VUI is documented design intent:

| Mode                                     | What it is                                      | Status    | Why it matters here                                                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GUI** (Graphical User Interface) | The visual app - screens, buttons, forms, lists | ✅ Live   | Standard, familiar, works for most users. Rendered in an iPhone-style frame, 6 languages.                                                                              |
| **VUI** (Voice User Interface)     | Speak to the app; it speaks back                | 🔵 Future | Accessibility for low-literacy users; natural for describing symptoms in one's own language; hands-free. No speech-to-text / text-to-speech is wired in the prototype. |

**How the VUI would work technically (future scope):**

```
User speaks (own language) → Speech-to-Text → AI Agent (triage)
                                                   │
User hears response ◄── Text-to-Speech ◄── AI text output
```

The voice layer is just an *input/output wrapper* around the same AI Agent - the process logic underneath is identical to the GUI path.

### 11.2 GUI Screens & User Inputs

Each screen maps to a process step and defines exactly what the user inputs:

| # | Screen                      | User Input (GUI)                              | Input Type                  | VUI Equivalent            |
| - | --------------------------- | --------------------------------------------- | --------------------------- | ------------------------- |
| 1 | Welcome / Entry             | Tap "Insurance Help"                          | Button                      | "Start" voice command     |
| 2 | Language Select             | Choose language                               | Dropdown                    | Spoken language detection |
| 3 | Profile Survey (first-time) | Name, age, insurance type, provider, location | Text fields + dropdowns     | Spoken answers            |
| 4 | Symptom Input               | Describe symptoms                             | Free text**or voice** | Spoken description        |
| 5 | AI Recommendation           | (read-only) Confirm or ask again              | Button                      | Spoken back to user       |
| 6 | Availability Preference     | When can you go? (days + time-of-day)         | Chips / toggles             | Spoken preference         |
| 7 | Doctor List (pre-filtered)  | Select a doctor                               | Tap from list               | "Choose the first one"    |
| 8 | Appointment Slot            | Pick exact date/time                          | Calendar picker             | Spoken slot choice        |
| 9 | Confirmation                | Acknowledge                                   | Button                      | Spoken confirmation       |

> **As built:** the GUI screens above map onto the real pages - Entry/Language (`index.html`), Profile Survey (`homepage.html`, a manual form not a conversational agent), Symptom Input + AI Recommendation (`symptom.html`), Doctor List (`doctors.html`), and Appointment Slot + Confirmation (`booking.html`). The **VUI Equivalent** column is design intent only - voice is not implemented. The "Appointment Slot" picker is constrained to the doctor's parsed opening hours (closed days/times are rejected); doctors with no hours fall back to an email-request draft.

### 11.3 Databases - What Gets Stored

The delivered app runs on **Supabase (Postgres + Auth)**. The original draft below planned four mock tables; **as built there are six real tables**, and the `doctors` table holds **real imported data** (from `doctors.csv`, sourced from OpenStreetMap), not mock rows. All carry Row-Level Security (see System Overview §5).

**`profiles` - the user profile (one-time, drives recommendations; id = `auth.uid()`)**

| Field          | Type | Example    |
| -------------- | ---- | ---------- |
| id             | uuid | (auth.uid) |
| insurance_type | text | GKV        |
| insurance      | text | TK         |
| postcode       | text | 28195      |
| city           | text | Bremen     |
| language       | text | English    |

> Auth-managed fields (email, password) live in Supabase Auth, not here - passwords are never accessible to the app.

**`doctors` - the matchable directory (REAL imported data; public read-only via RLS)**

| Field                  | Type | Example                         |
| ---------------------- | ---- | ------------------------------- |
| id                     | ID   | (FK target for appointments)    |
| name                   | text | Dr. Schmidt                     |
| specialty              | text | Dermatologist                   |
| languages              | text | German, English                 |
| postcode / city        | text | 28195 / Bremen                  |
| phone / website        | text | (validated before "Call" shows) |
| hours_mon … hours_sun | text | per-day opening hours           |

> No `insurance_accepted` column yet - that's the `INSURANCE_FILTER_ENABLED = false` scaffold. Addresses deliberately show postcode + city only (scraped street data is unreliable); OSM-fallback doctors carry a full street.

**`consultations` - each triage session (the AI's work + the audit log)**

| Field                   | Type      | Example                 |
| ----------------------- | --------- | ----------------------- |
| id / session            | ID        | s_330                   |
| user_id                 | ID        | (auth.uid)              |
| symptoms                | text      | "itchy red rash on arm" |
| recommended_doctor_type | text      | Dermatologist           |
| urgency                 | text      | soon                    |
| referral_required       | boolean   | true                    |
| needs_human_review      | boolean   | false                   |
| language                | text      | English                 |
| created_at              | timestamp | 2026-06-17 14:22        |

**`appointments` - confirmed bookings (per-user, owner-only RLS)**

| Field                                           | Type      | Example                                     |
| ----------------------------------------------- | --------- | ------------------------------------------- |
| id                                              | ID        | a_205                                       |
| user_id                                         | ID        | (auth.uid)                                  |
| doctor_id                                       | ID        | FK →`doctors(id)` (null for OSM doctors) |
| doctor_name / doctor_specialty / doctor_address | text      | text snapshot of who the appt is with       |
| datetime                                        | text      | 2026-06-20T09:00:00 (naive wall-clock)      |
| status                                          | text      | confirmed                                   |
| created_at                                      | timestamp | 2026-06-17                                  |

**`appointments_cancel` / `appointments_reschedule` - invisible audit logs (INSERT-only, no SELECT)**

| Table                       | Captures                             | Written by                                        |
| --------------------------- | ------------------------------------ | ------------------------------------------------- |
| `appointments_cancel`     | archived row before deletion         | `cancelAppointment()` - archive-before-delete   |
| `appointments_reschedule` | `old_datetime` → `new_datetime` | `handleBooking()` after a successful reschedule |

> These two exist purely for **metrics** (cancel/reschedule frequency, booking-to-cancel lead time) and are invisible to users by RLS design - they have INSERT but no SELECT.

> **Compliance link (Section 9):** the `consultations` table doubles as the **AI Act audit log** - every AI decision and its `needs_human_review` flag is traceable. Health data here is special-category (GDPR Art. 9) and would require explicit consent + encryption before any real-data launch (the consent screen is future scope, §9.6).

### 11.4 Inputs → Process → Outputs (I/O Map)

The complete data flow, step by step:

| Step                | INPUT (from user/system)                           | PROCESS (as built)                                | OUTPUT (to user/DB)                                                                                                          |
| ------------------- | -------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Entry               | Register / log in, pick language                   | Supabase Auth (`index.html`)                    | Authenticated session; language set                                                                                          |
| Profile             | Insurance, postcode, city                          | Manual form →`profiles` table                  | Profile saved; drives later autofill                                                                                         |
| Symptoms            | Free-text description                              | Groq triage (`symptom-check` Edge Fn / n8n)     | JSON recommendation →`consultations` table                                                                                |
| Urgency check       | (AI output `urgency`)                            | Route by urgency                                  | Emergency guidance (112) / standard booking                                                                                  |
| Doctor match        | recommended_doctor_type + postcode/city + language | Query `doctors` (real) → OSM fallback          | Filtered doctor list on screen                                                                                               |
| Selection           | User taps a doctor card                            | Front-end                                         | Carries doctor to booking screen                                                                                             |
| Booking             | Chosen slot (within opening hours)                 | Write to `appointments` (direct Supabase / n8n) | Booking row persisted; FK to `doctors` when from DB                                                                        |
| Confirmation        | (system)                                           | Read back saved row                               | **In-app** confirmation in the user's language (no outbound email; doctors w/o hours → `mailto:` draft to the user) |
| Reschedule / Cancel | Existing appointment `id`                        | UPDATE in place / archive-before-delete           | Audit row to `appointments_reschedule` / `appointments_cancel`                                                           |

### 11.5 System Outputs Summary

What the system *produces* (the deliverable outputs):

- **On-screen (live):** language-appropriate recommendation, urgency badge, doctor shortlist, in-app appointment confirmation. (*Spoken output is future VUI scope.*)
- **Stored data (live):** `profiles`, `consultations`, `appointments`, plus the invisible `appointments_cancel` / `appointments_reschedule` audit logs.
- **External output:** **none sent in the prototype** - confirmation is shown in-app from the saved row; for doctors without opening hours, an email *draft* is opened to the **user's own** inbox. A real confirmation email and an Outlook calendar event are future scope.
- **Structured data (live):** the AI's JSON output (Section 10.9), which is both a system message *and* an audit artifact in `consultations`.

---

## 12. Summary at a Glance

|                                  |                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Product**                | AI-first health navigation SaaS for immigrants in Germany                                                                                                            |
| **Core User**              | Non-German-speaking immigrants with GKV or PKV insurance                                                                                                             |
| **Primary Problem Solved** | End-to-end process failure: from insurance confusion to the phone-call booking wall                                                                                  |
| **Key Differentiator**     | Single connected flow vs. TK's separate modules; fully automated booking vs. human phone call                                                                        |
| **AI Coverage**            | Of 16 BPMN elements: 9 live, 4 partial, 3 future - triage, matching & booking all live and connected                                                                 |
| **Delivered Build**        | Static front-end (6 languages) + Supabase (Auth/Postgres/RLS) + Groq triage + OSM doctor fallback; two engines (standalone Edge Functions*or* n8n) via `USE_N8N` |
| **Business Model**         | B2B2C - white-labeled to insurance providers, or direct D2C subscription                                                                                             |
| **Competitive Benchmark**  | TK-Doc (gap: fragmented services, German-first UX, manual booking)                                                                                                   |
| **Regulatory Exposure**    | GDPR (Art. 9 + Art. 22) and EU AI Act; burden concentrated in the triage feature                                                                                     |
| **Compliance Strategy**    | "Navigation, not diagnosis" framing + human-in-the-loop safeguard + Compliance-by-Design governance                                                                  |

---

*MDT 25–27 | Change and Process Management Project*
*Draft v3 - Sections 8–12 reconciled with the delivered GitHub build (live vs. partial vs. future). For the full technical build log, see the [System Overview](MDT_25-27_Change Process MGT_System Overview.md).*
