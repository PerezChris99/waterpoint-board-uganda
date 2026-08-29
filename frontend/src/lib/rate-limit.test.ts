import { describe, expect, it } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests under the limit and blocks over it", () => {
    const key = `test-${Date.now()}`;
    const results = Array.from({ length: 4 }, () => rateLimit(key, 3, 60_000));
    expect(results.slice(0, 3).every((r) => r.allowed)).toBe(true);
    expect(results[3].allowed).toBe(false);
  });
});
