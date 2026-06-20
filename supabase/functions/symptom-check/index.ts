// supabase/functions/symptom-check/index.ts
//
// Symptom triage via Groq, running inside Supabase Edge Functions (Deno).
// The Groq API key stays server-side (Supabase secret GROQ_API_KEY) and this
// function adds the CORS headers the browser needs - so the app can run on its
// own without n8n. Returns the SAME JSON shape the app already expects.
//
// Deploy:  supabase functions deploy symptom-check --no-verify-jwt
// Secret:  supabase secrets set GROQ_API_KEY=gsk_xxx   (or set it in the dashboard)

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; // swap for any current Groq model if needed

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);
  if (!GROQ_API_KEY) return json({ error: "GROQ_API_KEY secret is not set" }, 500);

  try {
    const { symptoms = "", language = "English" } = await req.json();
    if (!String(symptoms).trim()) return json({ error: "No symptoms provided" }, 400);

    const system =
      "You are a medical NAVIGATION assistant for patients in Germany. You do NOT " +
      "diagnose; you point the patient to the right kind of doctor and flag urgency.\n" +
      "Return ONLY a JSON object with EXACTLY these keys:\n" +
      '{\n' +
      '  "urgency": "emergency" | "soon" | "routine",\n' +
      `  "explanation_for_user": short 1-3 sentence explanation written in the user's language (${language}),\n` +
      '  "recommended_doctor_type": the medical specialty to see, in English (e.g. "General Practitioner", "Dermatology", "Cardiology"),\n' +
      '  "referral_required": boolean - true if a GP referral (Überweisung) is typically needed before seeing this specialist,\n' +
      '  "needs_human_review": boolean - true if the description is ambiguous, severe, or a clinician should review it\n' +
      "}\n" +
      'Use "emergency" only for red-flag, potentially life-threatening symptoms. ' +
      "No markdown, no commentary - JSON only.";

    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: String(symptoms) },
        ],
      }),
    });

    if (!r.ok) return json({ error: "Groq request failed", detail: await r.text() }, 502);

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Fallback so the UI still shows something useful if the model didn't return clean JSON
      parsed = {
        urgency: "routine",
        explanation_for_user: String(content).slice(0, 400),
        recommended_doctor_type: "General Practitioner",
        referral_required: false,
        needs_human_review: false,
      };
    }
    return json(parsed);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
