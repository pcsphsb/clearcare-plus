/* =========================================================================
   ClearCare+  -  shared logic for every page (auth, homepage, symptom,
   doctors, booking). One file: it auto-detects which page it is on and runs
   that page's init (see the DOMContentLoaded router near the bottom).

   Flow:
     index.html    : register / log in  ->  on login, redirect to homepage.html
     homepage.html : guarded; if not logged in, redirect back to index.html
   Auth + data are handled by Supabase; the session persists in the browser.
   ========================================================================= */

/* ===================== Supabase config ===================== */
const SUPABASE_URL = "https://ossxctklhsoiiigixuvt.supabase.co";
const SUPABASE_KEY = "sb_publishable_ivwCyL4ilX00fpvfpIgZtg_hrxl-lbk";   // publishable (anon) key - safe to ship in the client
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ===================== Run mode (standalone vs n8n) =====================
   PROFESSOR NOTE: by default the app runs WITHOUT n8n. Two switches decide
   where each step runs.

   USE_N8N = false (default) -> the app runs on its own:
       booking       -> written directly to Supabase (insert into "appointments")
       symptom check -> Supabase Edge Function "symptom-check" (proxies Groq)
       doctor search -> Supabase "doctors" table, with the "find-doctors" Edge
                        Function (OSM) as the out-of-DB-area fallback
   USE_N8N = true            -> those same three steps route through n8n instead,
                                so each workflow can be shown executing live.

   N8N_PRODUCTION = true  -> n8n production URLs (workflow Active; hands-free).
   N8N_PRODUCTION = false -> n8n test URLs that need "Listen for test event"
                             (the manual step-by-step demo). Each n8n Webhook
                             node also needs Allowed Origins (CORS) = *.
   ===================================================================== */
const USE_N8N = false;
const N8N_PRODUCTION = true;

/* n8n webhook URLs (only used when USE_N8N = true). */
const N8N_BASE = "https://pcsphsb.app.n8n.cloud";
const _N8N_SEG = N8N_PRODUCTION ? "webhook" : "webhook-test";
const N8N_SYMPTOM_WEBHOOK = `${N8N_BASE}/${_N8N_SEG}/symptom-check`;
const N8N_DOCTORS_WEBHOOK = `${N8N_BASE}/${_N8N_SEG}/find-doctors`;
const N8N_BOOKING_WEBHOOK = `${N8N_BASE}/${_N8N_SEG}/book-appointment`;

/* Supabase Edge Functions (used when USE_N8N = false, i.e. the standalone app).
   See supabase/functions/ and the Edge Functions Setup doc. */
const SYMPTOM_FN_URL = `${SUPABASE_URL}/functions/v1/symptom-check`;   // AI triage (Groq, key server-side)
const DOCTORS_FN_URL = `${SUPABASE_URL}/functions/v1/find-doctors`;   // OSM fallback (Nominatim + Overpass)

/* ===================== DUMMY ArztAPI PATHWAY (NOT LIVE / placeholder) =====================
   Structural stub for a future paid direct-booking API ("ArztAPI"). It is
   INACTIVE: while ARZT_API_ENABLED is false nothing here makes a network call;
   it only documents WHERE and HOW such an API would slot into the booking flow.
   The real booking paths today are Direct Supabase (default) or n8n (demo).
   To go live one day: set ARZT_API_ENABLED = true, fill ARZT_API_URL, and
   uncomment the real fetch inside bookViaArztApi(). */
const ARZT_API_ENABLED = false;   // keep false (booking uses Direct Supabase / n8n)
const ARZT_API_URL = "";          // future: real ArztAPI booking endpoint
const ARZT_API_KEY = "";          // future: auth token / api key for ArztAPI

/* Adapter for the (future) ArztAPI. While ARZT_API_ENABLED is false this never
   touches the network. It returns a mock so the data flow stays runnable and
   the expected request/response shape is visible. */
async function bookViaArztApi(payload){
  // payload shape we intend to send to a real ArztAPI:
  //   { user_id, doctor_name, doctor_specialty, doctor_address,
  //     datetime: "YYYY-MM-DDTHH:MM:00" }
  if (!ARZT_API_ENABLED){
    console.log("[ArztAPI] (stub, inactive) would POST:", payload);
    return { ok: true, source: "stub", confirmation_id: "DUMMY-" + Date.now() };
  }

  /* ---- REAL implementation goes here once ArztAPI exists (currently disabled) ----
  const res = await fetch(ARZT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + ARZT_API_KEY
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("ArztAPI HTTP " + res.status);
  return await res.json();   // expected: { ok, confirmation_id, ... }
  ------------------------------------------------------------------------------- */
}

/* Adapter for the (future) ArztAPI RESCHEDULE call. Same disabled-stub contract
   as bookViaArztApi(): no network while ARZT_API_ENABLED is false. */
async function rescheduleViaArztApi(payload){
  // payload shape: { appointment_id, user_id, datetime }
  if (!ARZT_API_ENABLED){
    console.log("[ArztAPI] (stub, inactive) would PATCH reschedule:", payload);
    return { ok: true, source: "stub", confirmation_id: "DUMMY-" + Date.now() };
  }

  /* ---- REAL implementation goes here once ArztAPI exists (currently disabled) ----
  const res = await fetch(ARZT_API_URL + "/" + payload.appointment_id, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + ARZT_API_KEY
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("ArztAPI HTTP " + res.status);
  return await res.json();   // expected: { ok, confirmation_id, ... }
  ------------------------------------------------------------------------------- */
}
/* ===================== END DUMMY ArztAPI PATHWAY ===================== */

/* ===================== INSURANCE AVAILABILITY FILTER (scaffolding, OFF) =====================
   Silently narrows doctor results to those that accept the patient's insurance.
   OFF today because the imported doctor DB has no insurance data. When the DB
   gains an `accepts_insurance` column (e.g. "Public" / "Private" / "Public,Private"),
   set INSURANCE_FILTER_ENABLED = true and it applies automatically (no UI change). */
const INSURANCE_FILTER_ENABLED = false;   // flip true once doctors carry insurance data

/* ===================== DOCTOR CALENDAR SYNC (scaffolding, NOT LIVE) =====================
   In a live system this would read a doctor's own calendar (free/busy) so the time
   slots reflect real availability on BOTH sides. We only have exported/static data
   and cannot talk to live doctor systems, so this is inactive: it returns null and
   booking falls back to the opening-hours slots. Flip DOCTOR_CALENDAR_ENABLED and
   implement the fetch later. */
const DOCTOR_CALENDAR_ENABLED = false;   // keep false: no live doctor calendars in this prototype

/* Returns an array of free "HH:MM" slots from the doctor's real calendar, or
   null when unavailable (then we use opening-hours slots). Inactive stub today. */
async function fetchDoctorCalendarSlots(doctor){
  if (!DOCTOR_CALENDAR_ENABLED){
    console.log("[DoctorCalendar] (stub inactive) would fetch free/busy for:", doctor && doctor.name);
    return null;   // -> caller falls back to opening-hours slots
  }

  /* ---- REAL two-way calendar sync goes here once available (currently disabled) ----
     // e.g. fetch the doctor's free/busy from a scheduling provider, then return
     // only the open slots so a booking writes to BOTH the patient and doctor side:
     // const res = await fetch(`${DOCTOR_CALENDAR_URL}?doctor=${doctor.id}`);
     // const busy = await res.json();
     // return computeFreeSlots(doctor.opening_hours, busy);
  ------------------------------------------------------------------------------- */
}

/* ===================== German insurers (by type) ===================== */
const INSURERS = {
  Public: ["Techniker Krankenkasse (TK)", "AOK", "Barmer", "DAK-Gesundheit", "KKH", "IKK classic", "HEK", "BKK"],
  Private: ["Allianz", "AXA", "Debeka", "DKV", "HUK-Coburg", "Signal Iduna", "Gothaer", "Hallesche"]
};

/* Holds the logged-in user's id/email + their profiles-table row */
let currentUserId = "";
let currentEmail = "";
let currentProfile = {};
let lastDoctorType = "";   // set by the symptom checker, used by "Find this doctor"
let docSearchSpecialty = ""; // the specialty doctors.html searches for: "General Practitioner" (GP mode) or the AI recommendation (specialist mode)
let lastDoctors = [];      // the rendered doctor list (so "Book" can look one up)
let bookingDoctor = null;  // the doctor being booked on booking.html
let rescheduleId = null;   // when set, booking.html UPDATEs this appointment row instead of inserting
let rescheduleOldDatetime = null;  // the slot BEFORE a reschedule (logged to appointments_reschedule)
let rescheduleBookedAt = null;     // original appointments.created_at carried into the reschedule log (lead-time metrics)
let bookingByDay = null;   // selected doctor's opening hours {weekday:[[start,end]]} for closed-day validation

/* ===================== Multilingual content (homepage) ===================== */
const CONTENT = {
  English:{dir:"ltr",greeting:"Welcome",subtitle:"Here's your health summary for today.",quote:"Your health is your greatest wealth."},
  Spanish:{dir:"ltr",greeting:"Bienvenido",subtitle:"Aquí está tu resumen de salud de hoy.",quote:"Tu salud es tu mayor riqueza."},
  German:{dir:"ltr",greeting:"Willkommen",subtitle:"Hier ist Ihre heutige Gesundheitsübersicht.",quote:"Ihre Gesundheit ist Ihr größter Reichtum."},
  Hindi:{dir:"ltr",greeting:"स्वागत है",subtitle:"यहाँ आज का आपका स्वास्थ्य सारांश है।",quote:"आपका स्वास्थ्य आपकी सबसे बड़ी संपत्ति है।"},
  Turkish:{dir:"ltr",greeting:"Hoş geldiniz",subtitle:"İşte bugünkü sağlık özetiniz.",quote:"Sağlığınız en büyük servetinizdir."},
  Arabic:{dir:"rtl",greeting:"أهلاً وسهلاً",subtitle:"إليك ملخص صحتك لهذا اليوم.",quote:"صحتك هي أعظم ثرواتك."}
};

/* ===================== UI translations (i18n) =====================
   Elements with a data-i18n="key" attribute get translated by applyI18n(language).
   Keyed by the same language names used at registration. */
const UI_T = {
  English: {
    nav_actions:"What would you like to do today?", overview:"Overview",
    act_symptom_t:"Find a Specialist Doctor", act_symptom_s:"Answer a few questions to find the right specialist",
    act_doctor_t:"Find a Doctor", act_doctor_s:"Browse the doctor directory",
    complete_profile:"Complete your profile", patient_info:"Patient Information",
    sign_out:"Sign out", save_continue:"Save & continue",
    ins_type:"Insurance type", ins_company:"Insurance company", postcode:"Postcode", city:"City",
    sym_title:"Symptom Checker", sym_sub:"We'll point you to the right doctor.",
    sym_check_btn:"Check symptoms", find_this_doctor:"Find this doctor",
    sym_lang_note:"The result is shown in your profile language, no matter which language you type in.",
    doc_title:"Find a Doctor", doc_sub:"Doctors near you, from the open directory.",
    doc_search_btn:"Find doctors near me",
    bk_title:"Book Appointment", bk_sub:"Pick a time that works for you.",
    bk_date:"Date", bk_time:"Time", bk_confirm_btn:"Confirm booking",
    bk_confirmed:"Appointment confirmed!", back_home:"Back to home",
    full_name:"Full name", email_label:"Email", dob:"Date of birth", pref_lang:"Preferred language",
    ov_appt:"Appointments", ov_appt_s:"No upcoming", ov_presc:"Prescriptions", ov_presc_s:"Active: 0",
    ov_records:"Records", ov_records_s:"0 files", ov_vitals:"Vitals", ov_vitals_s:"Last check: none",
    sym_intro:"Tell us how you're feeling, in your own words. This helps us suggest the right type of doctor. It is not a diagnosis.",
    sym_input_ph:"e.g. I've had a sore throat and a mild fever for 3 days",
    analyzing:"Analyzing your symptoms…", referral_note:"A GP referral (Überweisung) may be needed first.",
    sym_disclaimer:"ClearCare+ helps you find the right type of doctor. This is navigation guidance, not a medical diagnosis.",
    searching:"Searching nearby doctors…", doc_context:"Based on your symptom check, you may need a {spec}.",
    gp_context:"Showing general practitioners (GP) near you.",
    doc_disclaimer:"Doctor data from OpenStreetMap (open data). Coverage may be incomplete. This is a directory, not a booking guarantee.",
    lang_spoken:"Languages spoken", premium:"PREMIUM", book:"Book", call:"Call", website:"Website",
    filter_language:"Preferred language", any_language:"Any language", langs_not_listed:"Languages not listed",
    select_time:"Select a time", booking_loading:"Booking…",
    bk_hours_label:"Opening hours", bk_avail_note:"Times shown follow the practice's opening hours.",
    bk_no_hours:"This practice hasn't published online availability. You can request an appointment by email instead.", bk_email_btn:"Request appointment by email",
    bk_closed_day:"The practice is closed on this day. Please pick another date.",
    bk_note:"Bring your insurance card and a referral (Überweisung) if a specialist needs one.",
    bk_disclaimer:"This is a prototype booking. It records your request in the system. Real availability would come from a doctor scheduling API.",
    reg_create_title:"Create Account", reg_join:"Join ClearCare+ today",
    reg_first:"First name", reg_last:"Last name", reg_email:"Email ID", reg_password:"Password",
    pw_len:"At least 8 characters", pw_num:"Contains at least 1 number", pw_spec:"Contains at least 1 special character",
    reg_select_lang:"Select a language", reg_create_btn:"Create Account", reg_have:"Already have an account?", reg_signin:"Sign in",
    profile_desc:"A few more details so we can match you to the right doctors and your insurance.",
    sel_type:"Select type", opt_public:"Public (GKV)", opt_private:"Private (PKV)", sel_insurer:"Select your insurer",
    edit_profile:"Edit profile", save_changes:"Save changes", cancel:"Cancel", ov_files:"records",
    appt_title:"Your appointments", appt_sub:"Upcoming appointments",
    rec_title:"Your records", rec_sub:"Saved symptom checks",
    reschedule:"Reschedule", cancel_appt:"Cancel", reschedule_title:"Reschedule appointment",
    reschedule_btn:"Save new time", confirm_cancel:"Cancel this appointment? This cannot be undone.",
    yes_cancel:"Yes, cancel", keep_appt:"Keep appointment",
    appt_empty:"No appointments yet.", rec_empty:"No records yet.",
    loading_generic:"Loading…", load_failed:"Couldn't load. Please try again.", appt_past:"past"
  },
  Spanish: {
    nav_actions:"¿Qué te gustaría hacer hoy?", overview:"Resumen",
    act_symptom_t:"Buscar un Médico Especialista", act_symptom_s:"Responde unas preguntas para encontrar al especialista adecuado",
    act_doctor_t:"Buscar un Médico", act_doctor_s:"Explora el directorio de médicos",
    complete_profile:"Completa tu perfil", patient_info:"Información del Paciente",
    sign_out:"Cerrar sesión", save_continue:"Guardar y continuar",
    ins_type:"Tipo de seguro", ins_company:"Compañía de seguros", postcode:"Código postal", city:"Ciudad",
    sym_title:"Verificador de Síntomas", sym_sub:"Te indicaremos el médico adecuado.",
    sym_check_btn:"Verificar síntomas", find_this_doctor:"Buscar este médico",
    sym_lang_note:"El resultado se muestra en el idioma de tu perfil, sin importar en qué idioma escribas.",
    doc_title:"Buscar un Médico", doc_sub:"Médicos cerca de ti, del directorio abierto.",
    doc_search_btn:"Buscar médicos cerca de mí",
    bk_title:"Reservar Cita", bk_sub:"Elige una hora que te convenga.",
    bk_date:"Fecha", bk_time:"Hora", bk_confirm_btn:"Confirmar reserva",
    bk_confirmed:"¡Cita confirmada!", back_home:"Volver al inicio",
    full_name:"Nombre completo", email_label:"Correo electrónico", dob:"Fecha de nacimiento", pref_lang:"Idioma preferido",
    ov_appt:"Citas", ov_appt_s:"Ninguna próxima", ov_presc:"Recetas", ov_presc_s:"Activas: 0",
    ov_records:"Historial", ov_records_s:"0 archivos", ov_vitals:"Signos vitales", ov_vitals_s:"Último control: ninguno",
    sym_intro:"Cuéntanos cómo te sientes, con tus propias palabras. Esto nos ayuda a sugerir el tipo de médico adecuado. No es un diagnóstico.",
    sym_input_ph:"p. ej. He tenido dolor de garganta y fiebre leve durante 3 días",
    analyzing:"Analizando tus síntomas…", referral_note:"Puede que primero necesites un volante (Überweisung) del médico de cabecera.",
    sym_disclaimer:"ClearCare+ te ayuda a encontrar el tipo de médico adecuado. Es una orientación, no un diagnóstico médico.",
    searching:"Buscando médicos cercanos…", doc_context:"Según tu evaluación de síntomas, podrías necesitar un {spec}.",
    gp_context:"Mostrando médicos de cabecera (MAP) cerca de ti.",
    doc_disclaimer:"Datos de médicos de OpenStreetMap (datos abiertos). La cobertura puede ser incompleta. Es un directorio, no una garantía de cita.",
    lang_spoken:"Idiomas hablados", premium:"PREMIUM", book:"Reservar", call:"Llamar", website:"Sitio web",
    filter_language:"Idioma preferido", any_language:"Cualquier idioma", langs_not_listed:"Idiomas no indicados",
    select_time:"Selecciona una hora", booking_loading:"Reservando…",
    bk_hours_label:"Horario de atención", bk_avail_note:"Los horarios mostrados siguen el horario de atención del consultorio.",
    bk_no_hours:"Este consultorio no ha publicado disponibilidad en línea. Puedes solicitar una cita por correo electrónico.", bk_email_btn:"Solicitar cita por correo",
    bk_closed_day:"El consultorio está cerrado este día. Elige otra fecha.",
    bk_note:"Lleva tu tarjeta del seguro y un volante (Überweisung) si un especialista lo necesita.",
    bk_disclaimer:"Esta es una reserva de prototipo. Registra tu solicitud en el sistema. La disponibilidad real vendría de una API de agenda médica.",
    reg_create_title:"Crear cuenta", reg_join:"Únete a ClearCare+ hoy",
    reg_first:"Nombre", reg_last:"Apellido", reg_email:"Correo electrónico", reg_password:"Contraseña",
    pw_len:"Al menos 8 caracteres", pw_num:"Contiene al menos 1 número", pw_spec:"Contiene al menos 1 carácter especial",
    reg_select_lang:"Selecciona un idioma", reg_create_btn:"Crear cuenta", reg_have:"¿Ya tienes una cuenta?", reg_signin:"Iniciar sesión",
    profile_desc:"Algunos datos más para conectarte con los médicos adecuados y tu seguro.",
    sel_type:"Selecciona el tipo", opt_public:"Público (GKV)", opt_private:"Privado (PKV)", sel_insurer:"Selecciona tu aseguradora",
    edit_profile:"Editar perfil", save_changes:"Guardar cambios", cancel:"Cancelar", ov_files:"registros",
    appt_title:"Tus citas", appt_sub:"Citas próximas",
    rec_title:"Tus registros", rec_sub:"Evaluaciones de síntomas guardadas",
    reschedule:"Reprogramar", cancel_appt:"Cancelar", reschedule_title:"Reprogramar cita",
    reschedule_btn:"Guardar nueva hora", confirm_cancel:"¿Cancelar esta cita? Esta acción no se puede deshacer.",
    yes_cancel:"Sí, cancelar", keep_appt:"Mantener cita",
    appt_empty:"Aún no tienes citas.", rec_empty:"Aún no tienes registros.",
    loading_generic:"Cargando…", load_failed:"No se pudo cargar. Inténtalo de nuevo.", appt_past:"pasada"
  },
  German: {
    nav_actions:"Was möchten Sie heute tun?", overview:"Übersicht",
    act_symptom_t:"Facharzt finden", act_symptom_s:"Beantworten Sie ein paar Fragen, um den richtigen Facharzt zu finden",
    act_doctor_t:"Arzt finden", act_doctor_s:"Durchsuchen Sie das Arztverzeichnis",
    complete_profile:"Profil vervollständigen", patient_info:"Patienteninformationen",
    sign_out:"Abmelden", save_continue:"Speichern & weiter",
    ins_type:"Versicherungsart", ins_company:"Krankenkasse", postcode:"Postleitzahl", city:"Stadt",
    sym_title:"Symptom-Checker", sym_sub:"Wir weisen Ihnen den richtigen Arzt.",
    sym_check_btn:"Symptome prüfen", find_this_doctor:"Diesen Arzt finden",
    sym_lang_note:"Das Ergebnis wird in Ihrer Profilsprache angezeigt, egal in welcher Sprache Sie schreiben.",
    doc_title:"Arzt finden", doc_sub:"Ärzte in Ihrer Nähe, aus dem offenen Verzeichnis.",
    doc_search_btn:"Ärzte in meiner Nähe finden",
    bk_title:"Termin buchen", bk_sub:"Wählen Sie eine passende Uhrzeit.",
    bk_date:"Datum", bk_time:"Uhrzeit", bk_confirm_btn:"Buchung bestätigen",
    bk_confirmed:"Termin bestätigt!", back_home:"Zurück zur Startseite",
    full_name:"Vollständiger Name", email_label:"E-Mail", dob:"Geburtsdatum", pref_lang:"Bevorzugte Sprache",
    ov_appt:"Termine", ov_appt_s:"Keine anstehenden", ov_presc:"Rezepte", ov_presc_s:"Aktiv: 0",
    ov_records:"Unterlagen", ov_records_s:"0 Dateien", ov_vitals:"Vitalwerte", ov_vitals_s:"Letzte Prüfung: keine",
    sym_intro:"Beschreiben Sie mit eigenen Worten, wie Sie sich fühlen. Das hilft uns, den richtigen Arzttyp vorzuschlagen. Es ist keine Diagnose.",
    sym_input_ph:"z. B. Ich habe seit 3 Tagen Halsschmerzen und leichtes Fieber",
    analyzing:"Symptome werden analysiert…", referral_note:"Möglicherweise ist zuerst eine Überweisung vom Hausarzt nötig.",
    sym_disclaimer:"ClearCare+ hilft Ihnen, den richtigen Arzttyp zu finden. Dies ist eine Orientierung, keine medizinische Diagnose.",
    searching:"Ärzte in der Nähe werden gesucht…", doc_context:"Basierend auf Ihrer Symptomprüfung benötigen Sie möglicherweise einen {spec}.",
    gp_context:"Hausärzte in Ihrer Nähe werden angezeigt.",
    doc_disclaimer:"Arztdaten von OpenStreetMap (offene Daten). Die Abdeckung kann unvollständig sein. Es ist ein Verzeichnis, keine Buchungsgarantie.",
    lang_spoken:"Gesprochene Sprachen", premium:"PREMIUM", book:"Buchen", call:"Anrufen", website:"Webseite",
    filter_language:"Bevorzugte Sprache", any_language:"Beliebige Sprache", langs_not_listed:"Sprachen nicht angegeben",
    select_time:"Uhrzeit wählen", booking_loading:"Wird gebucht…",
    bk_hours_label:"Öffnungszeiten", bk_avail_note:"Die angezeigten Zeiten richten sich nach den Öffnungszeiten der Praxis.",
    bk_no_hours:"Diese Praxis hat keine Online-Verfügbarkeit veröffentlicht. Sie können stattdessen per E-Mail einen Termin anfragen.", bk_email_btn:"Termin per E-Mail anfragen",
    bk_closed_day:"Die Praxis ist an diesem Tag geschlossen. Bitte wählen Sie ein anderes Datum.",
    bk_note:"Bringen Sie Ihre Versichertenkarte und ggf. eine Überweisung mit, falls ein Facharzt sie benötigt.",
    bk_disclaimer:"Dies ist eine Prototyp-Buchung. Sie erfasst Ihre Anfrage im System. Die echte Verfügbarkeit käme aus einer Terminplanungs-API.",
    reg_create_title:"Konto erstellen", reg_join:"Treten Sie ClearCare+ noch heute bei",
    reg_first:"Vorname", reg_last:"Nachname", reg_email:"E-Mail-Adresse", reg_password:"Passwort",
    pw_len:"Mindestens 8 Zeichen", pw_num:"Enthält mindestens 1 Zahl", pw_spec:"Enthält mindestens 1 Sonderzeichen",
    reg_select_lang:"Sprache wählen", reg_create_btn:"Konto erstellen", reg_have:"Haben Sie bereits ein Konto?", reg_signin:"Anmelden",
    profile_desc:"Ein paar weitere Angaben, damit wir Sie den richtigen Ärzten und Ihrer Versicherung zuordnen können.",
    sel_type:"Typ wählen", opt_public:"Gesetzlich (GKV)", opt_private:"Privat (PKV)", sel_insurer:"Versicherung wählen",
    edit_profile:"Profil bearbeiten", save_changes:"Änderungen speichern", cancel:"Abbrechen", ov_files:"Einträge",
    appt_title:"Ihre Termine", appt_sub:"Anstehende Termine",
    rec_title:"Ihre Unterlagen", rec_sub:"Gespeicherte Symptomprüfungen",
    reschedule:"Verschieben", cancel_appt:"Stornieren", reschedule_title:"Termin verschieben",
    reschedule_btn:"Neue Uhrzeit speichern", confirm_cancel:"Diesen Termin stornieren? Dies kann nicht rückgängig gemacht werden.",
    yes_cancel:"Ja, stornieren", keep_appt:"Termin behalten",
    appt_empty:"Noch keine Termine.", rec_empty:"Noch keine Unterlagen.",
    loading_generic:"Wird geladen…", load_failed:"Laden fehlgeschlagen. Bitte versuchen Sie es erneut.", appt_past:"vergangen"
  },
  Turkish: {
    nav_actions:"Bugün ne yapmak istersiniz?", overview:"Genel bakış",
    act_symptom_t:"Uzman Doktor Bul", act_symptom_s:"Doğru uzmanı bulmak için birkaç soruyu yanıtlayın",
    act_doctor_t:"Doktor Bul", act_doctor_s:"Doktor rehberine göz atın",
    complete_profile:"Profilinizi tamamlayın", patient_info:"Hasta Bilgileri",
    sign_out:"Çıkış yap", save_continue:"Kaydet ve devam et",
    ins_type:"Sigorta türü", ins_company:"Sigorta şirketi", postcode:"Posta kodu", city:"Şehir",
    sym_title:"Belirti Denetleyici", sym_sub:"Sizi doğru doktora yönlendireceğiz.",
    sym_check_btn:"Belirtileri kontrol et", find_this_doctor:"Bu doktoru bul",
    sym_lang_note:"Sonuç, hangi dilde yazarsanız yazın, profil dilinizde gösterilir.",
    doc_title:"Doktor Bul", doc_sub:"Açık rehberden, yakınınızdaki doktorlar.",
    doc_search_btn:"Yakınımdaki doktorları bul",
    bk_title:"Randevu Al", bk_sub:"Size uygun bir saat seçin.",
    bk_date:"Tarih", bk_time:"Saat", bk_confirm_btn:"Randevuyu onayla",
    bk_confirmed:"Randevu onaylandı!", back_home:"Ana sayfaya dön",
    full_name:"Ad soyad", email_label:"E-posta", dob:"Doğum tarihi", pref_lang:"Tercih edilen dil",
    ov_appt:"Randevular", ov_appt_s:"Yaklaşan yok", ov_presc:"Reçeteler", ov_presc_s:"Aktif: 0",
    ov_records:"Kayıtlar", ov_records_s:"0 dosya", ov_vitals:"Yaşamsal değerler", ov_vitals_s:"Son kontrol: yok",
    sym_intro:"Kendi kelimelerinizle nasıl hissettiğinizi anlatın. Bu, doğru doktor türünü önermemize yardımcı olur. Bu bir teşhis değildir.",
    sym_input_ph:"ör. 3 gündür boğaz ağrım ve hafif ateşim var",
    analyzing:"Belirtileriniz analiz ediliyor…", referral_note:"Önce aile hekiminden sevk (Überweisung) gerekebilir.",
    sym_disclaimer:"ClearCare+ doğru doktor türünü bulmanıza yardımcı olur. Bu bir yönlendirmedir, tıbbi teşhis değildir.",
    searching:"Yakındaki doktorlar aranıyor…", doc_context:"Belirti kontrolünüze göre bir {spec} gerekebilir.",
    gp_context:"Yakınınızdaki aile hekimleri (pratisyen) gösteriliyor.",
    doc_disclaimer:"Doktor verileri OpenStreetMap'ten (açık veri). Kapsam eksik olabilir. Bu bir rehberdir, randevu garantisi değildir.",
    lang_spoken:"Konuşulan diller", premium:"PREMIUM", book:"Randevu al", call:"Ara", website:"Web sitesi",
    filter_language:"Tercih edilen dil", any_language:"Herhangi bir dil", langs_not_listed:"Diller belirtilmemiş",
    select_time:"Bir saat seçin", booking_loading:"Rezervasyon yapılıyor…",
    bk_hours_label:"Çalışma saatleri", bk_avail_note:"Gösterilen saatler muayenehanenin çalışma saatlerine göredir.",
    bk_no_hours:"Bu muayenehane çevrimiçi uygunluk yayınlamadı. Bunun yerine e-posta ile randevu talep edebilirsiniz.", bk_email_btn:"E-posta ile randevu iste",
    bk_closed_day:"Muayenehane bu gün kapalı. Lütfen başka bir tarih seçin.",
    bk_note:"Sigorta kartınızı ve bir uzman gerekiyorsa sevk belgenizi (Überweisung) getirin.",
    bk_disclaimer:"Bu bir prototip rezervasyondur. Talebinizi sisteme kaydeder. Gerçek uygunluk bir doktor randevu API'sinden gelir.",
    reg_create_title:"Hesap Oluştur", reg_join:"Bugün ClearCare+'a katılın",
    reg_first:"Ad", reg_last:"Soyad", reg_email:"E-posta kimliği", reg_password:"Şifre",
    pw_len:"En az 8 karakter", pw_num:"En az 1 rakam içerir", pw_spec:"En az 1 özel karakter içerir",
    reg_select_lang:"Bir dil seçin", reg_create_btn:"Hesap Oluştur", reg_have:"Zaten bir hesabınız var mı?", reg_signin:"Giriş yap",
    profile_desc:"Sizi doğru doktorlar ve sigortanızla eşleştirmemiz için birkaç ayrıntı daha.",
    sel_type:"Tür seçin", opt_public:"Kamu (GKV)", opt_private:"Özel (PKV)", sel_insurer:"Sigortanızı seçin",
    edit_profile:"Profili düzenle", save_changes:"Değişiklikleri kaydet", cancel:"İptal", ov_files:"kayıt",
    appt_title:"Randevularınız", appt_sub:"Yaklaşan randevular",
    rec_title:"Kayıtlarınız", rec_sub:"Kaydedilen belirti kontrolleri",
    reschedule:"Yeniden planla", cancel_appt:"İptal", reschedule_title:"Randevuyu yeniden planla",
    reschedule_btn:"Yeni saati kaydet", confirm_cancel:"Bu randevu iptal edilsin mi? Bu geri alınamaz.",
    yes_cancel:"Evet, iptal et", keep_appt:"Randevuyu koru",
    appt_empty:"Henüz randevu yok.", rec_empty:"Henüz kayıt yok.",
    loading_generic:"Yükleniyor…", load_failed:"Yüklenemedi. Lütfen tekrar deneyin.", appt_past:"geçmiş"
  },
  Hindi: {
    nav_actions:"आज आप क्या करना चाहेंगे?", overview:"अवलोकन",
    act_symptom_t:"विशेषज्ञ डॉक्टर खोजें", act_symptom_s:"सही विशेषज्ञ खोजने के लिए कुछ सवालों के जवाब दें",
    act_doctor_t:"डॉक्टर खोजें", act_doctor_s:"डॉक्टर निर्देशिका देखें",
    complete_profile:"अपनी प्रोफ़ाइल पूरी करें", patient_info:"रोगी की जानकारी",
    sign_out:"साइन आउट", save_continue:"सहेजें और जारी रखें",
    ins_type:"बीमा प्रकार", ins_company:"बीमा कंपनी", postcode:"पिन कोड", city:"शहर",
    sym_title:"लक्षण जाँचकर्ता", sym_sub:"हम आपको सही डॉक्टर बताएंगे।",
    sym_check_btn:"लक्षण जाँचें", find_this_doctor:"यह डॉक्टर खोजें",
    sym_lang_note:"परिणाम आपकी प्रोफ़ाइल भाषा में दिखाया जाता है, चाहे आप किसी भी भाषा में लिखें।",
    doc_title:"डॉक्टर खोजें", doc_sub:"खुली निर्देशिका से, आपके पास के डॉक्टर।",
    doc_search_btn:"मेरे पास डॉक्टर खोजें",
    bk_title:"अपॉइंटमेंट बुक करें", bk_sub:"अपने अनुसार समय चुनें।",
    bk_date:"तारीख", bk_time:"समय", bk_confirm_btn:"बुकिंग की पुष्टि करें",
    bk_confirmed:"अपॉइंटमेंट की पुष्टि हो गई!", back_home:"होम पर वापस जाएं",
    full_name:"पूरा नाम", email_label:"ईमेल", dob:"जन्म तिथि", pref_lang:"पसंदीदा भाषा",
    ov_appt:"अपॉइंटमेंट", ov_appt_s:"कोई आगामी नहीं", ov_presc:"नुस्खे", ov_presc_s:"सक्रिय: 0",
    ov_records:"रिकॉर्ड", ov_records_s:"0 फ़ाइलें", ov_vitals:"वाइटल्स", ov_vitals_s:"अंतिम जाँच: कोई नहीं",
    sym_intro:"अपने शब्दों में बताएं कि आप कैसा महसूस कर रहे हैं। इससे हमें सही प्रकार का डॉक्टर सुझाने में मदद मिलती है। यह निदान नहीं है।",
    sym_input_ph:"उदा. मुझे 3 दिनों से गले में खराश और हल्का बुखार है",
    analyzing:"आपके लक्षणों का विश्लेषण किया जा रहा है…", referral_note:"पहले हाउसआर्ट्स से रेफरल (Überweisung) की आवश्यकता हो सकती है।",
    sym_disclaimer:"ClearCare+ आपको सही प्रकार का डॉक्टर खोजने में मदद करता है। यह मार्गदर्शन है, चिकित्सा निदान नहीं।",
    searching:"आस-पास के डॉक्टर खोजे जा रहे हैं…", doc_context:"आपकी लक्षण जाँच के आधार पर, आपको {spec} की आवश्यकता हो सकती है।",
    gp_context:"आपके पास के सामान्य चिकित्सक (GP) दिखाए जा रहे हैं।",
    doc_disclaimer:"डॉक्टर डेटा OpenStreetMap (खुला डेटा) से। कवरेज अधूरा हो सकता है। यह एक निर्देशिका है, बुकिंग की गारंटी नहीं।",
    lang_spoken:"बोली जाने वाली भाषाएँ", premium:"प्रीमियम", book:"बुक करें", call:"कॉल करें", website:"वेबसाइट",
    filter_language:"पसंदीदा भाषा", any_language:"कोई भी भाषा", langs_not_listed:"भाषाएँ सूचीबद्ध नहीं",
    select_time:"समय चुनें", booking_loading:"बुकिंग हो रही है…",
    bk_hours_label:"खुलने का समय", bk_avail_note:"दिखाए गए समय क्लिनिक के खुलने के समय के अनुसार हैं।",
    bk_no_hours:"इस क्लिनिक ने ऑनलाइन उपलब्धता प्रकाशित नहीं की है। आप इसके बजाय ईमेल से अपॉइंटमेंट का अनुरोध कर सकते हैं।", bk_email_btn:"ईमेल से अपॉइंटमेंट का अनुरोध करें",
    bk_closed_day:"इस दिन क्लिनिक बंद है। कृपया कोई और तारीख चुनें।",
    bk_note:"अपना बीमा कार्ड और रेफरल (Überweisung) लाएं यदि विशेषज्ञ को इसकी आवश्यकता हो।",
    bk_disclaimer:"यह एक प्रोटोटाइप बुकिंग है। यह सिस्टम में आपका अनुरोध दर्ज करती है। वास्तविक उपलब्धता डॉक्टर शेड्यूलिंग API से आएगी।",
    reg_create_title:"खाता बनाएं", reg_join:"आज ही ClearCare+ से जुड़ें",
    reg_first:"पहला नाम", reg_last:"उपनाम", reg_email:"ईमेल आईडी", reg_password:"पासवर्ड",
    pw_len:"कम से कम 8 अक्षर", pw_num:"कम से कम 1 संख्या शामिल हो", pw_spec:"कम से कम 1 विशेष अक्षर शामिल हो",
    reg_select_lang:"भाषा चुनें", reg_create_btn:"खाता बनाएं", reg_have:"पहले से खाता है?", reg_signin:"साइन इन करें",
    profile_desc:"सही डॉक्टरों और आपके बीमा से मिलान के लिए कुछ और विवरण।",
    sel_type:"प्रकार चुनें", opt_public:"सार्वजनिक (GKV)", opt_private:"निजी (PKV)", sel_insurer:"अपनी बीमा कंपनी चुनें",
    edit_profile:"प्रोफ़ाइल संपादित करें", save_changes:"परिवर्तन सहेजें", cancel:"रद्द करें", ov_files:"रिकॉर्ड",
    appt_title:"आपके अपॉइंटमेंट", appt_sub:"आगामी अपॉइंटमेंट",
    rec_title:"आपके रिकॉर्ड", rec_sub:"सहेजी गई लक्षण जाँच",
    reschedule:"पुनर्निर्धारित करें", cancel_appt:"रद्द करें", reschedule_title:"अपॉइंटमेंट पुनर्निर्धारित करें",
    reschedule_btn:"नया समय सहेजें", confirm_cancel:"इस अपॉइंटमेंट को रद्द करें? इसे पूर्ववत नहीं किया जा सकता।",
    yes_cancel:"हाँ, रद्द करें", keep_appt:"अपॉइंटमेंट रखें",
    appt_empty:"अभी कोई अपॉइंटमेंट नहीं।", rec_empty:"अभी कोई रिकॉर्ड नहीं।",
    loading_generic:"लोड हो रहा है…", load_failed:"लोड नहीं हो सका। कृपया पुनः प्रयास करें।", appt_past:"बीता हुआ"
  },
  Arabic: {
    nav_actions:"ماذا تريد أن تفعل اليوم؟", overview:"نظرة عامة",
    act_symptom_t:"ابحث عن طبيب متخصص", act_symptom_s:"أجب عن بعض الأسئلة للعثور على الطبيب المتخصص المناسب",
    act_doctor_t:"ابحث عن طبيب", act_doctor_s:"تصفح دليل الأطباء",
    complete_profile:"أكمل ملفك الشخصي", patient_info:"معلومات المريض",
    sign_out:"تسجيل الخروج", save_continue:"حفظ ومتابعة",
    ins_type:"نوع التأمين", ins_company:"شركة التأمين", postcode:"الرمز البريدي", city:"المدينة",
    sym_title:"فاحص الأعراض", sym_sub:"سنوجهك إلى الطبيب المناسب.",
    sym_check_btn:"فحص الأعراض", find_this_doctor:"ابحث عن هذا الطبيب",
    sym_lang_note:"تظهر النتيجة بلغة ملفك الشخصي بغض النظر عن اللغة التي تكتب بها.",
    doc_title:"ابحث عن طبيب", doc_sub:"أطباء بالقرب منك، من الدليل المفتوح.",
    doc_search_btn:"ابحث عن أطباء بالقرب مني",
    bk_title:"حجز موعد", bk_sub:"اختر وقتًا يناسبك.",
    bk_date:"التاريخ", bk_time:"الوقت", bk_confirm_btn:"تأكيد الحجز",
    bk_confirmed:"تم تأكيد الموعد!", back_home:"العودة إلى الصفحة الرئيسية",
    full_name:"الاسم الكامل", email_label:"البريد الإلكتروني", dob:"تاريخ الميلاد", pref_lang:"اللغة المفضلة",
    ov_appt:"المواعيد", ov_appt_s:"لا مواعيد قادمة", ov_presc:"الوصفات", ov_presc_s:"نشطة: 0",
    ov_records:"السجلات", ov_records_s:"0 ملفات", ov_vitals:"المؤشرات الحيوية", ov_vitals_s:"آخر فحص: لا يوجد",
    sym_intro:"أخبرنا كيف تشعر بكلماتك الخاصة. هذا يساعدنا على اقتراح نوع الطبيب المناسب. إنه ليس تشخيصًا.",
    sym_input_ph:"مثال: أعاني من التهاب الحلق وحمى خفيفة منذ 3 أيام",
    analyzing:"يتم تحليل أعراضك…", referral_note:"قد تحتاج أولاً إلى إحالة (Überweisung) من طبيب الأسرة.",
    sym_disclaimer:"يساعدك ClearCare+ في العثور على نوع الطبيب المناسب. هذا توجيه وليس تشخيصًا طبيًا.",
    searching:"جاري البحث عن أطباء قريبين…", doc_context:"بناءً على فحص أعراضك، قد تحتاج إلى {spec}.",
    gp_context:"عرض أطباء العائلة بالقرب منك.",
    doc_disclaimer:"بيانات الأطباء من OpenStreetMap (بيانات مفتوحة). قد تكون التغطية غير كاملة. إنه دليل وليس ضمان حجز.",
    lang_spoken:"اللغات المنطوقة", premium:"بريميوم", book:"احجز", call:"اتصل", website:"الموقع",
    filter_language:"اللغة المفضلة", any_language:"أي لغة", langs_not_listed:"اللغات غير مدرجة",
    select_time:"اختر وقتًا", booking_loading:"جاري الحجز…",
    bk_hours_label:"ساعات العمل", bk_avail_note:"الأوقات المعروضة تتبع ساعات عمل العيادة.",
    bk_no_hours:"لم تنشر هذه العيادة توفرًا عبر الإنترنت. يمكنك طلب موعد عبر البريد الإلكتروني بدلاً من ذلك.", bk_email_btn:"طلب موعد عبر البريد الإلكتروني",
    bk_closed_day:"العيادة مغلقة في هذا اليوم. يرجى اختيار تاريخ آخر.",
    bk_note:"أحضر بطاقة التأمين وإحالة (Überweisung) إذا احتاجها أخصائي.",
    bk_disclaimer:"هذا حجز نموذجي. يسجل طلبك في النظام. التوفر الفعلي سيأتي من واجهة جدولة المواعيد.",
    reg_create_title:"إنشاء حساب", reg_join:"انضم إلى ClearCare+ اليوم",
    reg_first:"الاسم الأول", reg_last:"اسم العائلة", reg_email:"البريد الإلكتروني", reg_password:"كلمة المرور",
    pw_len:"8 أحرف على الأقل", pw_num:"يحتوي على رقم واحد على الأقل", pw_spec:"يحتوي على رمز خاص واحد على الأقل",
    reg_select_lang:"اختر لغة", reg_create_btn:"إنشاء حساب", reg_have:"هل لديك حساب بالفعل؟", reg_signin:"تسجيل الدخول",
    profile_desc:"بعض التفاصيل الإضافية لنطابقك مع الأطباء المناسبين وتأمينك.",
    sel_type:"اختر النوع", opt_public:"عام (GKV)", opt_private:"خاص (PKV)", sel_insurer:"اختر شركة التأمين",
    edit_profile:"تعديل الملف الشخصي", save_changes:"حفظ التغييرات", cancel:"إلغاء", ov_files:"سجلات",
    appt_title:"مواعيدك", appt_sub:"المواعيد القادمة",
    rec_title:"سجلاتك", rec_sub:"فحوصات الأعراض المحفوظة",
    reschedule:"إعادة جدولة", cancel_appt:"إلغاء", reschedule_title:"إعادة جدولة الموعد",
    reschedule_btn:"حفظ الوقت الجديد", confirm_cancel:"إلغاء هذا الموعد؟ لا يمكن التراجع عن ذلك.",
    yes_cancel:"نعم، إلغاء", keep_appt:"الإبقاء على الموعد",
    appt_empty:"لا مواعيد بعد.", rec_empty:"لا سجلات بعد.",
    loading_generic:"جاري التحميل…", load_failed:"تعذر التحميل. يرجى المحاولة مرة أخرى.", appt_past:"سابق"
  }
};

/* Urgency badge labels (set in JS) */
const URG_T = {
  English:{ soon:"See a doctor soon", routine:"Routine" },
  Spanish:{ soon:"Consulta pronto", routine:"Rutina" },
  German:{ soon:"Bald zum Arzt", routine:"Routine" },
  Turkish:{ soon:"Yakında doktora görünün", routine:"Rutin" },
  Hindi:{ soon:"जल्द डॉक्टर से मिलें", routine:"सामान्य" },
  Arabic:{ soon:"راجع طبيبًا قريبًا", routine:"روتيني" }
};

let currentLang = "English";

/* Translate a single key for JS-generated strings (doctor cards, loading, etc.) */
function t(key){
  return (UI_T[currentLang] || UI_T.English)[key] || UI_T.English[key] || key;
}

/* Apply translations to every [data-i18n] / [data-i18n-placeholder] element */
function applyI18n(langName){
  currentLang = UI_T[langName] ? langName : "English";
  const dict = UI_T[currentLang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = dict[el.getAttribute("data-i18n")] || UI_T.English[el.getAttribute("data-i18n")];
    if (val) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const val = dict[el.getAttribute("data-i18n-placeholder")] || UI_T.English[el.getAttribute("data-i18n-placeholder")];
    if (val) el.placeholder = val;
  });
  const phone = document.getElementById("phone");
  if (phone) phone.setAttribute("dir", currentLang === "Arabic" ? "rtl" : "ltr");
}

/* ===================== Shared UI helpers (global for inline onclick) ===================== */
function togglePw(id, btn){
  const el = document.getElementById(id);
  el.type = el.type === "password" ? "text" : "password";
  btn.innerHTML = el.type === "password"
    ? '<i class="fa-solid fa-eye"></i>'
    : '<i class="fa-solid fa-eye-slash"></i>';
}
function fieldErr(id, msg){
  document.getElementById(id).classList.toggle("bad", !!msg);
  document.getElementById("err-" + id).textContent = msg || "";
  return !msg;
}
function isEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function banner(id, msg){
  const el = document.getElementById(id);
  if (msg){ el.textContent = msg; el.classList.remove("hidden"); }
  else { el.classList.add("hidden"); }
}
function clearLoginMsg(){ document.getElementById("login-msg").classList.add("hidden"); }
function pwRules(pw){ return { len: pw.length >= 8, num: /[0-9]/.test(pw), spec: /[^A-Za-z0-9]/.test(pw) }; }
function renderRules(){
  const pw = document.getElementById("r-password").value;
  document.getElementById("rules").classList.toggle("hidden", pw.length === 0);
  const r = pwRules(pw);
  document.getElementById("rule-len").classList.toggle("ok", r.len);
  document.getElementById("rule-num").classList.toggle("ok", r.num);
  document.getElementById("rule-spec").classList.toggle("ok", r.spec);
}
function formatBirth(el){
  let d = el.value.replace(/\D/g, "").slice(0, 8);
  let out = d;
  if (d.length > 2) out = d.slice(0,2) + "/" + d.slice(2);
  if (d.length > 4) out = d.slice(0,2) + "/" + d.slice(2,4) + "/" + d.slice(4);
  el.value = out;
}
/* Switch login <-> register on index.html */
function showView(name){
  ["login","register"].forEach(v => {
    const el = document.getElementById("view-" + v);
    if (el) el.classList.add("hidden");
  });
  const target = document.getElementById("view-" + name);
  if (target) target.classList.remove("hidden");
}
/* Placeholder for future features hooked from the homepage */
function comingSoon(name){
  alert(name + " coming in the next sprint!");
}

/* The scrolling element is the .screen inside the .phone bezel. */
function phoneScreen(){ return document.querySelector("#phone .screen"); }

/* Back-to-top button (added to every page automatically). It lives in the
   screen and drives the screen's scroll not the window. */
function setupBackToTop(){
  const scroller = phoneScreen();
  if (!scroller) return;
  const btn = document.createElement("button");
  btn.className = "to-top";
  btn.setAttribute("aria-label", "Back to top");
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  btn.onclick = () => scroller.scrollTo({ top: 0, behavior: "smooth" });
  scroller.appendChild(btn);
  scroller.addEventListener("scroll", () => {
    btn.classList.toggle("show", scroller.scrollTop > 300);
  });
}

/* In-app confirm modal that matches the app design (replaces window.confirm).
   Returns a Promise<boolean>. */
function uiConfirm(message, opts){
  opts = opts || {};
  return new Promise(resolve => {
    const back = document.createElement("div");
    back.className = "modal-backdrop";
    back.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<div class="m-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>' +
        '<p class="m-msg"></p>' +
        '<div class="m-actions">' +
          '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" data-ok></button>' +
          '<button class="btn btn-outline" data-cancel></button>' +
        '</div>' +
      '</div>';
    back.querySelector(".m-msg").textContent = message;
    back.querySelector("[data-ok]").textContent = opts.okText || "OK";
    back.querySelector("[data-cancel]").textContent = opts.cancelText || t("cancel");
    function close(val){ back.remove(); document.removeEventListener("keydown", onKey); resolve(val); }
    function onKey(e){ if (e.key === "Escape") close(false); }
    back.querySelector("[data-ok]").onclick = () => close(true);
    back.querySelector("[data-cancel]").onclick = () => close(false);
    back.addEventListener("click", e => { if (e.target === back) close(false); });
    document.addEventListener("keydown", onKey);
    (document.getElementById("phone") || document.body).appendChild(back);   // inside the device frame
  });
}

/* ===================== Page router ===================== */
document.addEventListener("DOMContentLoaded", () => {
  setupBackToTop();
  if (document.getElementById("login-form")) initAuthPage();
  if (document.getElementById("homepage")) initHomepage();
  if (document.getElementById("symptom-page")) initSymptom();
  if (document.getElementById("doctors-page")) initDoctors();
  if (document.getElementById("booking-page")) initBooking();
});

/* ===================== INDEX PAGE (login + register) ===================== */
function initAuthPage(){
  if (SUPABASE_URL.includes("YOUR-PROJECT")) {
    const c = document.getElementById("config");
    if (c) c.classList.remove("hidden");
  }
  document.getElementById("register-form").addEventListener("submit", handleRegister);
  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

async function handleRegister(e){
  e.preventDefault();
  const first = document.getElementById("r-first").value.trim();
  const last  = document.getElementById("r-last").value.trim();
  const email = document.getElementById("r-email").value.trim();
  const pw    = document.getElementById("r-password").value;
  const birth = document.getElementById("r-birth").value;
  const lang  = document.getElementById("r-language").value;

  let ok = true;
  ok = fieldErr("r-first", first ? "" : "Required") && ok;
  ok = fieldErr("r-last",  last  ? "" : "Required") && ok;
  ok = fieldErr("r-email", isEmail(email) ? "" : "Enter a valid email.") && ok;
  const r = pwRules(pw);
  ok = fieldErr("r-password", (r.len && r.num && r.spec) ? "" : "Password does not meet requirements.") && ok;
  let be = "";
  if (!birth) { be = "Required"; }
  else { const [dd,mm,yy] = birth.split("/"); const dt = new Date(`${yy}-${mm}-${dd}`); if (isNaN(dt.getTime()) || dt > new Date()) be = "Enter a valid date."; }
  ok = fieldErr("r-birth", be) && ok;
  ok = fieldErr("r-language", lang ? "" : "Please select a language.") && ok;
  if (!ok) return;

  const btn = document.getElementById("register-btn");
  btn.disabled = true; btn.textContent = "Creating account…"; banner("register-err", "");

  const { error } = await sb.auth.signUp({
    email, password: pw,
    options: { data: { first_name: first, last_name: last, birthdate: birth, language: lang } }
  });

  btn.disabled = false; btn.textContent = "Create Account";
  if (error){ banner("register-err", error.message); console.error(error); return; }

  // Email confirmation is OFF, so signUp auto-creates a session. Sign out so the
  // user must explicitly log in (matches the Figma "Registration Completed -> login" flow).
  await sb.auth.signOut();
  console.log("✅ [Supabase] User created");

  document.getElementById("register-form").reset();
  document.getElementById("rules").classList.add("hidden");
  document.getElementById("login-msg-text").textContent = "Registration Completed";
  document.getElementById("login-msg").classList.remove("hidden");
  showView("login");
}

async function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById("l-email").value.trim();
  const pw    = document.getElementById("l-password").value;
  banner("login-err", "");
  if (!email || !pw){ banner("login-err", "Please fill in all fields."); return; }

  const btn = document.getElementById("login-btn");
  btn.disabled = true; btn.textContent = "Signing in…";
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
  btn.disabled = false; btn.textContent = "Sign In";

  if (error || !data.user){ banner("login-err", "Invalid email or password. Please try again."); return; }
  console.log("✅ [Supabase] Logged in -> homepage");
  window.location.href = "homepage.html";   // navigate to the homepage
}

/* ===================== HOMEPAGE (guarded) ===================== */
async function initHomepage(){
  const { data: { session } } = await sb.auth.getSession();
  if (!session){ window.location.href = "index.html"; return; }  // not logged in -> bounce
  currentUserId = session.user.id;
  currentEmail = session.user.email || "";
  const profile = await loadProfile(session.user.user_metadata || {});
  applyI18n(profile.language || "English");
  renderDashboard(profile);
}

/* ===================== Appointments (bottom sheet) ===================== */
let _apptCache = [];   // rows currently shown in the appointments list (for reschedule lookup)

function openAppointments(){
  document.getElementById("appt-sheet").classList.remove("hidden");
  loadAppointments();
}
function closeAppointments(){ document.getElementById("appt-sheet").classList.add("hidden"); }

function escapeHtml(s){
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

/* Read the wall-clock parts of a stored appointment datetime WITHOUT timezone conversion.
   The column is timestamptz, so Supabase returns e.g. "2026-06-20T09:00:00+00:00".
   `new Date()` would shift that into the browser's local zone (wrong for a fixed appointment
   slot). We want the exact date/time the user picked, so we read the literal digits. */
function apptParts(s){
  const m = String(s == null ? "" : s).match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!m) return null;
  return {
    dateStr: `${m[1]}-${m[2]}-${m[3]}`,        // YYYY-MM-DD (for <input type=date>)
    timeStr: `${m[4]}:${m[5]}`,                // HH:MM (for the time <select>)
    // a Date built in LOCAL time from the literal parts for weekday/month labels & comparisons,
    // never re-converted, so the hour shown always equals the booked hour
    local: new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  };
}

async function loadAppointments(){
  const list = document.getElementById("appt-list");
  if (!list) return;
  list.innerHTML = '<p class="empty-note">' + t("loading_generic") + '</p>';
  const { data, error } = await sb.from("appointments")
    .select("*").eq("user_id", currentUserId).order("datetime", { ascending: true });
  if (error){ console.error("[appointments] load error", error); list.innerHTML = '<p class="empty-note">' + t("load_failed") + '</p>'; return; }
  _apptCache = data || [];
  if (!_apptCache.length){ list.innerHTML = '<p class="empty-note">' + t("appt_empty") + '</p>'; return; }

  const now = new Date();
  list.innerHTML = _apptCache.map(a => {
    const p = apptParts(a.datetime);
    const when = p
      ? p.local.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) + " · " + p.timeStr
      : "-";
    const past = p && p.local < now;
    return `
      <div class="list-item${past ? " past" : ""}">
        <div class="li-title"><i class="fa-solid fa-user-doctor"></i> ${escapeHtml(a.doctor_name || "Doctor")}</div>
        ${a.doctor_specialty ? `<div class="li-sub">${escapeHtml(a.doctor_specialty)}</div>` : ""}
        <div class="li-when">${when}${past ? " · " + t("appt_past") : ""}</div>
        ${a.doctor_address ? `<div class="li-addr">${escapeHtml(a.doctor_address)}</div>` : ""}
        <div class="li-actions">
          <button class="dbtn" onclick="startReschedule('${a.id}')"><i class="fa-solid fa-pen"></i> ${t("reschedule")}</button>
          <button class="dbtn danger" onclick="cancelAppointment('${a.id}')"><i class="fa-solid fa-xmark"></i> ${t("cancel_appt")}</button>
        </div>
      </div>`;
  }).join("");
}

/* Carry the chosen appointment (incl. its id) into the booking screen for rescheduling.
   booking.html reads mc_reschedule and UPDATEs that row instead of inserting a new one.
   We also re-fetch the full doctor row from the `doctors` table (by name) so the
   reschedule screen can show the opening hours and keep the day/time restrictions. */
async function startReschedule(id){
  const a = _apptCache.find(x => String(x.id) === String(id));
  if (!a) return;
  let doctor = { name: a.doctor_name, specialty: a.doctor_specialty, street: a.doctor_address };
  try {
    const { data } = await sb.from("doctors").select("*").eq("name", a.doctor_name).limit(1);
    if (data && data.length) doctor = data[0];   // full row incl. opening hours / email / phone
  } catch (e){ console.warn("[reschedule] doctor lookup failed (continuing without hours):", e); }
  sessionStorage.setItem("mc_doctor", JSON.stringify(doctor));
  sessionStorage.setItem("mc_reschedule", JSON.stringify({ id: a.id, datetime: a.datetime, created_at: a.created_at }));
  window.location.href = "booking.html";
}

async function cancelAppointment(id){
  const ok = await uiConfirm(t("confirm_cancel"), { danger:true, okText:t("yes_cancel"), cancelText:t("keep_appt") });
  if (!ok) return;

  /* Archive-before-delete: copy the row into `appointments_cancel` first, so the
     cancellation is tracked in Supabase for metrics (cancel/reschedule frequency,
     booking-to-cancel lead time, malicious-booking safeguards). This table is NOT
     shown in the UI or user account — users have no SELECT policy on it. The full
     row is already in _apptCache from loadAppointments(). Best-effort: if the
     archive fails we log it but still let the user cancel, so the UI never gets stuck. */
  const appt = _apptCache.find(x => String(x.id) === String(id));
  if (appt){
    const { error: archiveErr } = await sb.from("appointments_cancel").insert({
      original_appointment_id: appt.id,
      user_id: currentUserId,
      doctor_name: appt.doctor_name || null,
      doctor_specialty: appt.doctor_specialty || null,
      doctor_address: appt.doctor_address || null,
      datetime: appt.datetime || null,        // the slot that was cancelled
      status: appt.status || null,
      booked_at: appt.created_at || null,      // original booking time, for lead-time metrics
      source: "user_cancel"
    });
    if (archiveErr) console.error("[appointments_cancel] archive error (cancel still proceeds)", archiveErr);
    else console.log("🗂️ [Supabase] Cancellation archived to appointments_cancel");
  } else {
    console.warn("[appointments_cancel] row not found in cache; cancelling without archiving");
  }

  const { data: removed, error } = await sb.from("appointments")
    .delete().eq("id", id).eq("user_id", currentUserId).select();
  if (error){ console.error("[appointments] cancel error", error); alert(t("load_failed")); return; }
  if (!removed || !removed.length){
    console.error("[appointments] cancel changed 0 rows. Likely missing RLS DELETE policy or user_id mismatch");
    alert(t("load_failed"));
    return;
  }
  loadAppointments();   // refresh the inline list
}

/* Fetch this user's row from the profiles table; create it on the first visit
   (seeded from the Auth sign-up metadata: name, birthday, language). */
async function loadProfile(authMeta){
  let { data: row, error } = await sb.from("profiles").select("*").eq("id", currentUserId).maybeSingle();
  if (error) console.error("[profiles] load error", error);

  if (!row){
    const seed = {
      id: currentUserId,
      first_name: authMeta.first_name || "",
      last_name:  authMeta.last_name  || "",
      birthdate:  authMeta.birthdate  || "",
      language:   authMeta.language   || "English"
    };
    const { data: inserted, error: insErr } = await sb.from("profiles").insert(seed).select().single();
    if (insErr){ console.error("[profiles] insert error", insErr); return seed; }
    row = inserted;
  }
  return row;
}

function renderDashboard(p){
  currentProfile = p || {};
  const lang = p.language || "English";
  const c = CONTENT[lang] || CONTENT.English;
  const first = p.first_name || "there";
  const last  = p.last_name  || "";
  const initials = ((first[0]||"") + (last[0]||"")).toUpperCase();

  // Hero
  document.getElementById("d-initials").textContent = initials;
  document.getElementById("d-date").textContent = new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
  document.getElementById("d-greeting").innerHTML = c.greeting + ",<br>" + first + "!";
  document.getElementById("d-sub").textContent = c.subtitle;
  document.getElementById("d-quote").textContent = '"' + c.quote + '"';
  document.getElementById("phone").setAttribute("dir", c.dir);  // RTL for Arabic

  // Is the patient profile complete? (insurance + postcode + city collected)
  const complete = p.insurance_type && p.insurance_company && p.postcode && p.city;
  document.getElementById("profile-setup").classList.toggle("hidden", !!complete);
  document.getElementById("returning").classList.toggle("hidden", !complete);

  // Fill the Patient Information sheet
  document.getElementById("sheet-initials").textContent = initials;
  document.getElementById("sheet-name").textContent = (first + " " + last).trim();
  document.getElementById("sheet-email").textContent = currentEmail;
  document.getElementById("info-name").textContent = (first + " " + last).trim() || "-";
  document.getElementById("info-email").textContent = currentEmail || "-";
  document.getElementById("info-dob").textContent = p.birthdate || "-";
  document.getElementById("info-lang").textContent = p.language || "-";
  document.getElementById("info-instype").textContent = p.insurance_type || "Not set";
  document.getElementById("info-inscompany").textContent = p.insurance_company || "Not set";
  document.getElementById("info-postcode").textContent = p.postcode || "Not set";
  document.getElementById("info-city").textContent = p.city || "Not set";
}

/* When the user picks an insurance type, fill the company dropdown */
function onInsTypeChange(){
  const type = document.getElementById("p-instype").value;
  const sel = document.getElementById("p-inscompany");
  sel.innerHTML = '<option value="">' + t("sel_insurer") + '</option>';
  if (type && INSURERS[type]){
    INSURERS[type].forEach(name => {
      const o = document.createElement("option");
      o.value = name; o.textContent = name;
      sel.appendChild(o);
    });
    sel.disabled = false;
  } else {
    sel.disabled = true;
  }
}

/* Save the extra profile fields to the profiles TABLE */
async function saveProfile(){
  const type = document.getElementById("p-instype").value;
  const company = document.getElementById("p-inscompany").value;
  const postcode = document.getElementById("p-postcode").value.trim();
  const city = document.getElementById("p-city").value.trim();

  let ok = true;
  ok = fieldErr("p-instype", type ? "" : "Please choose a type.") && ok;
  ok = fieldErr("p-inscompany", company ? "" : "Please choose your insurer.") && ok;
  ok = fieldErr("p-postcode", postcode ? "" : "Enter your postcode.") && ok;
  ok = fieldErr("p-city", city ? "" : "Enter your city.") && ok;
  if (!ok) return;

  const btn = document.getElementById("profile-save-btn");
  btn.disabled = true; btn.textContent = "Saving…"; banner("profile-err", "");

  const { data, error } = await sb.from("profiles")
    .update({ insurance_type: type, insurance_company: company, postcode, city, updated_at: new Date().toISOString() })
    .eq("id", currentUserId).select().single();

  btn.disabled = false; btn.textContent = "Save & continue";
  if (error){ banner("profile-err", error.message); console.error(error); return; }

  console.log("✅ [Supabase] Profile saved to table");
  renderDashboard(data);   // re-render: form hides, overview shows
}

/* ===================== Profile bottom sheet ===================== */
function openProfile(){ document.getElementById("profile-sheet").classList.remove("hidden"); }
function closeProfile(){
  document.getElementById("profile-sheet").classList.add("hidden");
  closeEditProfile();
}

/* ----- Edit profile (insurance, postcode/city, preferred language) ----- */
function openEditProfile(){
  document.getElementById("e-instype").value = currentProfile.insurance_type || "";
  onEditInsTypeChange();
  document.getElementById("e-inscompany").value = currentProfile.insurance_company || "";
  document.getElementById("e-postcode").value = currentProfile.postcode || "";
  document.getElementById("e-city").value = currentProfile.city || "";
  document.getElementById("e-language").value = currentProfile.language || "English";
  banner("edit-err", "");
  document.getElementById("edit-profile").classList.remove("hidden");
}
function closeEditProfile(){
  const el = document.getElementById("edit-profile");
  if (el) el.classList.add("hidden");
}
function onEditInsTypeChange(){
  const type = document.getElementById("e-instype").value;
  const sel = document.getElementById("e-inscompany");
  sel.innerHTML = '<option value="">' + t("sel_insurer") + '</option>';
  if (type && INSURERS[type]){
    INSURERS[type].forEach(n => { const o = document.createElement("option"); o.value = n; o.textContent = n; sel.appendChild(o); });
    sel.disabled = false;
  } else { sel.disabled = true; }
}
async function saveProfileEdit(){
  const type = document.getElementById("e-instype").value;
  const company = document.getElementById("e-inscompany").value;
  const postcode = document.getElementById("e-postcode").value.trim();
  const city = document.getElementById("e-city").value.trim();
  const lang = document.getElementById("e-language").value;
  banner("edit-err", "");
  if (!type || !company || !postcode || !city || !lang){
    banner("edit-err", "Please fill in all fields.");
    return;
  }

  const { data, error } = await sb.from("profiles")
    .update({ insurance_type: type, insurance_company: company, postcode, city, language: lang, updated_at: new Date().toISOString() })
    .eq("id", currentUserId).select().single();
  if (error){ banner("edit-err", error.message); console.error(error); return; }

  currentProfile = data;
  applyI18n(currentProfile.language || "English");   // language may have changed -> retranslate UI
  renderDashboard(currentProfile);                    // refresh hero + sheet info
  closeEditProfile();
  closeProfile();
}

async function doLogout(){
  await sb.auth.signOut();
  window.location.href = "index.html";
}

/* ===================== SYMPTOM CHECKER (guarded) ===================== */
async function initSymptom(){
  const { data: { session } } = await sb.auth.getSession();
  if (!session){ window.location.href = "index.html"; return; }  // not logged in -> bounce
  currentUserId = session.user.id;
  currentEmail = session.user.email || "";
  currentProfile = await loadProfile(session.user.user_metadata || {});
  applyI18n(currentProfile.language || "English");
}

async function handleSymptom(){
  const text = document.getElementById("s-input").value.trim();
  banner("s-error", "");
  document.getElementById("s-result").classList.add("hidden");
  document.getElementById("s-emergency").classList.add("hidden");
  if (!text){ banner("s-error", "Please describe how you're feeling."); return; }

  const btn = document.getElementById("s-send");
  btn.disabled = true;
  document.getElementById("s-loading").classList.remove("hidden");

  try {
    const payload = {
      user_id: currentUserId,
      symptoms: text,
      language: (currentProfile && currentProfile.language) || "English"
    };
    // USE_N8N=true -> n8n webhook (live demo). false -> Supabase Edge Function (standalone).
    const res = USE_N8N
      ? await fetch(N8N_SYMPTOM_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch(SYMPTOM_FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
          body: JSON.stringify(payload)
        });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    console.log("[symptom] raw response:", data);   // inspect the shape if anything looks off

    // Be tolerant of how n8n returns the result:
    let r = Array.isArray(data) ? data[0] : data;   // array -> first item
    if (r && r.json !== undefined) r = r.json;       // {json:...} wrapper
    if (r && r.output !== undefined) r = r.output;   // AI Agent {output:...}
    if (typeof r === "string") {                      // raw JSON string (strip ```json fences)
      r = JSON.parse(r.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim());
    }
    renderSymptomResult(r);

    /* Save the full consultation to Supabase (standalone mode). In n8n mode the
       n8n workflow owns this insert, so we skip it here to avoid duplicate rows.
       Best-effort: a failed save is logged but doesn't block the result. */
    if (!USE_N8N && r && typeof r === "object"){
      const { error: cErr } = await sb.from("consultations").insert({
        user_id: currentUserId,
        symptoms: text,
        language: payload.language,
        recommended_doctor_type: r.recommended_doctor_type || null,
        urgency: r.urgency || null,
        referral_required: (typeof r.referral_required === "boolean") ? r.referral_required : null,
        needs_human_review: (typeof r.needs_human_review === "boolean") ? r.needs_human_review : null
      });
      if (cErr) console.error("[consultations] save failed:", cErr.message);
      else console.log("✅ [Supabase] Consultation saved");
    }
  } catch (e) {
    console.error("[symptom] error:", e);
    banner("s-error", "Couldn't read the response. Open the console (F12) to see the raw reply, then we can adjust.");
  } finally {
    btn.disabled = false;
    document.getElementById("s-loading").classList.add("hidden");
  }
}

/* Homepage "Find a Doctor": GP mode. List general practitioners only. */
function goFindGeneral(){
  sessionStorage.setItem("mc_docmode", "gp");
  sessionStorage.removeItem("mc_specialty");   // GP mode ignores any prior AI recommendation
  window.location.href = "doctors.html";
}

/* Symptom Checker "Find this doctor": specialist mode. Follow the AI recommendation only. */
function goToDoctors(){
  sessionStorage.setItem("mc_docmode", "specialist");
  if (lastDoctorType) sessionStorage.setItem("mc_specialty", lastDoctorType);
  window.location.href = "doctors.html";
}

function renderSymptomResult(r){
  if (!r || !r.urgency){ banner("s-error", "Unexpected response from the service."); return; }

  if (r.urgency === "emergency"){
    document.getElementById("s-emerg-expl").textContent =
      r.explanation_for_user || "Please seek emergency help immediately.";
    document.getElementById("s-emergency").classList.remove("hidden");
    return;
  }

  lastDoctorType = r.recommended_doctor_type || "";   // remember for "Find this doctor"
  document.getElementById("s-doctor").textContent = r.recommended_doctor_type || "General Practitioner";
  const badge = document.getElementById("s-badge");
  badge.className = "badge-urg " + r.urgency;
  const ut = URG_T[currentLang] || URG_T.English;
  badge.textContent = r.urgency === "soon" ? ut.soon : ut.routine;
  document.getElementById("s-expl").textContent = r.explanation_for_user || "";
  document.getElementById("s-refer").classList.toggle("hidden", !r.referral_required);

  document.getElementById("s-result").classList.remove("hidden");
}

/* ===================== FIND A DOCTOR (guarded) ===================== */
async function initDoctors(){
  const { data: { session } } = await sb.auth.getSession();
  if (!session){ window.location.href = "index.html"; return; }
  currentUserId = session.user.id;
  currentEmail = session.user.email || "";
  currentProfile = await loadProfile(session.user.user_metadata || {});
  applyI18n(currentProfile.language || "English");

  // Prefill the postcode + city from the saved profile
  if (currentProfile.postcode) document.getElementById("doc-postcode").value = currentProfile.postcode;
  if (currentProfile.city) document.getElementById("doc-city").value = currentProfile.city;

  // Default the language filter to the user's preferred language (they can change/clear it)
  const langSel = document.getElementById("doc-language");
  if (langSel && currentProfile.language) langSel.value = currentProfile.language;

  // Resolve which doctors this page lists, based on how the user arrived:
  //  - GP mode (homepage "Find a Doctor")      -> general practitioners only
  //  - specialist mode ("Find this doctor")    -> only what the AI recommended
  const mode = sessionStorage.getItem("mc_docmode");
  const ctx = document.getElementById("doc-context");
  if (mode === "specialist"){
    const spec = sessionStorage.getItem("mc_specialty") || "";
    if (!spec){
      // Specialist search must follow an AI recommendation; none -> back to the checker
      window.location.href = "symptom.html";
      return;
    }
    docSearchSpecialty = spec;
    ctx.textContent = t("doc_context").replace("{spec}", spec);
    ctx.classList.remove("hidden");
  } else {
    // Default / GP mode
    docSearchSpecialty = "General Practitioner";
    ctx.textContent = t("gp_context");
    ctx.classList.remove("hidden");
  }
}

/* PRIMARY source: the imported doctor database (Supabase `doctors` table).
   Resilient by design. If the table doesn't exist yet or the query errors, it
   returns [] so handleFindDoctors() falls back to OSM. Adjust the column names
   below to match the imported schema (assumed: postcode, specialty, languages). */
async function findDoctorsFromDB({ postcode, city, language, insuranceType }){
  try {
    let q = sb.from("doctors").select("*");
    // postcode is clean (5 digits) in the dataset; city has typos/variants, so
    // only fall back to a city match when no postcode was provided.
    if (postcode)   q = q.eq("postcode", postcode);
    else if (city)  q = q.ilike("city", `%${city}%`);
    if (language)   q = q.ilike("languages", `%${language}%`);   // languages stored as comma list
    // specialty is filtered client-side via matchesSpecialty() (DB labels vary in wording/spelling)

    /* Insurance availability filter (silent scaffolding; see INSURANCE_FILTER_ENABLED).
       OFF today: imported doctors have no insurance data, so we don't narrow on it.
       When a doctor `accepts_insurance` column exists (e.g. "Public" / "Private" /
       "Public,Private"), this silently keeps only doctors that take the patient's plan. */
    if (INSURANCE_FILTER_ENABLED && insuranceType){
      q = q.ilike("accepts_insurance", `%${insuranceType}%`);
    }

    const { data, error } = await q;
    if (error){ console.warn("[doctors] DB query failed. Falling back to OSM:", error.message); return []; }
    return data || [];
  } catch (e){
    console.warn("[doctors] DB query threw. Falling back to OSM:", e);
    return [];
  }
}

/* Does a doctor match the wanted specialty? Used to keep the rendered list
   specific (especially for the messy OSM fallback, which returns all doctors).
   GP matches general/family-practice synonyms (incl. German); specialists match
   on the specialty word or its stem so e.g. "Cardiology"/"Cardiologist" both hit. */
function matchesSpecialty(doc, specialty){
  // normalize British/American spelling (gynaecology->gynecology, anaesth->anesth, paediat->pediat)
  const norm = x => String(x || "").toLowerCase().replace(/ae/g, "e").replace(/paediat/g, "pediat");
  const s = norm(specialty).trim();
  if (!s) return true;
  const hay = norm((doc.specialty || "") + " " + (doc.name || "") + " " + (doc.type || ""));
  if (s.includes("general") || s === "gp"){
    return ["general practitioner","general","gp","allgemein","hausarzt","family","practitioner","médecin général","pratisyen","aile hekim"].some(k => hay.includes(k));
  }
  if (hay.includes(s)) return true;
  const root = s.replace(/(ologist|ologin|iatrician|ologue|ology|iatry|ist|in)$/,"");   // cardiologist -> cardi(olog)
  return root.length >= 4 && hay.includes(root.slice(0, 6));
}

async function handleFindDoctors(){
  const postcode = document.getElementById("doc-postcode").value.trim();
  const city = document.getElementById("doc-city").value.trim();
  const langSel = document.getElementById("doc-language");
  const language = langSel ? langSel.value : "";
  const specialty = docSearchSpecialty;   // GP or AI-recommended specialty, fixed by the entry mode
  const insuranceType = (currentProfile && currentProfile.insurance_type) || "";   // used by the silent insurance filter
  banner("doc-error", "");
  document.getElementById("doc-list").innerHTML = "";
  if (!postcode && !city){ banner("doc-error", "Please enter a postcode or city."); return; }

  const btn = document.getElementById("doc-search");
  btn.disabled = true;
  document.getElementById("doc-loading").classList.remove("hidden");

  try {
    /* ===== PRIMARY: imported doctor DB (Supabase "doctors" table) =====
       Filter the imported database first. It carries languages, so language
       filtering is real here. If it returns nothing (e.g. a city outside the
       dataset), we fall through to the OSM fallback below. */
    let dbDoctors = await findDoctorsFromDB({ postcode, city, language, insuranceType });
    if (specialty) dbDoctors = dbDoctors.filter(d => matchesSpecialty(d, specialty));   // keep it specific (GP or AI specialty)
    if (dbDoctors.length){
      console.log("[doctors] source: imported DB,", dbDoctors.length, "result(s)");
      renderDoctors(dbDoctors, "db");
      return;
    }

    /* ===== FALLBACK: live OSM for cities not in the DB =====
       USE_N8N = false -> Supabase Edge Function "find-doctors" (Nominatim +
                          Overpass): the fallback works in the standalone app.
       USE_N8N = true  -> n8n webhook: lets the n8n workflow be shown executing.
       Either way it returns the same doctor shape. */
    const fallbackBody = JSON.stringify({ postcode, city, specialty });
    const res = USE_N8N
      ? await fetch(N8N_DOCTORS_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: fallbackBody
        })
      : await fetch(DOCTORS_FN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
          body: fallbackBody
        });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    console.log("[doctors] source: OSM fallback (" + (USE_N8N ? "n8n" : "edge fn") + "), raw response:", data);

    // The OSM source returns an array of doctor objects (possibly {json:...} wrapped).
    let list = Array.isArray(data) ? data : (data.doctors || data.json || []);
    list = list.map(d => (d && d.json) ? d.json : d);   // unwrap {json:...} if present
    // Keep the list specific: OSM returns all nearby doctors, so filter to the
    // requested specialty (GP for "Find a Doctor", or the AI recommendation).
    if (specialty) list = list.filter(d => matchesSpecialty(d, specialty));
    // OSM has no verified languages; only drop a doctor if it HAS a language tag
    // that doesn't match (keep untagged ones, since we can't verify either way).
    if (language) list = list.filter(d => !d.languages || String(d.languages).toLowerCase().includes(language.toLowerCase()));
    renderDoctors(list, "osm");
  } catch (e) {
    console.error("[doctors] error:", e);
    banner("doc-error", "Couldn't reach the doctor service. Make sure the Find Doctors workflow is active (and CORS = *).");
  } finally {
    btn.disabled = false;
    document.getElementById("doc-loading").classList.add("hidden");
  }
}

function renderDoctors(list, source){
  lastDoctors = list || [];   // remember so "Book" can look a doctor up by index
  // Tag each doctor with its source: "db" = a row from the doctors table (has a
  // real doctors.id), "osm" = live fallback (NO doctors.id). Booking uses this to
  // decide whether to write the doctor_id foreign key — only DB doctors have one.
  lastDoctors.forEach(d => { if (d && typeof d === "object") d._source = source; });
  const el = document.getElementById("doc-list");
  if (!list || !list.length){
    el.innerHTML = '<p class="sc-intro">No doctors found near that postcode. Try a nearby one.</p>';
    return;
  }
  el.innerHTML = list.map((d, i) => {
    // Address is built from `street` + postcode/city ON PURPOSE. OSM results carry a
    // clean `street`, so they show a full address. The imported DB `doctors` rows have
    // NO `street` (their scraped `address` is dirty/unreliable), so they intentionally
    // fall back to postcode + city only. This is a deliberate data-quality choice, not
    // a bug — don't "fix" it by reading d.address until the DB addresses are cleaned.
    const addr = [d.street, [d.postcode, d.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    // Only show Call when the phone looks real (the dataset has many junk values like "00 - 15")
    const validPhone = d.phone && String(d.phone).replace(/\D/g, "").length >= 6;
    const phone = validPhone ? `<a class="dbtn" href="tel:${String(d.phone).replace(/\s+/g,"")}"><i class="fa-solid fa-phone"></i> ${t("call")}</a>` : "";
    const web = d.website ? `<a class="dbtn" href="${d.website}" target="_blank" rel="noopener"><i class="fa-solid fa-globe"></i> ${t("website")}</a>` : "";
    const book = `<button class="dbtn" onclick="bookDoctor(${i})"><i class="fa-solid fa-calendar-check"></i> ${t("book")}</button>`;
    // Languages are no longer paywalled. Show them when available (real for DB
    // doctors); otherwise note they aren't listed (e.g. an OSM fallback result).
    const langs = d.languages
      ? `<div class="daddr"><i class="fa-solid fa-language"></i> ${d.languages}</div>`
      : `<div class="daddr muted"><i class="fa-solid fa-language"></i> ${t("langs_not_listed")}</div>`;
    return `<div class="doc-card">
      <div class="dname"><i class="fa-solid fa-user-doctor" style="color:var(--teal)"></i> ${d.name || "Unknown"}</div>
      <div class="dspec">${d.specialty || "General"}</div>
      ${addr ? `<div class="daddr"><i class="fa-solid fa-location-dot"></i> ${addr}</div>` : ""}
      ${langs}
      <div class="dactions">${book}${phone}${web}</div>
    </div>`;
  }).join("");
}

/* "Book" on a doctor card -> stash the doctor and go to booking.html */
function bookDoctor(i){
  const d = lastDoctors[i];
  if (d) sessionStorage.setItem("mc_doctor", JSON.stringify(d));
  window.location.href = "booking.html";
}

/* ===================== BOOKING (guarded) ===================== */
/* Standard appointment slots used when a doctor publishes opening hours. */
const DEFAULT_BOOKING_SLOTS = ["09:00","10:00","11:00","14:00","15:00","16:00"];
function hhmmToMinutes(s){ const m = String(s).match(/(\d{1,2}):(\d{2})/); return m ? (+m[1]) * 60 + (+m[2]) : null; }

/* Derive bookable HH:MM slots from a free-text opening_hours string (OSM style,
   e.g. "Mo-Fr 08:00-12:00, 14:00-18:00"). Keeps the standard slots that fall
   within any published time range; if none parse, returns the standard slots.
   NOTE: day-of-week ("Mo-Fr") is not enforced here. That level of accuracy
   would come from the live doctor-calendar sync scaffold. */
function slotsFromOpeningHours(oh){
  if (!oh) return DEFAULT_BOOKING_SLOTS.slice();
  const ranges = [];
  const re = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/g;
  let m;
  while ((m = re.exec(String(oh)))){
    const a = hhmmToMinutes(m[1]), b = hhmmToMinutes(m[2]);
    if (a != null && b != null) ranges.push([a, b]);
  }
  if (!ranges.length) return DEFAULT_BOOKING_SLOTS.slice();
  return DEFAULT_BOOKING_SLOTS.filter(s => { const v = hhmmToMinutes(s); return ranges.some(([a,b]) => v >= a && v < b); });
}

/* Day-of-week parsing for opening_hours (OSM style). JS getDay(): 0=Sun..6=Sat. */
const DOW = { Su:0, Mo:1, Tu:2, We:3, Th:4, Fr:5, Sa:6 };
const DOW_ORDER = ["Mo","Tu","We","Th","Fr","Sa","Su"];

/* From one rule (e.g. "Mo-Fr", "Mo,We,Fr", "Sa") return the weekday numbers it
   covers, or null if it names no days (then the times apply to every day). */
function parseDaySpec(rule){
  const days = new Set();
  let found = false;
  // ranges first: Mo-Fr (handles wrap-around like Fr-Mo)
  const stripped = rule.replace(/(Mo|Tu|We|Th|Fr|Sa|Su)\s*[-–]\s*(Mo|Tu|We|Th|Fr|Sa|Su)/g, (_, a, b) => {
    found = true;
    let i = DOW_ORDER.indexOf(a), j = DOW_ORDER.indexOf(b);
    if (i <= j){ for (let k = i; k <= j; k++) days.add(DOW[DOW_ORDER[k]]); }
    else { for (let k = i; k < 7; k++) days.add(DOW[DOW_ORDER[k]]); for (let k = 0; k <= j; k++) days.add(DOW[DOW_ORDER[k]]); }
    return " ";
  });
  // then any standalone day tokens (comma lists / singles)
  (stripped.match(/\b(Mo|Tu|We|Th|Fr|Sa|Su)\b/g) || []).forEach(dn => { found = true; days.add(DOW[dn]); });
  return found ? [...days] : null;
}

/* Parse a full opening_hours string into { weekday: [[startMin,endMin], …] }, or
   null if nothing parseable. e.g. "Mo-Fr 08:00-12:00,14:00-18:00; Sa 09:00-13:00". */
function parseOpeningHours(oh){
  if (!oh) return null;
  const byDay = {};
  let any = false;
  String(oh).split(/[;\n]/).forEach(rule => {
    rule = rule.trim();
    if (!rule) return;
    const times = [];
    const tre = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/g;
    let tm;
    while ((tm = tre.exec(rule))){ const a = hhmmToMinutes(tm[1]), b = hhmmToMinutes(tm[2]); if (a != null && b != null) times.push([a, b]); }
    if (!times.length) return;
    const days = parseDaySpec(rule) || [0,1,2,3,4,5,6];
    days.forEach(dn => { (byDay[dn] = byDay[dn] || []).push(...times); any = true; });
  });
  return any ? byDay : null;
}

/* Standard slots that fall inside the doctor's hours for a specific date's weekday.
   Returns [] when the practice is closed that day. */
function slotsForDate(byDay, dateStr){
  if (!byDay) return DEFAULT_BOOKING_SLOTS.slice();
  const dn = new Date(dateStr + "T00:00:00").getDay();
  const ranges = byDay[dn];
  if (!ranges || !ranges.length) return [];
  return DEFAULT_BOOKING_SLOTS.filter(s => { const v = hhmmToMinutes(s); return ranges.some(([a,b]) => v >= a && v < b); });
}

/* The imported dataset stores opening hours as 7 day columns
   (hours_mon … hours_sun), each like "08:00-16:00", "08:00-12:00, 14:00-18:00",
   or "No info available". Build the same { weekday: [[startMin,endMin],…] } map. */
const ROW_DAY_COLS = [["hours_mon",1],["hours_tue",2],["hours_wed",3],["hours_thu",4],["hours_fri",5],["hours_sat",6],["hours_sun",0]];
const DAY_ABBR = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function openingHoursFromRow(d){
  if (!d) return null;
  const byDay = {}; let any = false;
  for (const [col, dn] of ROW_DAY_COLS){
    const v = d[col];
    if (!v || /no info/i.test(v)) continue;
    const ranges = []; const re = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/g; let m;
    while ((m = re.exec(v))){ const a = hhmmToMinutes(m[1]), b = hhmmToMinutes(m[2]); if (a != null && b != null) ranges.push([a, b]); }
    if (ranges.length){ byDay[dn] = ranges; any = true; }
  }
  return any ? byDay : null;
}
/* Human-readable hours line, e.g. "Mon 08:00-16:00 · Tue 08:00-18:00". */
function openingHoursText(d){
  const parts = [];
  for (const [col, dn] of ROW_DAY_COLS){
    const v = d[col];
    if (v && !/no info/i.test(v) && /\d{1,2}:\d{2}/.test(v)) parts.push(DAY_ABBR[dn] + " " + v);
  }
  return parts.join(" · ");
}

/* The next date on/after `fromStr` (YYYY-MM-DD) that the practice is open.
   Formats from LOCAL components (not toISOString) so it never shifts a day. */
function nextOpenDate(byDay, fromStr){
  const open = byDay ? Object.keys(byDay).map(Number) : [0,1,2,3,4,5,6];
  const dt = new Date(fromStr + "T00:00:00");
  for (let i = 0; i < 14; i++){
    if (open.includes(dt.getDay())){
      return dt.getFullYear() + "-" + String(dt.getMonth()+1).padStart(2,"0") + "-" + String(dt.getDate()).padStart(2,"0");
    }
    dt.setDate(dt.getDate() + 1);
  }
  return fromStr;
}

/* Email-request fallback for doctors with NO published availability.
   PROTOTYPE SAFETY: 
   Never send actual email to the doctor. Logic/Process bounces to user's OWN inbox
   as a personal mailto draft, with the doctor's contact shown in the body for reference only. */
function bookByEmail(){
  const d = bookingDoctor || {};
  const to = currentEmail || "";   // always the logged-in user's own address (never the doctor)
  const patient = ((currentProfile.first_name || "") + " " + (currentProfile.last_name || "")).trim();
  const subject = `Appointment request ${d.name || "doctor"}`;
  const body = `(Prototype draft not sent to the practice.)\n\n`
    + `I would like to request an appointment with ${d.name || "the practice"}`
    + (d.specialty ? ` (${d.specialty})` : "") + `.\n\n`
    + (patient ? `Patient: ${patient}\n` : "")
    + `Preferred language: ${currentProfile.language || "English"}\n`
    + (d.email ? `Practice contact (reference): ${d.email}\n` : "")
    + (d.phone ? `Practice phone (reference): ${d.phone}\n` : "");
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function initBooking(){
  const { data: { session } } = await sb.auth.getSession();
  if (!session){ window.location.href = "index.html"; return; }
  currentUserId = session.user.id;
  currentEmail = session.user.email || "";
  currentProfile = await loadProfile(session.user.user_metadata || {});
  applyI18n(currentProfile.language || "English");

  bookingDoctor = JSON.parse(sessionStorage.getItem("mc_doctor") || "null");
  if (!bookingDoctor){
    document.getElementById("bk-summary").innerHTML = "No doctor selected, go back and choose one.";
    return;
  }
  const d = bookingDoctor;
  const addr = [d.street, [d.postcode, d.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  document.getElementById("bk-doc-name").textContent = d.name || "Doctor";
  document.getElementById("bk-doc-spec").textContent = d.specialty || "";
  document.getElementById("bk-doc-addr").textContent = addr;

  const today = new Date().toISOString().split("T")[0];   // default + minimum = today
  const dateEl = document.getElementById("bk-date");
  dateEl.min = today;
  dateEl.value = today;
  const timeEl = document.getElementById("bk-time");

  // Opening hours come from the 7 day columns (hours_mon … hours_sun); fall back
  // to a free-text opening_hours field if a different data source ever provides one.
  const byDayRow = openingHoursFromRow(d);
  const oh = byDayRow ? openingHoursText(d) : (d.opening_hours || d.openingHours || "");
  const hasHours = !!(byDayRow) || !!(d.opening_hours || d.openingHours);
  const hoursEl = document.getElementById("bk-doc-hours");
  if (hoursEl) hoursEl.innerHTML = oh ? `<i class="fa-solid fa-clock"></i> ${t("bk_hours_label")}: ${oh}` : "";

  // Reschedule always uses the time-slot form (the existing appointment had a time)
  const resc = JSON.parse(sessionStorage.getItem("mc_reschedule") || "null");
  sessionStorage.removeItem("mc_reschedule");   // consume it (a fresh booking won't reuse it)
  const isReschedule = !!(resc && resc.id != null);
  // Remember the pre-change slot + original booking time so handleBooking() can log
  // the reschedule into appointments_reschedule (old -> new, plus lead-time metrics).
  rescheduleOldDatetime = isReschedule ? resc.datetime : null;
  rescheduleBookedAt = isReschedule ? (resc.created_at || null) : null;

  /* ── Availability routing ───────────────────────────────────────────────
     Doctor HAS opening hours (or it's a reschedule) -> time-slot booking,
       with slots arranged to the opening hours (or the doctor's live calendar
       once the DOCTOR_CALENDAR scaffold is enabled).
     Doctor has NO availability -> email-request mode (personal mailto). */
  // NOTE: #bk-form and #bk-email-mode both have inline display:flex, which beats
  // the .hidden class -> toggle via style.display, not classList.
  const formEl = document.getElementById("bk-form");
  const emailEl = document.getElementById("bk-email-mode");
  const rescP = isReschedule ? apptParts(resc.datetime) : null;

  if (isReschedule || hasHours){
    formEl.style.display = "flex";
    emailEl.style.display = "none";   // booking is available -> never show the email fallback

    const calSlots = await fetchDoctorCalendarSlots(d);     // inactive scaffold -> null today
    const byDay = calSlots ? null : (byDayRow || parseOpeningHours(d.opening_hours || d.openingHours || ""));
    bookingByDay = byDay;             // remembered so handleBooking can reject closed days
    const noteEl = document.getElementById("bk-avail-note");

    // Rebuild the time options for whatever date is currently chosen, honoring
    // that day's opening hours (empty + warning when the practice is closed).
    function refreshSlots(){
      let slots;
      if (calSlots) slots = calSlots;                       // future: real free/busy
      else if (byDay) slots = slotsForDate(byDay, dateEl.value);
      else slots = DEFAULT_BOOKING_SLOTS.slice();           // no hours data (e.g. reschedule)
      const closed = !!(byDay && slots.length === 0);
      timeEl.innerHTML = `<option value="">${t("select_time")}</option>` +
        slots.map(s => `<option value="${s}">${s}</option>`).join("");
      if (noteEl){
        noteEl.style.display = oh ? "block" : "none";
        noteEl.textContent = closed ? t("bk_closed_day") : t("bk_avail_note");
        noteEl.style.color = closed ? "var(--destructive)" : "var(--muted)";
      }
    }

    // Pick the initial date: a reschedule keeps its saved date; a fresh booking
    // jumps to the next open day. Then build that date's slots.
    if (isReschedule && rescP && rescP.dateStr >= today) dateEl.value = rescP.dateStr;
    else if (byDay) dateEl.value = nextOpenDate(byDay, today);
    refreshSlots();
    dateEl.onchange = refreshSlots;   // re-evaluate slots/closed when the user changes the date

    // Reschedule: make sure the previously-booked time is selectable + selected
    if (isReschedule && rescP){
      if (![...timeEl.options].some(o => o.value === rescP.timeStr)){
        const opt = document.createElement("option"); opt.value = rescP.timeStr; opt.textContent = rescP.timeStr; timeEl.appendChild(opt);
      }
      timeEl.value = rescP.timeStr;
    }
  } else {
    formEl.style.display = "none";
    emailEl.style.display = "flex";   // no availability -> show the email-request fallback
    bookingByDay = null;
  }

  // ----- Reschedule: set the id + relabel the screen -----
  if (isReschedule){
    rescheduleId = resc.id;
    const titleEl = document.querySelector("#booking-page .header h1");
    if (titleEl) titleEl.textContent = t("reschedule_title");
    const confirmBtn = document.getElementById("bk-confirm");
    if (confirmBtn) confirmBtn.textContent = t("reschedule_btn");
  }
}

async function handleBooking(){
  const date = document.getElementById("bk-date").value;
  const time = document.getElementById("bk-time").value;
  banner("bk-error", "");
  if (!date){ banner("bk-error", "Please pick a date."); return; }
  // Reject dates the practice is closed (no slots for that weekday)
  if (bookingByDay && slotsForDate(bookingByDay, date).length === 0){ banner("bk-error", t("bk_closed_day")); return; }
  if (!time){ banner("bk-error", "Please pick a date and time."); return; }

  const btn = document.getElementById("bk-confirm");
  btn.disabled = true;

  const d = bookingDoctor || {};
  const addr = [d.street, [d.postcode, d.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  try {
    btn.textContent = t("booking_loading");
    const targetDatetime = `${date}T${time}:00`;
    let savedDatetime = null;   // the datetime AS STORED in Supabase (what we show on the confirmation)
    if (rescheduleId != null){
      // RESCHEDULE. The change set is shared by both pathways below.
      const reschedulePayload = {
        appointment_id: rescheduleId,
        user_id: currentUserId,
        datetime: targetDatetime
      };

      /* ===== DUMMY ArztAPI PATHWAY (inactive) =====
         ARZT_API_ENABLED is false, so this never runs today. It shows where a
         future direct ArztAPI reschedule would replace the Supabase update.
         rescheduleViaArztApi() returns a stub. */
      if (ARZT_API_ENABLED){
        const arzt = await rescheduleViaArztApi(reschedulePayload);
        if (!arzt || !arzt.ok) throw new Error("ArztAPI reschedule failed");
        // NOTE: a real ArztAPI must still keep our appointments row in sync so the
        // confirmation + list reflect the new time. Mirror it to Supabase here.
        savedDatetime = targetDatetime;
      }

      /* ===== SUPABASE UPDATE (active / default) =====
         Update the SAME row (matched by id) so we never duplicate or overwrite the
         wrong one. .select() returns the rows actually changed; if RLS blocks it or
         the row isn't found, Supabase returns NO error but an empty array, so we
         check the length ourselves. */
      else {
        const { data: updated, error } = await sb.from("appointments")
          .update({ datetime: targetDatetime })
          .eq("id", rescheduleId).eq("user_id", currentUserId)
          .select();
        if (error) throw error;
        if (!updated || !updated.length){
          throw new Error("Update changed 0 rows. The appointments table likely needs an RLS UPDATE policy for the owner (auth.uid() = user_id), or user_id on the row doesn't match the logged-in user.");
        }
        savedDatetime = updated[0].datetime;   // straight from the updated DB row
        console.log("✅ [Supabase] Appointment rescheduled:", updated[0]);
      }

      /* Archive the reschedule for tracking (invisible to the user; mirrors the
         cancel archive). Captures old -> new slot so metrics can measure reschedule
         frequency and lead time. Best-effort: a failure here must NOT undo the
         reschedule the user just made, so we only log it. Runs for any pathway that
         actually changed the time (savedDatetime set). */
      if (savedDatetime != null){
        const { error: rsErr } = await sb.from("appointments_reschedule").insert({
          appointment_id: rescheduleId,
          user_id: currentUserId,
          doctor_name: d.name || null,
          doctor_specialty: d.specialty || null,
          doctor_address: addr || d.address || null,
          old_datetime: rescheduleOldDatetime || null,   // slot before the change
          new_datetime: savedDatetime,                   // slot after the change
          booked_at: rescheduleBookedAt || null,         // original booking time (lead-time metrics)
          source: "user_reschedule"
        });
        if (rsErr) console.error("[appointments_reschedule] archive error (reschedule still applied)", rsErr);
        else console.log("🗂️ [Supabase] Reschedule archived to appointments_reschedule");
      }
    } else {
      // NEW BOOKING. The request body is shared by both pathways below.
      // doctor_id links the appointment to the real doctors table (foreign key).
      // Only DB doctors have a valid doctors.id; OSM-fallback doctors don't, so we
      // send null for them (the FK allows null, and the text snapshot still records
      // who the appointment is with).
      const doctorId = (d._source === "db" && d.id != null) ? d.id : null;
      const bookingPayload = {
        user_id: currentUserId,
        doctor_id: doctorId,
        doctor_name: d.name || "",
        doctor_specialty: d.specialty || "",
        doctor_address: addr,
        datetime: targetDatetime
      };

      /* ===== DUMMY ArztAPI PATHWAY (inactive) =====
         ARZT_API_ENABLED is false, so this branch never runs today. It shows where
         a future direct ArztAPI booking would replace the live flow.
         bookViaArztApi() currently returns a stub. */
      if (ARZT_API_ENABLED){
        const arzt = await bookViaArztApi(bookingPayload);
        if (!arzt || !arzt.ok) throw new Error("ArztAPI booking failed");
        // NOTE: a real ArztAPI would also need to persist/return the row so the
        // confirmation + appointments list stay in sync. Wire that here when live.
        savedDatetime = targetDatetime;
      }

      /* ===== n8n WEBHOOK (demo: USE_N8N = true) ===== */
      else if (USE_N8N){
        // Insert via the n8n webhook (saves a new row in the appointments table)
        const res = await fetch(N8N_BOOKING_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload)
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        // Re-read the row the webhook just wrote so the confirmation reflects what
        // actually persisted (and not just what we typed). Match on the slot we sent.
        const { data: rows } = await sb.from("appointments")
          .select("datetime").eq("user_id", currentUserId);
        const match = (rows || []).find(r => {
          const p = apptParts(r.datetime);
          return p && p.dateStr === date && p.timeStr === time;
        });
        savedDatetime = match ? match.datetime : targetDatetime;
      }

      /* ===== DIRECT SUPABASE (standalone / default) =====
         Write the appointment straight to Supabase, no n8n needed. Requires an
         RLS INSERT policy on `appointments` (with check: auth.uid() = user_id). */
      else {
        const { data: inserted, error } = await sb.from("appointments").insert(bookingPayload).select();
        if (error) throw error;
        if (!inserted || !inserted.length){
          throw new Error("Insert returned no row. The appointments table likely needs an RLS INSERT policy (with check auth.uid() = user_id).");
        }
        savedDatetime = inserted[0].datetime;
        console.log("✅ [Supabase] Appointment booked (direct):", inserted[0]);
      }
    }

    // Format the persisted datetime as wall-clock (no timezone shift; see apptParts)
    const ps = apptParts(savedDatetime);
    const whenText = ps
      ? ps.local.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short", year:"numeric" }) + " at " + ps.timeStr
      : (date + " at " + time);

    // Hide the WHOLE form (inline display:flex beats the .hidden class, so set display directly)
    document.getElementById("bk-form").style.display = "none";
    document.getElementById("bk-confirm-name").textContent = d.name || "your doctor";
    document.getElementById("bk-confirm-when").textContent = whenText;

    document.getElementById("bk-done").classList.remove("hidden");
    const scr = phoneScreen(); if (scr) scr.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    console.error("[booking] error:", e);
    banner("bk-error", "Couldn't complete the booking. Make sure the Book Appointment workflow is active (CORS = *).");
    btn.disabled = false; btn.textContent = t("bk_confirm_btn");
  }
}
