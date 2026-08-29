import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes a password and verifies the correct password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toEqual("Sup3rSecret!");
    await expect(verifyPassword("Sup3rSecret!", hash)).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
