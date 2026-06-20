-- =====================================================================
-- ClearCare+  —  Supabase database setup (run in Supabase SQL Editor)
-- Re-runnable: uses "if not exists" + "add column if not exists" + drops
-- policies before recreating. Sections 1-6 are data-safe (never drop a
-- table or delete rows). Section 7 is the ONE structural part: it retires the
-- legacy doctors_dummy table and reconnects appointments.doctor_id to the real
-- doctors table (FK). Safe to re-run — drops use "if exists" and the orphan
-- cleanup only nulls already-broken links.
--
-- Reflects the REAL ecosystem (verified via schema dump):
--   profiles, consultations, doctors (real), appointments,
--   appointments_cancel, appointments_reschedule
-- Section 7 retires doctors_dummy and adds the appointments -> doctors FK.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) PROFILES  (one row per user)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  birthdate text,
  language text,
  insurance_type text,
  insurance_company text,
  postcode text,
  city text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
drop policy if exists "select own profile" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "select own profile" on public.profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2) CONSULTATIONS  (each symptom-checker result)
-- ---------------------------------------------------------------------
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
drop policy if exists "insert own consultations" on public.consultations;
drop policy if exists "select own consultations" on public.consultations;
create policy "insert own consultations" on public.consultations for insert with check (auth.uid() = user_id);
create policy "select own consultations" on public.consultations for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3) DOCTORS  (the REAL directory — imported from your own data, NOT seeded here)
--    Schema matches the live table: address + per-weekday opening hours +
--    contact fields + accepts_insurance. There is intentionally NO sample
--    INSERT here anymore (the old dummy seed was the "faulty" part). Your
--    real rows are loaded separately (import / your own pipeline).
-- ---------------------------------------------------------------------
create table if not exists public.doctors (
  id bigint generated always as identity primary key,
  name text,
  specialty text,
  address text,
  postcode text,
  city text,
  languages text,                     -- e.g. "German, English"
  email text,
  phone text,
  website text,
  hours_mon text,                     -- e.g. "09:00-12:00, 14:00-17:00" ("" / null = closed)
  hours_tue text,
  hours_wed text,
  hours_thu text,
  hours_fri text,
  hours_sat text,
  hours_sun text,
  accepts_insurance text              -- e.g. "Public, Private"
);

-- Bring an older/real table up to the full column set without touching data.
alter table public.doctors add column if not exists address text;
alter table public.doctors add column if not exists postcode text;
alter table public.doctors add column if not exists city text;
alter table public.doctors add column if not exists languages text;
alter table public.doctors add column if not exists email text;
alter table public.doctors add column if not exists phone text;
alter table public.doctors add column if not exists website text;
alter table public.doctors add column if not exists hours_mon text;
alter table public.doctors add column if not exists hours_tue text;
alter table public.doctors add column if not exists hours_wed text;
alter table public.doctors add column if not exists hours_thu text;
alter table public.doctors add column if not exists hours_fri text;
alter table public.doctors add column if not exists hours_sat text;
alter table public.doctors add column if not exists hours_sun text;
alter table public.doctors add column if not exists accepts_insurance text;

alter table public.doctors enable row level security;
-- Drop both historical policy names so this is idempotent regardless of which exists.
drop policy if exists "Public can read doctors" on public.doctors;
drop policy if exists "anyone can read doctors" on public.doctors;
create policy "Public can read doctors" on public.doctors for select using (true);
-- (No insert/update/delete policy: only the service_role key can write doctors.)

-- ---------------------------------------------------------------------
-- 4) APPOINTMENTS  (bookings)
--    Live table carries doctor_* text snapshots (so the list/reschedule work
--    without a join) plus optional translated note fields. doctor_id is kept
--    for compatibility but the app books by text, so it is usually null.
-- ---------------------------------------------------------------------
create table if not exists public.appointments (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  doctor_id bigint,                   -- legacy FK (see OPTIONAL CLEANUP about its target)
  datetime timestamptz,
  status text default 'confirmed',
  created_at timestamptz default now(),
  doctor_name text,
  doctor_specialty text,
  doctor_address text,
  note_original text,                 -- free-text note as typed
  note_de text                        -- German translation of the note (n8n/translate flow)
);

-- Ensure the snapshot/note columns exist on an older table without dropping data.
alter table public.appointments add column if not exists doctor_name text;
alter table public.appointments add column if not exists doctor_specialty text;
alter table public.appointments add column if not exists doctor_address text;
alter table public.appointments add column if not exists note_original text;
alter table public.appointments add column if not exists note_de text;

alter table public.appointments enable row level security;
-- Reconcile the duplicate/legacy policies into one canonical owner-only set.
-- Drop BOTH the legacy names AND the canonical names below, so a re-run never
-- hits "policy already exists".
drop policy if exists "select own appointments" on public.appointments;
drop policy if exists "insert own appointments" on public.appointments;
drop policy if exists "update own appointments" on public.appointments;
drop policy if exists "delete own appointments" on public.appointments;
drop policy if exists "owner can select appointments" on public.appointments;
drop policy if exists "owner can insert appointments" on public.appointments;
drop policy if exists "owner can update appointments" on public.appointments;
drop policy if exists "owner can delete appointments" on public.appointments;
create policy "select own appointments" on public.appointments for select using (auth.uid() = user_id);
create policy "insert own appointments" on public.appointments for insert with check (auth.uid() = user_id);
create policy "update own appointments" on public.appointments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own appointments" on public.appointments for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5) APPOINTMENTS_CANCEL  (audit log of cancelled/deleted bookings)
--    The app archives a row here right before it deletes the booking from
--    `appointments` (see cancelAppointment() in script.js). This is a
--    tracking/metrics table only — intentionally INVISIBLE in the UI and
--    user account: users get INSERT (to archive their own cancellation) but
--    NO SELECT, so the rows never surface back to them. Read it from the
--    Supabase dashboard / service_role for metrics: cancel & reschedule
--    frequency, booking-to-cancel lead time, and malicious-booking safeguards.
--    Columns mirror the live `appointments` row plus cancellation metadata.
-- ---------------------------------------------------------------------
create table if not exists public.appointments_cancel (
  id bigint generated always as identity primary key,
  original_appointment_id bigint,                 -- id the row had in `appointments`
  user_id uuid references auth.users(id) on delete cascade,
  doctor_name text,
  doctor_specialty text,
  doctor_address text,
  datetime timestamptz,                           -- the slot that was cancelled
  status text,                                    -- status the appointment had when cancelled
  booked_at timestamptz,                          -- original appointments.created_at (lead-time metrics)
  cancelled_at timestamptz default now(),         -- when the cancellation happened
  source text default 'user_cancel'               -- 'user_cancel' | (future: 'reschedule', 'system_override')
);

alter table public.appointments_cancel enable row level security;
drop policy if exists "insert own cancellations" on public.appointments_cancel;
-- INSERT only: a user may archive their own cancellation...
create policy "insert own cancellations" on public.appointments_cancel for insert with check (auth.uid() = user_id);
-- ...and deliberately NO select/update/delete policy, so the audit log is
-- write-once from the client and never shown back in the app. Use the
-- Supabase dashboard or the service_role key for reporting/metrics.

-- ---------------------------------------------------------------------
-- 6) APPOINTMENTS_RESCHEDULE  (audit log of rescheduled bookings)
--    Same invisible, write-once pattern as appointments_cancel. A reschedule
--    UPDATEs the appointments row in place (the booking still exists), so we
--    log the change here instead of in appointments_cancel: it captures BOTH
--    the old and the new slot, which a cancel row cannot. handleBooking() in
--    script.js inserts one row after a successful reschedule. Users get INSERT
--    but NO SELECT — invisible in the UI/account. For metrics: reschedule
--    frequency, how far the slot moved (old_datetime -> new_datetime), and
--    booking-to-reschedule lead time (booked_at vs rescheduled_at).
-- ---------------------------------------------------------------------
create table if not exists public.appointments_reschedule (
  id bigint generated always as identity primary key,
  appointment_id bigint,                          -- appointments.id that was rescheduled (still exists)
  user_id uuid references auth.users(id) on delete cascade,
  doctor_name text,
  doctor_specialty text,
  doctor_address text,
  old_datetime timestamptz,                       -- slot before the change
  new_datetime timestamptz,                       -- slot after the change
  booked_at timestamptz,                          -- original appointments.created_at (lead-time metrics)
  rescheduled_at timestamptz default now(),       -- when the reschedule happened
  source text default 'user_reschedule'           -- 'user_reschedule' | (future: 'system_override')
);

alter table public.appointments_reschedule enable row level security;
drop policy if exists "insert own reschedules" on public.appointments_reschedule;
-- INSERT only (archive own reschedule); deliberately NO select/update/delete,
-- so it stays a write-once audit log, never shown back in the app.
create policy "insert own reschedules" on public.appointments_reschedule for insert with check (auth.uid() = user_id);

-- =====================================================================
-- 7) RETIRE doctors_dummy + RECONNECT appointments -> doctors  (run in order)
-- ---------------------------------------------------------------------
-- Goal: a REAL, visible relationship so the demo shows the database
-- communicating. `appointments.doctor_id` becomes a foreign key to the live
-- `doctors` table (replacing the old link to the prototype doctors_dummy).
-- The app now writes doctor_id when a booking comes from the doctors table
-- (see handleBooking() in script.js); OSM-fallback doctors aren't in the table,
-- so their doctor_id stays NULL — which the FK allows. ON DELETE SET NULL means
-- removing a doctor never deletes a patient's appointment; it just clears the
-- link (the doctor_name / doctor_specialty / doctor_address text snapshot stays).
-- ---------------------------------------------------------------------

-- Step A — drop the old FK that tied appointments to the dummy table.
alter table public.appointments drop constraint if exists appointments_doctor_id_fkey;

-- Step B — remove the dummy table now that nothing references it.
drop table if exists public.doctors_dummy;

-- Step C — clear any orphaned doctor_id values (old rows that pointed at a
--          doctors_dummy id which no longer exists), so the new FK can be added
--          without a violation. Real bookings had doctor_id NULL anyway.
update public.appointments a
   set doctor_id = null
 where a.doctor_id is not null
   and not exists (select 1 from public.doctors d where d.id = a.doctor_id);

-- Step D — add the real FK: appointments.doctor_id -> doctors.id.
--          Drop-then-add keeps this re-runnable.
alter table public.appointments drop constraint if exists appointments_doctor_id_fkey;
alter table public.appointments
  add constraint appointments_doctor_id_fkey
  foreign key (doctor_id) references public.doctors(id) on delete set null;
-- =====================================================================

-- =====================================================================
-- RESET-FOR-DEMO HELPER  (DESTRUCTIVE — all commented out; run by hand)
-- ---------------------------------------------------------------------
-- During testing the `id` sequences keep climbing (e.g. appointment id 27+)
-- because Postgres identity sequences never roll back on DELETE — gaps are
-- normal and fine in real use. Use this ONLY when you want a clean slate for a
-- screenshot/presentation. `truncate ... restart identity` empties the table AND
-- resets its id counter to 1. Run the day before the demo, after your last test.
--
-- Safe because nothing has a foreign key POINTING AT these tables
-- (appointments_cancel.original_appointment_id and appointments_reschedule.
-- appointment_id are plain bigint copies, not FKs). Do NOT truncate `doctors`
-- or `profiles` — doctors.id is the FK target your bookings reference, and
-- profiles mirrors your Auth users.
--
-- Clear bookings + both audit logs and restart their id counters at 1:
--   truncate table public.appointments            restart identity;
--   truncate table public.appointments_cancel     restart identity;
--   truncate table public.appointments_reschedule restart identity;
--
-- Already deleted the rows and only want the counter back to 1 (no data loss):
--   alter table public.appointments            alter column id restart with 1;
--   alter table public.appointments_cancel     alter column id restart with 1;
--   alter table public.appointments_reschedule alter column id restart with 1;
-- =====================================================================
