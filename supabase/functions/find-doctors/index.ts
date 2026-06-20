// supabase/functions/find-doctors/index.ts
//
// OSM fallback for the doctor directory, running inside Supabase Edge Functions.
// Mirrors the n8n "find-doctors" flow: Nominatim geocode (postcode/city -> lat/lon)
// -> Overpass `around` query -> normalize -> return. Adds CORS so the browser can
// call it directly, and sets a User-Agent (Nominatim requires one; the browser
// can't, which is exactly why this lives server-side).
//
// Deploy:  supabase functions deploy find-doctors --no-verify-jwt
// No secrets needed - OSM/Nominatim/Overpass are free public APIs.

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

// fetch with a hard timeout so a slow OSM mirror can't hang the whole function
async function fetchT(url: string, opts: RequestInit = {}, ms = 9000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
  finally { clearTimeout(id); }
}

const SPECIALTY_MAP: Record<string, string> = {
  general: "General Practitioner", dermatology: "Dermatologist",
  cardiology: "Cardiologist", paediatrics: "Pediatrician",
  gynaecology: "Gynecologist", orthopaedics: "Orthopedist",
  psychiatry: "Psychiatrist", ophthalmology: "Ophthalmologist",
  otolaryngology: "ENT",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST" }, 405);

  try {
    const { postcode = "", city = "" } = await req.json();
    if (!String(postcode).trim() && !String(city).trim()) return json({ error: "postcode or city required" }, 400);

    const UA = "ClearCare-Prototype/1.0 (student project)";

    // 1) Geocode with Nominatim (postcode preferred; else city), restricted to Germany
    const loc = String(postcode).trim()
      ? `postalcode=${encodeURIComponent(String(postcode).trim())}`
      : `city=${encodeURIComponent(String(city).trim())}`;
    const geoUrl = `https://nominatim.openstreetmap.org/search?${loc}&country=Germany&format=json&limit=1`;
    let geo: any = [];
    try {
      const geoRes = await fetchT(geoUrl, { headers: { "User-Agent": UA, "Accept": "application/json" } });
      if (geoRes.ok) geo = await geoRes.json();
      else console.error("[find-doctors] geocode HTTP", geoRes.status);
    } catch (e) { console.error("[find-doctors] geocode threw", String(e)); }
    if (!Array.isArray(geo) || !geo.length) return json([]);   // unknown location -> empty list
    const { lat, lon } = geo[0];

    // 2) Overpass: doctors within ~6km of that point. The public Overpass instances
    //    are flaky / rate-limited, so try several mirrors until one responds.
    const q =
      `[out:json][timeout:25];(` +
      `node["amenity"="doctors"](around:6000,${lat},${lon});` +
      `node["healthcare"="doctor"](around:6000,${lat},${lon});` +
      `);out body 60;`;
    const OVERPASS_ENDPOINTS = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://overpass.openstreetmap.fr/api/interpreter",
    ];
    let ov: any = null;
    for (const url of OVERPASS_ENDPOINTS){
      try {
        const ovRes = await fetchT(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA, "Accept": "application/json" },
          body: "data=" + encodeURIComponent(q),
        }, 12000);
        if (!ovRes.ok){ console.error("[find-doctors] overpass HTTP", ovRes.status, "at", url); continue; }
        ov = await ovRes.json();
        break;
      } catch (e){ console.error("[find-doctors] overpass threw at", url, String(e)); }
    }
    if (!ov) return json([]);   // all mirrors failed -> graceful empty list (see logs for detail)

    // 3) Normalize to the app's doctor shape (same fields as the imported DB rows)
    const els = ov.elements || [];
    const out = els.filter((e: any) => e.tags && e.tags.name).map((e: any) => {
      const t = e.tags;
      const spec = (t["healthcare:speciality"] || "").split(";")[0].trim().toLowerCase();
      return {
        name: t.name,
        specialty: SPECIALTY_MAP[spec] || (spec ? spec : "General Practitioner"),
        languages: t["language"] || (t["language:en"] === "yes" ? "English" : ""),
        street: [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" "),
        postcode: t["addr:postcode"] || "",
        city: t["addr:city"] || "",
        phone: t.phone || t["contact:phone"] || "",
        website: t.website || t["contact:website"] || "",
        source: "OSM",
      };
    });
    return json(out);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
