import { afterEach, describe, expect, it, vi } from "vitest";
import { clientIpFrom, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("allows requests under the limit and blocks over it (in-memory backend)", async () => {
    const key = `test-${Date.now()}`;
    const results = await Promise.all(Array.from({ length: 4 }, () => rateLimit(key, 3, 60_000)));
    expect(results.filter((result) => result.allowed)).toHaveLength(3);
    expect(results.filter((result) => !result.allowed)).toHaveLength(1);
  });

  it("uses the Upstash Redis backend when configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 4 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await rateLimit("upstash-test", 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/example\.upstash\.io\/incr\//),
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
  });

  it("fails closed in production when Upstash is unreachable", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RATE_LIMIT_FAIL_CLOSED", "true");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await rateLimit(`unavailable-${Date.now()}`, 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("extracts the first forwarded IP, with a real-IP fallback", () => {
    expect(clientIpFrom(new Request("https://example.test", {
      headers: { "x-forwarded-for": "203.0.113.4, 10.0.0.1" },
    }))).toBe("203.0.113.4");
    expect(clientIpFrom(new Request("https://example.test", {
      headers: { "x-real-ip": "203.0.113.8" },
    }))).toBe("203.0.113.8");
  });
});
