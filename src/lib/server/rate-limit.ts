/**
 * Small in-memory rate limiter. It only protects a single running instance,
 * which is enough to stop casual abuse of the AI endpoint. For hard limits,
 * add a Vercel Firewall rate-limit rule on /api/extract.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
