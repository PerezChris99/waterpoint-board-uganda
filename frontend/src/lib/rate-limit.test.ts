import { describe, expect, it, vi, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("allows requests under the limit and blocks over it (in-memory backend)", async () => {
    const key = `test-${Date.now()}`;
    const results = await Promise.all(Array.from({ length: 4 }, () => rateLimit(key, 3, 60_000)));
    expect(results.slice(0, 3).every((r) => r.allowed)).toBe(true);
    expect(results[3].allowed).toBe(false);
  });

  it("uses the Upstash Redis backend when configured, and blocks once over the limit", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ result: 4 }, { result: 30_000 }],
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await rateLimit("upstash-test", 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.upstash.io/pipeline",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("falls back to the in-memory backend if Upstash is unreachable", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    const result = await rateLimit(`fallback-test-${Date.now()}`, 3, 60_000);
    expect(result.allowed).toBe(true);
  });
});
