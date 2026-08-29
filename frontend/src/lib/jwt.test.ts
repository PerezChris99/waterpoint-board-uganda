// @vitest-environment node
import { describe, expect, it, beforeAll } from "vitest";
import { signSessionToken, verifySessionToken } from "./jwt";

beforeAll(() => {
  process.env.JWT_SECRET = "a".repeat(32);
});

describe("session JWT", () => {
  it("signs and verifies a round trip", async () => {
    const token = await signSessionToken({
      sub: "user_1",
      email: "test@example.com",
      name: "Test User",
      role: "MEMBER",
      tokenVersion: 0,
    });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({
      sub: "user_1",
      email: "test@example.com",
      name: "Test User",
      role: "MEMBER",
      tokenVersion: 0,
    });
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({
      sub: "user_1",
      email: "test@example.com",
      name: "Test User",
      role: "MEMBER",
      tokenVersion: 0,
    });
    const tampered = token.slice(0, -2) + "xx";
    await expect(verifySessionToken(tampered)).resolves.toBeNull();
  });
});
