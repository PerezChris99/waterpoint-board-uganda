import { describe, expect, it } from "vitest";
import { registerSchema, loginSchema, reportSchema } from "./validation";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "Grace Nakato",
      email: "Grace@Example.com",
      password: "Str0ngPassword",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a weak password", () => {
    const result = registerSchema.safeParse({
      name: "Grace Nakato",
      email: "grace@example.com",
      password: "weak",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a valid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });
});

describe("reportSchema", () => {
  it("requires a real cuid for waterPointId", () => {
    const result = reportSchema.safeParse({
      waterPointId: "not-a-cuid",
      issueType: "NO_WATER",
      description: "No water for two days now.",
    });
    expect(result.success).toBe(false);
  });
});
