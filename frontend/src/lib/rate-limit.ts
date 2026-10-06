const WINDOW_SECONDS = 60;
const DEFAULT_LIMIT = 60;
const AUTH_LIMIT = 10;

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

export async function checkRateLimit(
  request: Request,
  scope: string,
  limit = DEFAULT_LIMIT,
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  if (process.env.NODE_ENV !== "production" && !process.env.RATE_LIMIT_FAIL_CLOSED) {
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }

  if (!configured()) {
    if (process.env.RATE_LIMIT_FAIL_CLOSED === "false") {
      return { allowed: true, remaining: limit, retryAfter: 0 };
    }
    return { allowed: false, remaining: 0, retryAfter: WINDOW_SECONDS };
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const bucket = Math.floor(Date.now() / 1000 / WINDOW_SECONDS);
  const key = `wpb:rl:${scope}:${ip}:${bucket}`;

  try {
    const increment = await command(`incr/${encodeURIComponent(key)}`);
    if (increment.result === 1) await command(`expire/${encodeURIComponent(key)}/${WINDOW_SECONDS}`);

    const count = Number(increment.result);
    const allowed = count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      retryAfter: allowed ? 0 : WINDOW_SECONDS - (Math.floor(Date.now() / 1000) % WINDOW_SECONDS),
    };
  } catch (error) {
    console.error("Rate-limit store unavailable", error);
    const failClosed = process.env.RATE_LIMIT_FAIL_CLOSED !== "false";
    return {
      allowed: !failClosed,
      remaining: failClosed ? 0 : limit,
      retryAfter: failClosed ? WINDOW_SECONDS : 0,
    };
  }
}

export const RATE_LIMITS = {
  api: DEFAULT_LIMIT,
  auth: AUTH_LIMIT,
} as const;
