const WINDOW_SECONDS = 60;
const DEFAULT_LIMIT = 60;
const AUTH_LIMIT = 10;

type LimitResult = { allowed: boolean; remaining: number; retryAfter: number };
const localBuckets = new Map<string, { count: number; resetAt: number }>();

function configured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

async function command(path: string) {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) throw new Error("Rate-limit store is not configured");

  const response = await fetch(`${base.replace(/\/$/, "")}/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Rate-limit store returned HTTP ${response.status}`);
  return response.json() as Promise<{ result: number }>;
}

function localRateLimit(key: string, limit: number, windowMs: number): LimitResult {
  const now = Date.now();
  const current = localBuckets.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + windowMs };
    localBuckets.set(key, next);
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfter: 0 };
  }
  current.count += 1;
  const allowed = current.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - current.count),
    retryAfter: allowed ? 0 : Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

/**
 * Compatibility API used by route handlers that rate-limit arbitrary identities
 * (for example IP addresses and account emails). Production is fail-closed when
 * the shared Redis store is missing or unavailable; local memory is only used in
 * development/test so a broken production deployment cannot silently disable limits.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<LimitResult> {
  const safeLimit = Math.max(1, Math.floor(limit));
  const safeWindowMs = Math.max(1000, Math.floor(windowMs));

  if (!configured()) {
    if (process.env.NODE_ENV !== "production") {
      return localRateLimit(key, safeLimit, safeWindowMs);
    }
    return {
      allowed: process.env.RATE_LIMIT_FAIL_CLOSED === "false",
      remaining: process.env.RATE_LIMIT_FAIL_CLOSED === "false" ? safeLimit : 0,
      retryAfter: process.env.RATE_LIMIT_FAIL_CLOSED === "false" ? 0 : Math.ceil(safeWindowMs / 1000),
    };
  }

  const now = Date.now();
  const bucket = Math.floor(now / safeWindowMs);
  const resetAt = (bucket + 1) * safeWindowMs;
  const ttlSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
  const redisKey = `wpb:rl:${key}:${bucket}`;

  try {
    const increment = await command(`incr/${encodeURIComponent(redisKey)}`);
    const count = Number(increment.result);
    if (!Number.isFinite(count) || count < 1) throw new Error("Invalid rate-limit counter response");
    if (count === 1) await command(`expire/${encodeURIComponent(redisKey)}/${ttlSeconds}`);
    const allowed = count <= safeLimit;
    return {
      allowed,
      remaining: Math.max(0, safeLimit - count),
      retryAfter: allowed ? 0 : ttlSeconds,
    };
  } catch (error) {
    console.error("Rate-limit store unavailable", error);
    if (process.env.NODE_ENV !== "production" || process.env.RATE_LIMIT_FAIL_CLOSED === "false") {
      return localRateLimit(key, safeLimit, safeWindowMs);
    }
    return { allowed: false, remaining: 0, retryAfter: Math.ceil(safeWindowMs / 1000) };
  }
}

export function clientIpFrom(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const firstForwarded = forwarded?.split(",")[0]?.trim();
  return firstForwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function checkRateLimit(
  request: Request,
  scope: string,
  limit = DEFAULT_LIMIT,
): Promise<LimitResult> {
  const result = await rateLimit(`${scope}:${clientIpFrom(request)}`, limit, WINDOW_SECONDS * 1000);
  return result;
}

export const RATE_LIMITS = {
  api: DEFAULT_LIMIT,
  auth: AUTH_LIMIT,
} as const;
