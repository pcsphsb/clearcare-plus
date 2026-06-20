# BUSINESS PROCESS TRANSFORMATION: AI-FIRST HEALTH INSURANCE NAVIGATION FOR IMMIGRANTS IN GERMANY
### Software as a Service (SaaS) | Change and Process Management

> **Design Principle:** This is an AI-first company. Every process step that can be handled by AI, must be handled by AI. Human intervention is the exception, not the default.

---

## 1. The Problem — Bigger Than a Language Barrier

When a non-German-speaking immigrant arrives in Germany and needs medical help, they face not one barrier but an entire chain of unfamiliar process steps:

- **Insurance confusion:** Germany has two systems (statutory/GKV and private/PKV) with different rules, coverages, and doctor networks — explained entirely in German.
- **Referral dependency:** Most specialists require a GP referral (*Überweisung*) first. Immigrants who don't know this get turned away.
- **Finding the right doctor:** Not all doctors accept all insurance types. Not all speak English. Availability varies by region and waitlist.
- **The booking wall:** Even when a doctor is found, booking typically requires a phone call — in German — to a receptionist who may not speak English.
- **No guidance on what happens next:** Post-appointment follow-up, prescriptions, and specialist referrals are equally opaque.

**The result:** Immigrants delay seeking care, navigate incorrectly, or give up entirely. This is a process failure — not a personal one.

---

## 2. The Benchmark — What TK Already Does (and Where It Stops)

**TK Insurance** (Techniker Krankenkasse) is the closest existing model. Its **TK-Doc app** offers:

| TK Feature | What it does | Where it falls short |
|------------|-------------|----------------------|
| Symptom Checker | AI/chatbot triage | Isolated — does not connect to booking |
| Doctor Locator | Filter by location, language, specialty | Manual search; user must interpret results |
| Video Consultation | Click-through filter to select practitioner | Limited specialist range; German-first UX |
| Appointment Booking | Handled by a human customer service agent via phone call | Slow, language-dependent, not scalable, not integrated |

**The critical gap:** TK's services are separate modules, not a connected end-to-end process. The booking step still requires a human phone call — which is precisely where non-German speakers drop off.

Our product eliminates that drop-off by making the entire journey a single, AI-driven, language-agnostic flow.

---

## 3. The Solution — What We Are Building

An **AI-first health navigation SaaS** that takes an immigrant from *"I don't feel well"* to *"appointment confirmed"* in their own language, without a single phone call or manual search.

**Name concept:** ClearCare (placeholder)

**What makes it different from TK:**

| | TK-Doc | ClearCare |
|--|--------|-----------|
| Services | Separate modules | Single connected flow |
| Booking | Human phone call | Fully AI-automated |
| Language support | German-first | Language-first by design |
| Insurance explanation | None | AI policy interpreter built in |
| Referral guidance | None | AI navigates referral chain |
| Post-appointment | None | AI follow-up and prescription tracker |
| User profile | Basic | Deep profile drives every recommendation |

---

## 4. Core Value Proposition

> **For newly arrived immigrants in Germany, ClearCare replaces the confusing, German-language process of finding and booking a doctor with a single, AI-guided, end-to-end experience in the user's own language — from symptom to confirmed appointment, without a single phone call.**

Three layers of value:

- **Language:** The entire app experience, including doctor matching, is filtered by the user's language preference from the first screen.
- **Process:** AI connects every step that TK leaves disconnected — triage feeds into matching, matching feeds into booking, booking feeds into follow-up.
- **Understanding:** An AI policy explainer tells users in plain language what their insurance covers, what a referral is, and what to expect — eliminating the knowledge gap that causes delays.

---

## 5. How We Deliver Value — AI at Every Step

The following maps every process step to its AI responsibility:

| Process Step | Traditional (TK/Manual) | ClearCare AI Action |
|-------------|--------------------------|---------------------|
| Onboarding | Manual form filling | AI-guided conversational onboarding; extracts insurance type, location, language, and medical history in chat format |
| Insurance interpretation | User reads policy PDF | AI policy explainer summarizes coverage, co-pays, and referral requirements in plain language |
| Symptom triage | Separate chatbot, no follow-through | AI triage engine assesses symptoms and recommends care level (GP, specialist, urgent care, or ER) |
| Referral navigation | User is unaware of the system | AI explains whether a referral is needed and, if so, books the GP appointment first automatically |
| Doctor matching | Manual filter search | AI matches based on: language, insurance acceptance, specialty, location, availability, and user ratings |
| Appointment booking | Human phone call in German | AI automated booking via API integration with doctor scheduling systems — no phone call required |
| Confirmation & prep | None | AI sends appointment confirmation, location info, what to bring, and language tips |
| Post-appointment | None | AI follow-up: prescription tracking, referral next steps, feedback collection |

---

## 6. Customer Journey Map

The user's emotional and practical experience from first contact to post-care:

```
TRIGGER → ONBOARDING → UNDERSTAND → TRIAGE → MATCH → BOOK → ATTEND → FOLLOW-UP
```

### Stage-by-Stage Breakdown

**Stage 1 — Trigger**
- User feels unwell or needs a check-up.
- Opens ClearCare app.
- *Emotional state: uncertain, possibly anxious, unfamiliar with the system.*

**Stage 2 — Onboarding (AI-driven, one-time)**
- AI guides user through a conversational profile setup: language preference, insurance type (GKV/PKV), provider name, location, and basic medical history.
- Profile is stored and drives all future recommendations automatically.
- *Pain point eliminated: no confusing forms; no German required.*

**Stage 3 — Insurance Understanding (AI policy explainer)**
- AI surfaces a plain-language summary of what the user's insurance covers relevant to their current need.
- Flags if a GP referral is required before seeing a specialist.
- *Pain point eliminated: user no longer needs to read a German policy document.*

**Stage 4 — Symptom Triage (AI triage engine)**
- User describes symptoms in their own language via chat or voice.
- AI recommends: GP visit / specialist / urgent care / emergency room.
- If referral needed: AI queues a GP booking first before specialist search.
- *Pain point eliminated: user is guided, not left to guess the correct care pathway.*

**Stage 5 — Doctor Matching (AI recommendation engine)**
- AI presents a shortlist of matched doctors: filtered by language, insurance acceptance, specialty, proximity, and availability.
- Each result shows: languages spoken, earliest slot, distance, and user ratings.
- User selects preferred doctor with one tap.
- *Pain point eliminated: no manual search; no filtering in German.*

**Stage 6 — Booking (AI automated)**
- AI calls or API-connects to the doctor's scheduling system and books the selected slot.
- User receives an in-app confirmation in their language.
- No phone call. No German. No waiting.
- *Pain point eliminated: the single biggest drop-off point in the current process is removed.*

**Stage 7 — Appointment Preparation (AI notification)**
- 24 hours before: AI sends location, what documents to bring (insurance card, referral letter if applicable), and a brief note on what to expect at a German doctor's office.
- *Pain point eliminated: first-time uncertainty at the clinic.*

**Stage 8 — Post-Appointment Follow-Up (AI follow-up)**
- AI prompts user to log prescription details for tracking.
- If a specialist referral was issued, AI initiates the next booking flow automatically.
- User can rate the experience; feedback is used to refine doctor matching.
- *Pain point eliminated: the process doesn't end at the appointment — continuity of care is maintained.*

---

## 7. Process Journey Map

### 7.1 Core Process — The Primary Value-Creating Flow

```
User Profile Setup → Triage → Doctor Match → Booking → Confirmation → Follow-Up
```

This is the end-to-end flow the user directly experiences. Every step is AI-executed. Human staff are only triggered as escalation exceptions (e.g., if AI cannot find an available match in the area).

### 7.2 Management Process — Running the Business Behind the App

| Management Process | Description |
|-------------------|-------------|
| Doctor Network Management | Onboarding and vetting doctors/clinics to the platform; verifying language capabilities, insurance acceptance, and scheduling API availability. |
| Quality & Compliance Monitoring | Ensuring GDPR compliance on health data; monitoring AI recommendation accuracy; auditing booking success rates. |
| AI Model Governance | Regular review of triage accuracy, matching algorithm performance, and policy interpretation correctness — with human expert validation. |
| Partner Insurance Integration | Maintaining API connections with GKV and PKV providers to verify user coverage in real time. |
| Performance Reporting | Dashboards tracking: bookings completed, drop-off points, average time from symptom to appointment, user satisfaction scores. |

### 7.3 Support Process — What Enables the Core to Run

| Support Process | Description |
|----------------|-------------|
| Customer Support (human escalation) | Available for edge cases the AI cannot resolve — but routed through in-app chat first, not phone. |
| Doctor Scheduling API Maintenance | Technical upkeep of integrations with clinic booking systems. |
| Language Model Updates | Expanding language support and medical vocabulary accuracy in AI triage and matching. |
| User Feedback Loop | Post-appointment ratings and complaints feed back into the matching and triage models. |
| Onboarding Support for Clinics | Helping partner clinics connect their scheduling systems to the platform. |

---

## 8. BPMN 2.0 — AI Integration Points

The following maps which process elements in a standard BPMN flow are **AI-responsible** vs. **human-responsible**:

| BPMN Element | Process Step | Responsible Party | AI Action |
|-------------|-------------|-------------------|-----------|
| **Start Event** | User opens app | System | Automatic |
| **User Task** | Language & profile setup | AI (conversational) | Replaces manual form |
| **Service Task** | Insurance policy retrieval | AI | API call to insurer + NLP summarization |
| **Gateway (XOR)** | Referral required? | AI decision | Checks policy rules; routes to GP flow or direct specialist flow |
| **Service Task** | Symptom triage (navigation, not diagnosis) | AI | NLP/ML engine classifies *which type of care*, not *what condition* |
| **Gateway (XOR)** | Urgent care needed? | AI decision | Routes to emergency guidance or standard booking |
| **Manual Task (safeguard)** | High-stakes routing review (e.g., ER vs. GP) | Human (in-the-loop) | GDPR Art. 22 safeguard — human confirms AI's high-risk routing before it takes effect |
| **Service Task** | Doctor matching | AI | Recommendation engine filters and ranks results |
| **User Task** | Doctor selection | User | One-tap selection from AI shortlist |
| **Service Task** | Appointment booking | AI | Automated API call or AI voice call to clinic |
| **Gateway (XOR)** | Booking successful? | System | If yes → confirmation; if no → AI finds next available slot |
| **Service Task** | Confirmation & prep notification | AI | Automated multilingual message |
| **Intermediate Event** | Appointment day | System timer | Triggers reminder 24h before |
| **Service Task** | Post-appointment follow-up | AI | Prompts prescription log, next referral, or feedback |
| **End Event** | Care cycle complete | System | Profile updated; feedback stored |
| **Exception Flow** | AI cannot resolve | Human agent | Escalation trigger — human reviews and intervenes |

> **AI-responsible steps: 10 out of 15 process elements.**
> Human intervention is reserved for escalation and one mandated high-risk safeguard — not the default path.

---

## 9. Regulatory, Compliance & Governance

An AI-first health platform operating in Germany sits at the intersection of two of the EU's strictest regimes: the **GDPR** (data protection) and the **EU AI Act** (AI risk regulation), with the **Medical Device Regulation (MDR)** lurking behind the triage feature. Treating compliance as a *designed process* — not an afterthought — is core to this project.

### 9.1 The Two Regimes at a Glance

| Component | Governing regime | Risk level | Burden |
|-----------|------------------|-----------|--------|
| Doctor matching | EU AI Act (limited risk) | Low | Transparency labels |
| Automated booking | GDPR (Art. 22) | Low–Medium | Consent + optional human override |
| Insurance/policy explainer | GDPR | Medium | Consent, output accuracy |
| **Symptom triage** | **EU AI Act (potentially high-risk) + MDR** | **High** | **Conformity assessment, human oversight** |
| All health data handling | GDPR (Art. 9) + DPIA | High | Explicit consent, DPIA, data minimization |

**Key insight:** The regulatory burden is *concentrated in one feature* — the triage engine. The core differentiator (matching + automated booking) is comparatively low-risk. This shapes the entire compliance strategy.

### 9.2 GDPR Obligations

- **Special category data (Art. 9):** Health data is prohibited to process by default. Our legal basis is **explicit, opt-in, informed consent**, captured separately from general terms.
- **DPIA (mandatory):** Large-scale processing of special-category data triggers a required Data Protection Impact Assessment *before* launch. This is a hard gate, not optional documentation.
- **Data minimization:** Each process step collects only the data it needs — directly tempering the AI-first instinct to gather everything.
- **Article 22 (automated decisions):** Users have the right not to be subject to solely automated decisions with significant effects. Low-stakes steps (booking) remain fully automated; high-stakes routing (e.g., ER vs. GP) now passes through the **human-in-the-loop safeguard** added to the BPMN above.

### 9.3 EU AI Act Obligations

- **Triage = the high-risk question.** If the triage AI is deemed to make medical recommendations, it can be classified as a medical device under MDR, which pulls it into the AI Act's **high-risk tier** (conformity assessment, risk management system, technical documentation, logging, human oversight, registration).
- **Our mitigation — "navigation, not diagnosis":** The triage engine recommends *which type of care to seek*, never *what condition the user has*. This positions it as an informational/navigational tool, aiming to stay clear of medical-device classification. This is a contested legal line, so it is paired with the human-in-the-loop safeguard rather than relied on alone.
- **Transparency (limited-risk obligations):** Users are always told when they are interacting with AI, and AI-generated outputs are clearly labeled.

### 9.4 Compliance by Design — A Named Management Process

Compliance is embedded as an ongoing **management process** (added to Section 7.2), not a one-time legal review:

| Governance Function | Owner | Responsibility |
|--------------------|-------|----------------|
| Data Protection (DPO) | Data Protection Officer | Maintains DPIA, consent records, breach response; GDPR point of contact |
| AI Risk Classification | AI Governance Lead | Monitors whether features cross into high-risk/medical-device territory as they evolve |
| Human Oversight | Clinical/Operations | Staffs and audits the human-in-the-loop triage safeguard |
| Audit & Logging | Engineering | Maintains decision logs for AI Act traceability and accountability |
| Regulatory Horizon Scanning | Compliance Lead | Tracks AI Act phased deadlines and MDR guidance changes |

### 9.5 Strategic Takeaway

The EU AI Act and GDPR are a **meaningful but navigable** obstacle. Crucially, they are *survivable without abandoning the AI-first model* — because only one feature carries the heavy burden, and it can be ring-fenced with a human safeguard and careful "navigation, not diagnosis" framing. For a process management perspective, regulation becomes a **set of designed process steps and governance roles**, which raises the maturity of the overall design rather than blocking it.

---

## 10. Build Approach — Prototyping the Process in n8n

**n8n** is a workflow automation platform that connects services together using visual "nodes" (triggers, logic, AI, API calls). It is an excellent fit for **building and demonstrating the orchestration layer** of this product — the engine that connects triage → matching → booking → follow-up — without writing a full application from scratch.

### 10.1 What n8n Is (and Isn't) Good For Here

| n8n is great for... | n8n is NOT the place for... |
|---------------------|------------------------------|
| The backend orchestration / "process brain" | The polished consumer-facing mobile UI |
| Connecting AI + external APIs (insurers, clinics) | High-volume, millisecond-latency production traffic |
| Rapid MVP / proof-of-concept for a class demo | Storing sensitive health data long-term (use a compliant DB) |
| Visualizing the workflow (mirrors your BPMN) | Replacing a dedicated medical-device-grade system |

> **Honest framing for your project:** n8n lets you *prototype the entire process flow* and prove the AI-first concept works end-to-end. In a real launch, the consumer app (the UI) would be a separate mobile/web front-end that *calls* this n8n-orchestrated backend via a webhook.

### 10.2 Mapping the Process to n8n Nodes

Each BPMN step from Section 8 maps to a specific type of n8n node:

| Process Step | n8n Node | What it does |
|-------------|----------|--------------|
| User opens app / sends request | **Chat Trigger** or **Webhook** | Receives the user's input to start the workflow |
| Profile & language onboarding | **AI Agent** node (LLM, e.g. Anthropic Claude) | Conversational extraction of profile data |
| Store profile | **Postgres / Supabase** node | Saves structured user profile securely |
| Insurance policy retrieval | **HTTP Request** node | Calls the insurer's API for coverage data |
| Policy explanation | **Basic LLM Chain** node | Summarizes policy in the user's language |
| Referral required? | **IF** node | Branches: GP-first flow vs. direct specialist flow |
| Symptom triage (navigation) | **AI Agent** node | Classifies *which type of care* is needed |
| Urgent care needed? | **Switch** node | Routes: ER guidance / urgent / standard booking |
| High-risk routing safeguard | **Send and Wait for Response** node | Pauses for human-in-the-loop approval (GDPR Art. 22) |
| Doctor matching | **HTTP Request** + **AI Agent** | Queries doctor database, then ranks results |
| Doctor selection | **Form** / **Chat** response | User picks from the AI shortlist |
| Appointment booking | **HTTP Request** node | Calls the clinic's scheduling API |
| Booking successful? | **IF** node | If fail → loop back to find next slot |
| Confirmation & prep | **Send Email / Messaging** node | Sends multilingual confirmation |
| Appointment reminder | **Schedule Trigger** / **Wait** node | Fires 24h before the appointment |
| Post-appointment follow-up | **AI Agent** + **Postgres** | Prompts prescription log, next steps, feedback |

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

- **It makes the AI-first claim tangible.** Every AI Agent / LLM Chain node *is* an AI-responsible step from your BPMN — you can literally point at them.
- **It shows the human-in-the-loop safeguard as a real node** (Send and Wait for Response), not just a policy promise — directly addressing the GDPR Art. 22 requirement.
- **It mirrors your BPMN diagram**, so your process map and your build approach tell the same story.
- **It's demo-able.** For a class, you could build a stripped-down version of even 3–4 nodes to show the concept working live.

### 10.5 Build Phases

| Phase | Goal | n8n Scope |
|-------|------|-----------|
| 1. Proof of Concept | Show triage → matching works | 3–4 nodes, mock data |
| 2. Prototype | Full flow with real APIs | All nodes, test insurer/clinic APIs |
| 3. Pilot | Connect a real front-end | n8n as backend via webhook; UI calls it |
| 4. Scale | Migrate hot paths to custom code | Keep n8n for orchestration, harden the rest |

### 10.6 Front-End vs. Back-End — Who Builds What

This product is a **full-stack application**: a front-end the user touches, and a back-end that does the work. The two are built with different tools and connected by an API call.

```
┌─────────────────────────────────────────────────────────┐
│                      FRONT-END                           │
│              (What the user sees & touches)              │
│                                                          │
│   HTML  → structure (chat box, forms, doctor list)       │
│   CSS   → look & feel (layout, colors, clarity)          │
│   JS    → interactivity (taps, validation, display)      │
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
│                       BACK-END                           │
│            (The process brain — user never sees)         │
│                                                          │
│   n8n workflow → triage, AI matching, booking,           │
│                  insurer API calls, human safeguard,     │
│                  follow-up automation                    │
│   Database     → stores user profile, outcomes           │
└─────────────────────────────────────────────────────────┘
                          │
                          │  JSON response  (e.g. "Appointment confirmed")
                          ▼
              back up to the FRONT-END to display
```

| Layer | Tool | Responsibility |
|-------|------|----------------|
| **Front-End** | HTML / CSS / JavaScript | The user interface — screens, forms, displaying AI responses, sending requests |
| **Connection** | HTTP request ↔ JSON response | The messenger that carries data between the two layers |
| **Back-End** | n8n (+ database) | The business logic and automation — triage, matching, booking, follow-up |

> **The mental model:** HTML/CSS/JS is the *face*. n8n is the *engine*. An API call is the *messenger* between them. Together they form the full stack.

### 10.7 Refined Process Flow (v2) & Prototype Scope

This is the corrected flow based on the v1 BPMN draft. **Three fixes were applied:**
1. The **"First Time?" gateway now gates the Survey** (profile setup is one-time), not the symptoms.
2. **Symptoms + AI triage now run on every visit** (symptoms change each time), which is the logically correct path.
3. **Availability is captured BEFORE the doctor list** (v3 fix), so the list is pre-filtered to doctors who can actually see the user in their preferred window — instead of letting the user pick a doctor and hit a dead end with no matching slots.

```
                          ┌─────────────────────────────┐
   ● START                │   PROTOTYPE SCOPE (build it) │
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
 │            FUTURE SCOPE (mock / simplify for demo)          │
 │                                                            │
 │   [Outlook + Outlook Calendar: check next-day availability]│
 │        │                                                   │
 │        ▼                                                   │
 │   [User: Select Appointment Date]                          │
 │        │                                                   │
 │        ▼                                                   │
 │   ✉ Send Confirmation  →  ● END                            │
 └───────────────────────────────────────────────────────────┘
```

### 10.8 What We Actually Build in 1 Week vs. Future Scope

| Process Step | Status | How (in the prototype) |
|-------------|--------|------------------------|
| User entry (Insurance Help) | ✅ **Prototype** | n8n Chat Trigger / Webhook |
| First Time? gateway | ✅ **Prototype** | n8n IF node |
| Survey (profile) | ✅ **Prototype** | n8n Form / AI Agent |
| Ask for Symptoms | ✅ **Prototype** | n8n Chat / AI Agent |
| **AI doctor-type recommendation** | ✅ **Prototype (core demo)** | n8n AI Agent (Claude) — *the "wow" moment* |
| Human-in-the-loop safeguard | ✅ **Prototype (optional)** | n8n Send and Wait node |
| **Ask for availability** | ✅ **Prototype** | n8n Form (days + time-of-day preference) |
| Retrieve possible doctors | ✅ **Prototype** | **Mock doctor list**, filtered by type + language + insurance + availability |
| Select a Doctor | ✅ **Prototype** | n8n Form response (only doctors that fit the window are shown) |
| Outlook calendar availability | 🔵 **Future Scope** | Real Outlook OAuth — *mocked as sample slots for demo* |
| Select Appointment Date | 🔵 **Future Scope** | Simplified pick from mock slots |
| Send Confirmation | ✅ **Prototype** | n8n Send Email node |

> **Prototype deliverable for this course:** a working n8n flow demonstrating **Symptoms → AI doctor-type recommendation → match against a mock doctor list → confirmation**. The Outlook/real-calendar booking integration is documented as **future production scope**, since live OAuth integration is out of reach for a 1-week build.

### 10.9 Sample AI Triage Prompt (for the n8n AI Agent Node)

This is the **system prompt** you would paste into the AI Agent node (using a model such as Anthropic's Claude). It turns a user's symptoms + profile into a structured doctor-type recommendation — framed as **navigation, not diagnosis** to stay clear of medical-device classification (see Section 9.3).

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

OUTPUT FORMAT — respond ONLY with valid JSON, no extra text:
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
  "explanation_for_user": "Based on what you described, a skin doctor (Dermatologist) is the right specialist. In Germany you'll likely need a referral from a GP first — I can help you book that.",
  "reasoning": "Persistent skin rash, non-urgent, dermatology is appropriate; specialist requires GP referral."
}
```

**How this connects to your n8n flow:**
- The JSON output feeds directly into the next nodes — `urgency` drives the **Switch node** (emergency → 112 guidance; otherwise → booking).
- `needs_human_review: true` triggers the **Send and Wait** human-in-the-loop node (your GDPR Art. 22 safeguard).
- `recommended_doctor_type` becomes the filter for the **mock doctor list** lookup.
- `explanation_for_user` is what the front-end displays to the user.

> **Safety note for your write-up:** The "navigation, not diagnosis" framing and the emergency escalation rule are deliberate compliance features, not just prompt style. They are what keep the AI advisory rather than a regulated medical device.

---

## 11. Interface (GUI/VUI), Inputs, Databases & Outputs

This section details *how the user interacts* with the system (the interface layer) and *how data flows* through it (inputs → storage → outputs). Every process step in Section 8 has a user-facing interface and an underlying data movement.

### 11.1 Interface Layer — GUI and VUI

The product offers **two interaction modes**, which matters because the core users are non-German speakers who may also have low digital literacy:

| Mode | What it is | Why it matters here |
|------|-----------|---------------------|
| **GUI** (Graphical User Interface) | The visual app — screens, buttons, forms, lists | Standard, familiar, works for most users |
| **VUI** (Voice User Interface) | Speak to the app; it speaks back | Accessibility for low-literacy users; natural for describing symptoms in one's own language; hands-free |

**How the VUI works technically:**
```
User speaks (own language) → Speech-to-Text → AI Agent (triage)
                                                   │
User hears response ◄── Text-to-Speech ◄── AI text output
```
The voice layer is just an *input/output wrapper* around the same AI Agent — the process logic underneath is identical to the GUI path.

### 11.2 GUI Screens & User Inputs

Each screen maps to a process step and defines exactly what the user inputs:

| # | Screen | User Input (GUI) | Input Type | VUI Equivalent |
|---|--------|------------------|-----------|----------------|
| 1 | Welcome / Entry | Tap "Insurance Help" | Button | "Start" voice command |
| 2 | Language Select | Choose language | Dropdown | Spoken language detection |
| 3 | Profile Survey (first-time) | Name, age, insurance type, provider, location | Text fields + dropdowns | Spoken answers |
| 4 | Symptom Input | Describe symptoms | Free text **or voice** | Spoken description |
| 5 | AI Recommendation | (read-only) Confirm or ask again | Button | Spoken back to user |
| 6 | Availability Preference | When can you go? (days + time-of-day) | Chips / toggles | Spoken preference |
| 7 | Doctor List (pre-filtered) | Select a doctor | Tap from list | "Choose the first one" |
| 8 | Appointment Slot | Pick exact date/time | Calendar picker | Spoken slot choice |
| 9 | Confirmation | Acknowledge | Button | Spoken confirmation |

### 11.3 Databases — What Gets Stored

The prototype uses a lightweight database (e.g., **Postgres / Supabase**, connected via n8n). Four core tables:

**`users` — the profile (one-time, drives all recommendations)**
| Field | Type | Example |
|-------|------|---------|
| user_id | ID | u_001 |
| name | text | Maria Santos |
| age | number | 29 |
| language | text | English |
| insurance_type | text | GKV |
| insurance_provider | text | TK |
| location | text | Bremen |
| created_at | timestamp | 2026-06-17 |

**`doctors` — the matchable list (MOCK data for the prototype)**
| Field | Type | Example |
|-------|------|---------|
| doctor_id | ID | d_014 |
| name | text | Dr. Schmidt |
| specialty | text | Dermatologist |
| languages_spoken | list | [German, English] |
| insurance_accepted | list | [GKV, PKV] |
| location | text | Bremen |
| available_slots | list | [2026-06-20 09:00, ...] |
| rating | number | 4.7 |

**`consultations` — each triage session (the AI's work)**
| Field | Type | Example |
|-------|------|---------|
| session_id | ID | s_330 |
| user_id | ID | u_001 |
| symptoms_text | text | "itchy red rash on arm" |
| recommended_doctor_type | text | Dermatologist |
| urgency | text | soon |
| referral_required | boolean | true |
| needs_human_review | boolean | false |
| preferred_days | text | "this week" |
| preferred_time | text | "mornings" |
| timestamp | timestamp | 2026-06-17 14:22 |

**`appointments` — confirmed bookings**
| Field | Type | Example |
|-------|------|---------|
| appointment_id | ID | a_205 |
| user_id | ID | u_001 |
| doctor_id | ID | d_014 |
| datetime | timestamp | 2026-06-20 09:00 |
| status | text | confirmed |
| confirmation_sent | boolean | true |

> **Compliance link (Section 9):** the `consultations` table doubles as the **AI Act audit log** — every AI decision and its `needs_human_review` flag is traceable. Health data here is special-category (GDPR Art. 9) and requires explicit consent + encryption.

### 11.4 Inputs → Process → Outputs (I/O Map)

The complete data flow, step by step:

| Step | INPUT (from user/system) | PROCESS (n8n node) | OUTPUT (to user/DB) |
|------|--------------------------|--------------------|--------------------|
| Entry | Tap / voice "start" | Chat Trigger | Language prompt on screen |
| Profile | Name, age, insurance, location | Form / AI Agent → `users` table | Profile saved; confirmation |
| Symptoms | Text or voice description | AI Agent (triage) | JSON recommendation → `consultations` table |
| Urgency check | (AI output) | Switch node | Route: emergency / booking |
| Availability | Preferred days + time-of-day | Form → stored on session | Availability window for filtering |
| Doctor match | recommended_doctor_type + availability window | Query `doctors` (mock) | Ranked, availability-filtered doctor list on screen |
| Selection | User taps a doctor | Form response | Selected doctor stored |
| Booking | Chosen slot | Write to `appointments` | Booking confirmation |
| Confirmation | (system) | Send Email node | Email/voice confirmation to user |

### 11.5 System Outputs Summary

What the system *produces* (the deliverable outputs):

- **On-screen / spoken:** language-appropriate recommendation, doctor shortlist, appointment confirmation.
- **Stored data:** user profile, consultation record, booking record, audit log.
- **External output:** confirmation email (and, in future scope, a real calendar event in Outlook).
- **Structured data:** the AI's JSON output (Section 10.9), which is both a system message *and* an audit artifact.

---

## 12. Summary at a Glance

| | |
|--|--|
| **Product** | AI-first health navigation SaaS for immigrants in Germany |
| **Core User** | Non-German-speaking immigrants with GKV or PKV insurance |
| **Primary Problem Solved** | End-to-end process failure: from insurance confusion to the phone-call booking wall |
| **Key Differentiator** | Single connected flow vs. TK's separate modules; fully automated booking vs. human phone call |
| **AI Coverage** | 10 of 15 BPMN process steps are AI-responsible |
| **Business Model** | B2B2C — white-labeled to insurance providers, or direct D2C subscription |
| **Competitive Benchmark** | TK-Doc (gap: fragmented services, German-first UX, manual booking) |
| **Regulatory Exposure** | GDPR (Art. 9 + Art. 22) and EU AI Act; burden concentrated in the triage feature |
| **Compliance Strategy** | "Navigation, not diagnosis" framing + human-in-the-loop safeguard + Compliance-by-Design governance |

---

*MDT 25–27 | Change and Process Management Project*
*Draft v2 — Redrafted for process clarity and AI-first alignment*
