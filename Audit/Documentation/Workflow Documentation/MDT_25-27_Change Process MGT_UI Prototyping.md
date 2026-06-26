# ClearCare+ UI Prototyping

This document records how the ClearCare+ interface was prototyped. It covers the first wireframe (UI v1), the AI-assisted design iterations, the prompts used at each step, the design decisions made, and how the final prototype maps to the delivered app.

> **Method:** the UI was prototyped with an AI design tool. The students drew the first wireframe by hand, fed it to the tool as an image, and then refined the result through a series of plain-language prompts. Each prompt narrowed the scope and fixed one thing at a time. This doc is the audit trail of that process.

---

## 1. Starting point: UI v1 (hand wireframe)

**Image:** `Audit/UI Prototype/UI v1.jpeg`.

The first design was a 6-screen mobile wireframe titled "Business Process UI Designs." It mapped the full booking journey, one phone screen per process step:

| # | Screen | Purpose |
|---|---|---|
| 1 | Health Insurance Help (Home) | Branded landing with a "Get Help Now" button |
| 2 | General Survey | First-time "Quick Survey" with yes/no questions |
| 3 | Symptom Input (AI Recommendation) | Symptom checker with a recommended specialist |
| 4 | Doctor Recommendation & Database Search | Specialty/location filters plus doctor cards |
| 5 | Calendar Selection (Outlook Integration) | Calendar grid plus time slots plus insurance plan |
| 6 | User Confirmation and Success | "Appointment Request Sent" summary |

This wireframe is the visual twin of the BPMN flow (see the AI Health Insurance SaaS doc). It is low-fidelity. It exists to fix the screen order and the inputs per screen, not the look.

---

## 2. Iteration 1: polished interactive flow

**Prompt:** "Can you help me design a better UI based on this."

The tool read the 6-screen flow and rebuilt it as a polished, interactive, multi-step version. What was built:

- **Home:** branded landing with stats (2 min match time, 4.9 star rating, 500+ doctors) and a "Get Help Now" call to action.
- **Quick Survey:** 3 yes/no questions that must all be answered before proceeding.
- **Symptom Checker:** a search input plus toggleable symptom chips. An AI recommendation card appears once symptoms are selected.
- **Doctor Match:** 3 doctor cards with ratings, distance, and next availability. Selecting one highlights it.
- **Calendar Booking:** a June 2026 calendar grid plus 8 time-slot options. Both are disabled until a prior selection is made.
- **Confirmation:** a pulsing success animation plus a full appointment summary with insurance and copay details.

**Design improvements over the wireframe:**

- Deep navy (`#1a4a6b`) plus teal (`#2d9d8f`) palette for a clean, trustworthy feel.
- Fraunces serif for display headings, Plus Jakarta Sans for body text.
- Smooth slide animations between steps.
- Progress indicator dots at the bottom plus a top progress bar on steps 2 to 5.
- State carries forward, so the selected doctor and booking details appear on the confirmation screen.

---

## 3. Iteration 2: language as the primary filter

**Prompt:** "My main filter is language. I want to filter doctors through language."

The Doctors screen was reworked so language is the first filter, not specialty or location. This matches the core product idea that the app is language-first (see the AI Health Insurance SaaS doc).

- **Language pills** for each language (All, Cantonese, English, French, Gujarati, Hindi, Mandarin, Portuguese, Spanish), each with a count badge showing how many doctors speak it.
- Selecting a language filters the list instantly and resets any chosen doctor, so the user never books someone who does not match.
- The matched-language badge on each doctor card highlights in teal, so it is obvious why that doctor appeared.
- An empty-state message shows if no doctors match (future-proofing for edge cases).
- 2 new doctors were added so the filter is useful: Dr. Carlos Reyes (Spanish/Portuguese) and Dr. Wei Zhang (Mandarin/Cantonese).
- The confirmed screen also lists the doctor's spoken languages in the summary.

---

## 4. Iteration 3: scope down to login and registration

At this point the scope was deliberately narrowed. The full 6-screen flow was set aside so the team could lock down the entry experience first.

**Prompt:** "Forget all the pages. I just need the following process for registration and login page. If the user selects registration they need to input the following details for registration: First name, Last name, Email ID, setting up password, Birthdate (dd/mm/yyyy), Preferred language (English, Spanish, German, Hindi, French, Arabic). After submitting the registration, get them back to the login page. For the login page the user will need to enter the email and password previously set on the registration page. Lastly, after completing the login the user must be presented with the introduction page in their preferred language that was entered in the registration form."

What was built:

- **Sign in (default view):** email plus password fields with a show/hide toggle. A "Create an account" button routes to Register. After registering, a green confirmation banner appears. Credentials are validated against the registered account.
- **Register:** First name plus Last name side by side. Email, Password (show/hide), Confirm password. Date of birth with auto-formatting that inserts `/` as the user types. Language picker as a 3x2 grid of flag plus label tiles, one tap to select. Full validation with inline error messages before submission. On submit it returns to Sign in.
- **Welcome page (post-login):** greeting, body text, and call to action all rendered in the selected language (English, Spanish, German, Hindi, French, Arabic). Arabic switches to a right-to-left layout automatically. Shows an account summary (email, DOB, language). "Sign out" returns to Sign in.

---

## 5. Iteration 4: cleaner entry and a profile drawer

**Prompt:** "Remove the register option from the top and just keep the create an account option. Under the introduction page create a profile icon on the corner where the user can access their information. Do not show it directly on the introduction page."

What changed:

- **Login page:** the tab switcher at the top was removed. The result is a clean sign-in form with a "Create an account" button below it.
- **Introduction page:** no user info is shown directly. Instead there is a branded top bar with a profile avatar button (initials) in the top-right corner. Tapping it slides up a bottom drawer with a frosted backdrop. The drawer shows the full profile (name, email, DOB, preferred language) from registration. A drag handle and an X close button dismiss it. "Sign out" lives inside the drawer, not on the main page.

---

## 6. Iteration 5: healthcare framing and password rules

**Image:** `Audit/UI Prototype/UI v2.jpeg`.

UI v2 is the polished login screen produced from this second prompt. It is the first high-fidelity render of the entry flow:

- A teal gradient header with a heart icon, the brand name, and the tagline "Your health, in good hands."
- A "Welcome back" sign-in form with Email and Password fields, a show/hide eye toggle, and a "Sign In" button.
- A "New here?" divider with a "Create an Account" button below it.
- A "By continuing you agree to our Terms & Privacy Policy" footer.

> **Brand note.** UI v2 still shows the working name "MediCare+." The product was later rebranded to "ClearCare+" across the app and the n8n workflow (see the n8n Consolidation and Cleanup doc). The layout is the design that carried into the build.

A second, more complete prompt was written to restate the whole flow with stricter requirements.

**Prompt (second prompt):** "Create a Health Care Interface for the following login / registration process. For the login page the user will need to enter the email and password (previously set on the registration page). If the user has no account, create a button which sends them to the registration process. Under the registration page, the user needs to fill the following data:
- First name
- Last name
- Email ID
- Setting up password with the following restrictions (at least 8 characters, and must contain 1 special character and 1 number)
- Birthdate (dd/mm/yyyy)
- Preferred language (drop-down format): English, Spanish, German, Hindi, French, Arabic.

Also add a back arrow on the left corner of the screen that will return the user to the login page. After submitting the registration, return the user to the login page and present them a message 'Registration Completed'. Next, after completing the login the user must be presented with the introduction page in their preferred language that was entered in the registration form. Also create a profile icon where the user can review their data. The login page must have a button for starting an appointment booking process which we will develop later on."

**Follow-up tweak:** "Change the format to an app UI, as we are working on a mobile-first environment. Then take the 'Book an appointment' button from the login page."

This locked in three things: stronger password rules, a mobile-first app frame, and removing the booking button from the login page (booking is a later step, not part of the entry flow).

---

## 7. Final prompt (the one used)

**Prompt (third prompt):** "Create a Health Care app Interface for the following login / registration process. For the login page the user will need to enter the email and password (previously set on the registration page). If the user has no account, create a button which sends them to the registration process. Under the registration page, the user needs to fill the following data:
- First name
- Last name
- Email ID
- Setting up password with the following restrictions (at least 8 characters, and must contain 1 special character and 1 number)
- Birthdate (dd/mm/yyyy)
- Preferred language (drop-down format): English, Spanish, German, Hindi, French, Arabic.

Also add a back arrow on the left corner of the screen that will return the user to the login page. After submitting the registration, return the user to the login page and present them a message 'Registration Completed'. Next, after completing the login the user must be presented with the introduction page in their preferred language that was entered in the registration form. Also create a profile icon where the user can review their data."

This is the final prototype brief. It is the same as the second prompt, reframed as a mobile app UI and without the booking button.

---

## 8. Final prototype: the delivered entry flow

The agreed prototype is a mobile-first app with three states:

1. **Login.** Email plus password. A "Create an account" button routes to Register. No booking button. Invalid credentials are blocked.
2. **Register.** Back arrow in the top-left returns to Login. Fields: First name, Last name, Email, Password (at least 8 characters, 1 special character, 1 number), Birthdate (dd/mm/yyyy), Preferred language as a drop-down (English, Spanish, German, Hindi, French, Arabic). On submit it returns to Login and shows a "Registration Completed" message.
3. **Introduction page.** Rendered in the user's preferred language. A profile icon in the corner opens the user's data. No personal data is shown directly on the page.

---

## 9. How the prototype maps to the built app

The prototype shaped the real pages. See the System Overview for the live behavior.

| Prototype element | Delivered in |
|---|---|
| Login (email + password) | `index.html` via Supabase Auth |
| Create an account / Register form | `index.html` register view; profile saved to `profiles` |
| Preferred language picker | Language stored on the profile; drives the whole UI |
| Registration confirmation message | Maps to the email-confirmation step (Supabase Auth, Mailjet SMTP) |
| Introduction page in the user's language | `homepage.html` greeting plus localized UI |
| Profile icon and drawer | `homepage.html` avatar opens the Patient Information sheet |
| Mobile-first app frame | iPhone-style bezel in `style.css` |
| Six languages | English, Spanish, German, Turkish, Hindi, Arabic |

> **Note on language set.** The prototype prompts listed French as one of the six languages. In the delivered build French was replaced by Turkish, so the live set is English, Spanish, German, Turkish, Hindi, and Arabic (see System Overview, internationalization).

> **Note on the wider flow.** The early prototype (Sections 1 to 3) designed the full journey: survey, symptom checker, doctor match, calendar booking, and confirmation. The team then scoped the prototype down to the entry flow (Sections 4 to 8) to lock it first. The survey, symptom, doctor, and booking screens were built later in the real app (`symptom.html`, `doctors.html`, `booking.html`), so the full journey from UI v1 is delivered, just built in stages.

---

## 10. Design decisions (summary)

- **Mobile-first.** The app is framed as a phone because the core users are on mobile. This keeps the feature set narrow and avoids empty space.
- **Language-first.** Language is the primary filter and the preferred language drives the whole UI, including the introduction page.
- **One thing per prompt.** Each iteration fixed one concern (palette, language filter, scope, profile drawer, password rules). This kept the AI output controllable.
- **Privacy on the intro page.** Personal data lives behind a profile icon and a drawer, not on the main screen.
- **Validation up front.** Password rules and inline errors are enforced before submission, not after.

---

*Companion to: MDT_25-27_Change Process MGT_System Overview.md and MDT_25-27_Change Process MGT_AI Health Insurance SaaS.md. Source image: `Audit/UI Prototype/UI v1.jpeg`.*
