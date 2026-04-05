/**
 * Build geocoding query for India.
 * When a 6-digit PIN is present, put it first — works better with Google & Nominatim for India.
 */
export function buildStructuredGeocodeQuery(village, district, state, pincode) {
  if (!state?.trim()) return "";
  const st = state.trim();
  const p = (pincode || "").trim();
  const v = (village || "").trim();
  const d = (district || "").trim();

  if (/^\d{6}$/.test(p)) {
    const tail = [v, d, st].filter(Boolean).join(", ");
    return tail ? `${p}, ${tail}, India` : `${p}, ${st}, India`;
  }

  const parts = [];
  if (v) parts.push(v);
  if (d) parts.push(d);
  parts.push(st);
  return parts.join(", ") + ", India";
}

/** Human-readable location line for API storage (no trailing country if redundant) */
export function buildStructuredDetailsLine(village, district, state, pincode) {
  const parts = [];
  if (village?.trim()) parts.push(village.trim());
  if (district?.trim()) parts.push(district.trim());
  if (state?.trim()) parts.push(state.trim());
  const p = (pincode || "").trim();
  if (/^\d{6}$/.test(p)) parts.push(p);
  return parts.join(", ");
}

/**
 * Enough info to attempt geocoding:
 * - state + 6-digit PIN, or
 * - state + district (2+ chars), or
 * - state + village/locality (3+ chars), or
 * - free-form: district + village both present (legacy)
 */
export function structuredQueryReady(district, village, state, pincode) {
  if (!state?.trim()) return false;
  const p = (pincode || "").trim();
  if (/^\d{6}$/.test(p)) return true;
  if (district.trim().length >= 2) return true;
  if ((village || "").trim().length >= 3) return true;
  return false;
}
