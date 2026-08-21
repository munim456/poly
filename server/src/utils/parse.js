// pg driver returns json/jsonb columns already parsed as JS values.
// Older rows (or sqlite-style text columns) may still hold JSON strings.
export function parseMaybeJson(value, fallback) {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'object') return value
  if (typeof value !== 'string') return fallback
  try {
    const parsed = JSON.parse(value)
    return parsed !== null && typeof parsed === 'object' ? parsed : fallback
  } catch {
    return fallback
  }
}
