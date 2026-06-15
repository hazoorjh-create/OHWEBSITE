/**
 * Best-effort in-memory rate limiter (mirrors oh_web.py rate_ok).
 * On serverless this is per-instance, not global — the real protection for
 * /api/link is the per-user "already linked" guard. Swap for Upstash if global
 * limits are needed.
 */
const buckets = new Map<string, number[]>();

export function rateOk(key: string, limit: number, per: number): boolean {
  const now = Date.now() / 1000;
  let q = buckets.get(key);
  if (!q) buckets.set(key, (q = []));
  while (q.length && q[0] < now - per) q.shift();
  if (q.length >= limit) return false;
  q.push(now);
  return true;
}

/** Same-origin check for state-changing requests (CSRF backstop). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("Origin");
  if (!origin) return true; // no Origin header -> allow (matches Python)
  try {
    return new URL(origin).host === req.headers.get("Host");
  } catch {
    return false;
  }
}
