// Rate limiter with two backends: an in-memory fixed-window limiter (default, good enough to
// blunt casual abuse on a single warm serverless instance) and an optional Upstash Redis-backed
// one (shared across instances) when UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are set —
// see docs/DEPLOYMENT.md. The in-memory limiter is NOT a substitute for a shared store under
// real multi-instance production traffic (documented as a known limitation in docs/SECURITY.md
// prior to this phase); Upstash closes that gap without adding a client SDK dependency (calls
// its plain HTTP REST API directly, same pattern as src/lib/notifications.ts and src/lib/sms.ts).
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function rateLimitMemory(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

interface UpstashPipelineResult {
  result: number;
  error?: string;
}

async function rateLimitRedis(
  key: string,
  limit: number,
  windowMs: number,
  url: string,
  token: string,
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`;
  // Atomically increment the counter and read its remaining TTL in one round trip.
  const response = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify([
      ["INCR", redisKey],
      ["PTTL", redisKey],
    ]),
  });
  if (!response.ok) throw new Error(`Upstash responded with ${response.status}`);

  const [incrResult, ttlResult] = (await response.json()) as UpstashPipelineResult[];
  const count = incrResult.result;
  let ttlMs = ttlResult.result;

  // First hit in a new window (or a key that somehow lost its TTL) — (re)arm the expiry so the
  // counter resets after windowMs.
  if (count === 1 || ttlMs < 0) {
    await fetch(`${url}/pexpire/${redisKey}/${windowMs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    ttlMs = windowMs;
  }

  const resetAt = Date.now() + ttlMs;
  if (count > limit) {
    return { allowed: false, remaining: 0, resetAt };
  }
  return { allowed: true, remaining: limit - count, resetAt };
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return await rateLimitRedis(key, limit, windowMs, url, token);
    } catch (error) {
      // Fail open to the in-memory limiter rather than failing the request entirely — a
      // temporarily unreachable Redis shouldn't take down login/reporting.
      console.error("Upstash rate limit request failed, falling back to in-memory limiter", error);
      return rateLimitMemory(key, limit, windowMs);
    }
  }
  return rateLimitMemory(key, limit, windowMs);
}

export function clientIpFrom(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
