# ClearCare+ - System Overview & Build Log

End-to-end documentation of the ClearCare+ prototype: what it is, how it's wired,
the data model and security, the two run modes (standalone vs n8n), and a
chronological log of how it was built.

Related docs in this folder:
- **Edge Functions Setup** - deploy the Supabase functions (the standalone engine).
- **n8n Consolidation & Cleanup** - the three flows merged into one importable workflow (`ClearCare+ Complete Workflow.json`), plus the consultation/appointment NULL fixes (the n8n engine).
- **Doctor Data Architecture** / **Doctor File Import** - OSM sourcing + CSV import.
- **ArztAPI Scaffolding** - the inactive future-integration placeholder.
- **n8n Workflow** - the original per-flow n8n mapping (background).

---

## 1. What it is
An AI-first patient-navigation prototype: a patient describes symptoms → gets a
recommended doctor type + urgency → finds a doctor (general or AI-recommended
specialist) → books / reschedules / cancels an appointment. Multilingual UI in
**English, Spanish, German, Turkish, Hindi, Arabic**, styled as an iPhone-framed
mobile app.

**Stack**
- **Frontend:** static `index.html`, `homepage.html`, `symptom.html`, `doctors.html`, `booking.html` + shared `script.js` + `style.css`.
- **Backend:** Supabase - Auth, Postgres (`profiles`, `appointments`, `appointments_cancel`, `appointments_reschedule`, `doctors`, `consultations`), and Edge Functions (`symptom-check`, `find-doctors`).
- **AI:** Groq LLM (via the `symptom-check` Edge Function, key server-side).
- **Open data:** OpenStreetMap (Nominatim + Overpass) for the doctor fallback.
- **n8n:** optional - the same three flows exist as webhooks for the live demo.

---

## 2. Architecture

```
            ┌─────────────────────────── Browser (static app) ───────────────────────────┐
            │  index / homepage / symptom / doctors / booking  +  script.js / style.css   │
            └───────────────┬───────────────────────────────────────────────┬─────────────┘
                            │ Supabase JS client (auth + DB reads/writes)     │ fetch()
                            ▼                                                 ▼
                 ┌────────────────────┐                      USE_N8N = false ┌───────────────┐
                 │  Supabase          │                      (standalone)    │ Edge Functions│
                 │  Auth + Postgres   │                                      │ symptom-check │──▶ Groq
                 │  profiles          │                                      │ find-doctors  │──▶ Nominatim+Overpass
                 │  appointments (RLS)│                                      └───────────────┘
                 │  doctors (RLS)     │                      USE_N8N = true  ┌───────────────┐
                 └────────────────────┘                      (live demo)     │ n8n webhooks  │──▶ Groq / OSM
                                                                             │ symptom/find/ │
                                                                             │ book          │
                                                                             └───────────────┘
```

---

## 3. Run modes (one switch flips the whole app)

Top of `script.js`:

| Flag | Default | Effect |
|---|---|---|
| `USE_N8N` | `false` | `false` = booking writes directly to Supabase, symptom + doctor-fallback use Edge Functions. `true` = all three route through n8n (for the demo). |
| `N8N_PRODUCTION` | `true` | `true` = n8n production webhooks (workflow Active, hands-free). `false` = test webhooks (manual "Listen for test event") for a step-by-step walkthrough. |

| Scenario | `USE_N8N` | `N8N_PRODUCTION` |
|---|---|---|
| Self-contained (own ecosystem) | `false` | `true` |
| Live n8n walkthrough | `true` | `false` |
| Hands-free through n8n | `true` | `true` |

---

## 4. Pages & flows
- **index.html** - register / log in (Supabase Auth). New users pick a language.
- **homepage.html** - first visit: complete profile (insurance, postcode, city). Returning: greeting + three actions - **Find a Doctor**, **Find a Specialist Doctor**, **Your appointments** (opens a bottom sheet). Avatar opens the Patient Information sheet (view/edit profile, sign out).
- **symptom.html** - describe symptoms → AI returns urgency badge, explanation, recommended specialty, referral note → "Find this doctor" carries the specialty to the doctor search.
- **doctors.html** - Postcode + City (autofilled from profile, editable) + language filter. Lists doctors; each card has Book / Call (when the phone is valid) / Website.
- **booking.html** - doctor summary + opening hours. If the doctor has hours → date/time slot booking (date limited to open days, times to that day's hours). If not → "Request appointment by email" (personal mailto). Also handles reschedule.

**Doctor routing:** **Find a Doctor** = general practitioners; **Find a Specialist Doctor** = only the AI's recommendation. Primary source is the imported `doctors` table (filtered by postcode/city, language, and specialty via `matchesSpecialty()` which normalizes British/American spelling). If the DB returns nothing (e.g. a city outside the dataset), it falls back to live OSM.

---

## 5. Data model & security (RLS)

Run this consolidated SQL in the Supabase SQL Editor.

**doctors** (public directory; imported from `doctors.csv` - see Doctor File Import):
```sql
alter table public.doctors enable row level security;
create policy "Public can read doctors"
  on public.doctors for select using (true);
```

**appointments** (per-user; owner-only):
```sql
alter table public.appointments enable row level security;

create policy "owner can select appointments"
  on public.appointments for select using (auth.uid() = user_id);

create policy "owner can insert appointments"
  on public.appointments for insert with check (auth.uid() = user_id);

create policy "owner can update appointments"
  on public.appointments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner can delete appointments"
  on public.appointments for delete using (auth.uid() = user_id);
```

**appointments_cancel** (audit log of cancelled bookings; write-once, invisible to users):
```sql
alter table public.appointments_cancel enable row level security;

-- INSERT only: a user may archive their OWN cancellation...
create policy "insert own cancellations"
  on public.appointments_cancel for insert with check (auth.uid() = user_id);
-- ...and deliberately NO select/update/delete policy.
```
When a user cancels, `cancelAppointment()` copies the row into `appointments_cancel`
**before** deleting it from `appointments` (archive-before-delete). The table is
intentionally invisible in the UI/account - users have INSERT but no SELECT - so the
cancellation never resurfaces to them. It exists for **tracking/metrics**: cancel &
reschedule frequency, booking-to-cancel lead time (`booked_at` vs `cancelled_at`), and
malicious-booking safeguards. Read it from the Supabase dashboard / service_role. The
archive insert is best-effort: if it fails, the cancellation still proceeds (logged to
console) so the UI never gets stuck. A `source` column (`'user_cancel'`, future
`'system_override'`) distinguishes the cancellation origin.

**appointments_reschedule** (audit log of rescheduled bookings; write-once, invisible to users):
```sql
alter table public.appointments_reschedule enable row level security;

-- INSERT only: archive own reschedule; no SELECT/UPDATE/DELETE.
create policy "insert own reschedules"
  on public.appointments_reschedule for insert with check (auth.uid() = user_id);
```
A reschedule **UPDATEs** the `appointments` row in place (the booking still exists), so
it can't be captured by `appointments_cancel` - and crucially we want **both** the old
and new slot. So `handleBooking()` inserts one row here after a successful reschedule,
recording `old_datetime` → `new_datetime`, `booked_at` (original `created_at`) and
`rescheduled_at`. Same invisible/INSERT-only pattern as the cancel log, and likewise
best-effort (a failed log never undoes the reschedule the user just made). For metrics:
reschedule frequency, how far slots move, and booking-to-reschedule lead time.

Notes:
- The **INSERT** policy is required for standalone booking (direct Supabase). The
  n8n path inserted via the service role and bypassed RLS.
- `profiles` is created/updated by the app per logged-in user (id = `auth.uid()`).
- Appointment `datetime` is stored as a naive wall-clock string (`YYYY-MM-DDTHH:MM:00`) and read back with `apptParts()` - never timezone-converted - so the time shown always equals the time booked.
- The legacy `doctors_dummy` table (old prototype seed) has been retired and `appointments.doctor_id` is now a **real foreign key to `doctors(id)`** (`on delete set null`). Booking writes `doctor_id` when the doctor comes from the `doctors` table; OSM-fallback doctors aren't in the table, so their `doctor_id` is null (the FK allows it, and the `doctor_name` / `doctor_specialty` / `doctor_address` text snapshot still records who the appointment is with). This is the visible DB relationship for the demo: a booked appointment links back to its doctor row.
- **Known intentional behavior - doctor address:** the UI/booking address is built from `street` + postcode/city. Imported DB doctors have no clean `street` (their scraped `address` is unreliable), so they deliberately show **postcode + city only**; OSM-fallback doctors carry a clean `street` and show a full address. This is a data-quality choice, not a bug. Once the DB addresses are cleaned, reading the `doctors.address` column here would surface full DB addresses too.

---

## 6. Feature areas
- **Appointments:** inline counts → button → bottom sheet listing all bookings with Reschedule / Cancel. Cancel uses a styled in-app modal (not `window.confirm`), and archives the booking to `appointments_cancel` before deleting it. Reschedule UPDATEs the row in place and logs the old→new change to `appointments_reschedule`. Both audit logs are invisible to the user (for metrics - see §5).
- **Reschedule:** reuses the booking screen, matched by appointment `id`, and UPDATEs the same row (no duplicates). Re-fetches the doctor row so opening hours show.
- **Booking availability:** opening hours parsed from the 7 day columns (`hours_mon … hours_sun`); date restricted to open weekdays, time slots to that day's ranges; closed-day attempts are rejected with a clear message. Doctors with no hours → email-request fallback.
- **Doctor search:** DB-first, OSM fallback; postcode-first matching (city is typo-prone in the data); language filter defaults to the user's preferred language.
- **Email fallback safety:** "Request appointment by email" opens a draft to the **user's own** inbox (never a real practice), with the doctor's contact shown for reference only.
- **Phone guard:** Call button only shows when the phone has ≥6 digits (the dataset has junk values).
- **Scaffolds (inactive, documented):**
  - **ArztAPI** - placeholder for a future paid booking API (`ARZT_API_ENABLED = false`).
  - **Insurance filter** - `INSURANCE_FILTER_ENABLED = false`; activates when an `accepts_insurance` column exists.
  - **Doctor calendar sync** - `DOCTOR_CALENDAR_ENABLED = false`; would supply real free/busy slots.

---

## 7. Edge Functions
- **symptom-check** - proxies Groq, returns `{ urgency, explanation_for_user, recommended_doctor_type, referral_required }`. Groq key in a Supabase secret.
- **find-doctors** - Nominatim geocode → Overpass `around` → normalized doctor list; multiple Overpass mirrors + timeouts; graceful empty on upstream failure.

Deploy steps: see **Edge Functions Setup** in this folder.

---

## 8. Internationalization
- Six languages with full key parity (verified programmatically). French was replaced by **Turkish**. All UI strings, hero content, and urgency labels are localized.
- The booking **notes translation** feature (translate-to-German, copy/email note) and the symptom **German doctor-summary** were removed - the app no longer has a translation feature.

---

## 9. UI / device frame
- The app renders inside an iPhone-style black bezel (`.phone`) with the screen (`.screen`) scrolling inside it. Scrollbar is hidden (mobile-style) so content stays centered.
- Bottom sheets and the confirm modal are anchored inside the phone frame.
- A floating back-to-top button appears after scrolling.

---

## 10. Build log (chronological)
1. **Appointments access** - overview made navigable; appointments listed in a sheet with Reschedule / Cancel.
2. **Reschedule safety** - match by `id`, UPDATE in place; added appointments RLS (update/delete); surfaced 0-row writes instead of false "saved".
3. **Wall-clock time fix** - stopped timezone-shifting appointment times (`apptParts`).
4. **Confirmation from DB** - booking confirmation reads the persisted row.
5. **Per-note copy buttons**, then **removed the translation feature** entirely.
6. **ArztAPI scaffold** added (booking + reschedule), documented.
7. **Homepage revision** - rebrand to **ClearCare+**, removed records/prescriptions/vitals, reordered actions, Appointments as a button → sheet.
8. **Doctor DB-first routing** + OSM fallback scaffold; un-paywalled languages.
9. **City field** beside postcode; **Find a Doctor = GP**, **Specialist = AI recommendation**.
10. **UX**: back-to-top button, slim/hidden scrollbar, iPhone bezel, centered layout, aligned icons, styled cancel modal.
11. **Languages**: re-translated all, added **Turkish**, full parity.
12. **Insurance filter**, **opening-hours date/time restriction**, **doctor calendar scaffold**, **email-request fallback**.
13. **Doctor data**: parsed `doctors_raw.xlsx`, generated `doctors.csv` (clean headers), imported to Supabase + RLS.
14. **Standalone vs n8n**: `USE_N8N` / `N8N_PRODUCTION` flags; booking direct-to-Supabase.
15. **Edge Functions**: `symptom-check` (Groq) and `find-doctors` (OSM) so the app runs without n8n; fixed CORS and Overpass reliability.

---

## 11. File map
| Path | Purpose |
|---|---|
| `index.html` / `homepage.html` / `symptom.html` / `doctors.html` / `booking.html` | App pages |
| `script.js` | All logic (page router, auth, i18n, doctor search, booking, scaffolds, run-mode flags) |
| `style.css` | Styles + device frame |
| `supabase/functions/symptom-check/index.ts` | Groq proxy (AI triage) |
| `supabase/functions/find-doctors/index.ts` | OSM doctor fallback |
| `doctors.csv` | Cleaned doctor data for Supabase import |
| `doctors_raw.xlsx` | Original source data |
