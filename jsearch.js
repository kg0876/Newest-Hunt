if (isBAorDA) {
  // Keep only entry-ish jobs for BA/DA, but don't over-filter
  const withinLimit = (months) => (typeof months === 'number') && (months <= 48);

  const looksSenior = (txt = '') =>
    /\b(senior|sr\.|lead|principal|manager|director|head)\b/i.test(txt) ||
    /\b(5\+|6\+|7\+|8\+)\s*years?\b/i.test(txt) ||
    /\b(7|8|9|10)\s*\+?\s*years?\b/i.test(txt);

  const pickMonths = (obj) => {
    if (!obj) return null;
    if (typeof obj.required_experience_in_months === 'number') return obj.required_experience_in_months;
    if (typeof obj.experience_in_months === 'number') return obj.experience_in_months;
    return null;
  };

  data = data.filter(item => {
    const expObj = item.job_required_experience || item.required_experience || null;
    const months = pickMonths(expObj);
    const text = (item.job_description || '') + ' ' + (item.job_title || '');
    if (months !== null) return withinLimit(months);
    return !looksSenior(text);
  });

  json.data = data;
}
