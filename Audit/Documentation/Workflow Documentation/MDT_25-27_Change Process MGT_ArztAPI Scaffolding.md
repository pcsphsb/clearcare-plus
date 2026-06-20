# ArztAPI Scaffolding

This document explains the **dummy ArztAPI pathway** that lives in `script.js`.

## TL;DR

- ArztAPI is a **placeholder** for a future direct doctor-booking integration.
- It is **NOT live**. The **n8n webhook** is the real, active pathway today.
- The placeholder is safe to ship: while the feature flag is off, it makes **no network calls** and the app behaves exactly as before.
- Its only job right now is to **document where and how** a real ArztAPI would slot in, so future work has a clear seam instead of a rewrite.

---

## Why a dummy pathway?

We want the code to *structurally* show the future integration point without committing to it. This uses the **feature-flag + adapter** pattern:

- A **flag** (`ARZT_API_ENABLED`) decides which pathway runs.
- An **adapter function** wraps the future API and returns a harmless mock while disabled.
- A **labeled branch** at each call site shows exactly what ArztAPI would replace.

Because the flag is `false`, the ArztAPI branch is **dead code at runtime** - it never executes, never hits a non-existent server, and never errors.

---

## Where it lives in `script.js`

Everything is fenced with clear `START` / `END` banners so the two pathways never get mixed up.

### 1. Config + adapters (top of file)

Inside the box-drawn banner `DUMMY ArztAPI PATHWAY - START … END`, right under the n8n webhook constants:

| Symbol | Purpose |
|--------|---------|
| `ARZT_API_ENABLED` | Master switch. **Keep `false`** - n8n stays the main path. |
| `ARZT_API_URL` | Future: the real ArztAPI booking endpoint. Empty for now. |
| `ARZT_API_KEY` | Future: auth token / API key. Empty for now. |
| `bookViaArztApi(payload)` | Adapter for **new bookings**. Returns a mock while disabled; real `fetch` is commented out. |
| `rescheduleViaArztApi(payload)` | Adapter for **reschedules**. Same disabled-stub contract. |

### 2. Call sites (inside `handleBooking()`)

`handleBooking()` has two branches, and **each** contains a clearly labeled fork:

**New booking branch** (`rescheduleId == null`):
```
DUMMY ArztAPI PATHWAY - START (inactive) … END   ← if (ARZT_API_ENABLED)
n8n WEBHOOK PATHWAY - START (ACTIVE / main) … END  ← else (runs today)
```

**Reschedule branch** (`rescheduleId != null`):
```
DUMMY ArztAPI PATHWAY - START (inactive) … END        ← if (ARZT_API_ENABLED)
Supabase UPDATE PATHWAY - START (ACTIVE / main) … END  ← else (runs today)
```

A single shared payload object (`bookingPayload` / `reschedulePayload`) feeds both pathways so they always send the same shape.

---

## Data shapes

**Booking payload** (sent to n8n today; intended for ArztAPI later):
```json
{
  "user_id": "uuid",
  "doctor_name": "string",
  "doctor_specialty": "string",
  "doctor_address": "string",
  "datetime": "YYYY-MM-DDTHH:MM:00"
}
```

**Reschedule payload**:
```json
{
  "appointment_id": "id of the existing row",
  "user_id": "uuid",
  "datetime": "YYYY-MM-DDTHH:MM:00"
}
```

**Expected ArztAPI response** (mocked by the stub today):
```json
{ "ok": true, "source": "stub", "confirmation_id": "DUMMY-<timestamp>" }
```

While disabled, both adapters log what they *would* send:
```
[ArztAPI] (stub - inactive) would POST: { ... }
[ArztAPI] (stub - inactive) would PATCH reschedule: { ... }
```

---

## How the two pathways compare

| Concern | n8n (ACTIVE) | ArztAPI (dummy) |
|---------|--------------|-----------------|
| New booking | `POST` to `N8N_BOOKING_WEBHOOK` → inserts a Supabase row | `bookViaArztApi(payload)` |
| Reschedule | `sb.from("appointments").update().eq("id", …)` | `rescheduleViaArztApi(payload)` |
| Persistence | Supabase `appointments` table | Would need to mirror to Supabase (see note below) |
| Status | Live | Inactive (flag off) |

---

## Going live one day (checklist)

1. Set `ARZT_API_ENABLED = true`.
2. Fill `ARZT_API_URL` and `ARZT_API_KEY`.
3. Uncomment the real `fetch` block inside `bookViaArztApi()` **and** `rescheduleViaArztApi()`.
4. **Keep the app's read model in sync.** The UI (confirmation screen, Appointments list, Overview) reads from the Supabase `appointments` table. So even when ArztAPI is the system of record, the ArztAPI branch must still **persist/mirror the appointment to Supabase** - otherwise the lists won't update. The `NOTE:` comments at both call sites flag exactly where to do this.
5. Test new booking **and** reschedule end-to-end, then confirm the times match in both the UI and the Supabase table editor (see the wall-clock note below).

---

## Related implementation note: wall-clock times

Appointment times are stored as naive wall-clock values and read back with `apptParts()` (no timezone conversion). Any real ArztAPI integration should preserve the same `YYYY-MM-DDTHH:MM:00` format so the displayed time keeps matching what was booked.
