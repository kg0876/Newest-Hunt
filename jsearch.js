
// netlify/functions/jsearch.js
// Uses native fetch (Node 18+). Adds entry-level filter (0-3 yrs) for BA/DA roles.
exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const query = params.get("query") || "Financial Analyst in Ontario, Canada";
    const role  = (params.get("role") || "").toLowerCase(); // 'ba' or 'da' etc.

    // Normalize date_posted
    const raw = (params.get("date_posted") || "today").toLowerCase();
    const dateMap = { "last_24_hours":"today","24h":"today","past_24_hours":"today","today":"today","3day":"3days","3days":"3days","week":"week","month":"month","anytime":"anytime" };
    const date_posted = dateMap[raw] || "today";
    const page = params.get("page") || "1";
    const num_pages = params.get("num_pages") || "1";

    const apiUrl = new URL("https://jsearch.p.rapidapi.com/search");
    apiUrl.searchParams.set("query", query);
    apiUrl.searchParams.set("date_posted", date_posted);
    apiUrl.searchParams.set("page", page);
    apiUrl.searchParams.set("num_pages", num_pages);

    const res = await fetch(apiUrl.toString(), {
      headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "", "X-RapidAPI-Host": "jsearch.p.rapidapi.com" }
    });
    const json = await res.json();

    // Post-filter for entry level (0-3 yrs) if role is BA or DA
    const isBAorDA = role === 'ba' || role === 'da';
    let data = Array.isArray(json.data) ? json.data : [];

    if (isBAorDA) {
      const within3 = (months) => (typeof months === 'number') && (months <= 36);
      # Python-like 'and' would fail in JS. let's fix quickly in next write.
    }
    
if (isBAorDA) {
  const within3 = (months) => (typeof months === 'number') && (months <= 36);
  const hasEntryWords = (txt='') => /\b(entry\s*level|junior|0-1\s*year|0-2\s*years|0-3\s*years|1-3\s*years|2-3\s*years|fresh(er)?)\b/i.test(txt);
  const pickMonths = (obj) => {
    if (!obj) return null;
    // common JSearch shapes observed
    if (typeof obj.required_experience_in_months === 'number') return obj.required_experience_in_months;
    if (typeof obj.experience_in_months === 'number') return obj.experience_in_months;
    return null;
  };
  data = data.filter(item => {
    const expObj = item.job_required_experience || item.required_experience || null;
    const months = pickMonths(expObj);
    const text = (item.job_description || '') + ' ' + (item.job_title || '');
    if (months !== null) return within3(months);
    return hasEntryWords(text);
  });
  json.data = data;
}
    return { statusCode: 200, headers: { "content-type": "application/json","access-control-allow-origin":"*" }, body: JSON.stringify(json) };
  } catch (err) {
    return { statusCode: 500, headers: { "content-type":"application/json","access-control-allow-origin":"*" }, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
