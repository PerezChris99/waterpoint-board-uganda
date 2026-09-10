import { describe, expect, it } from "vitest";
import { isEscalated, ESCALATION_THRESHOLD_DAYS } from "./escalation";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

describe("isEscalated", () => {
  it("escalates an OPEN report older than the threshold", () => {
    expect(isEscalated({ status: "OPEN", createdAt: daysAgo(ESCALATION_THRESHOLD_DAYS + 1) })).toBe(true);
  });

  it("escalates an ACKNOWLEDGED report older than the threshold", () => {
    expect(
      isEscalated({ status: "ACKNOWLEDGED", createdAt: daysAgo(ESCALATION_THRESHOLD_DAYS + 1) }),
    ).toBe(true);
  });

  it("does not escalate a recent OPEN report", () => {
    expect(isEscalated({ status: "OPEN", createdAt: daysAgo(1) })).toBe(false);
  });

  it("never escalates RESOLVED, DISMISSED, or IN_PROGRESS reports regardless of age", () => {
    const oldDate = daysAgo(ESCALATION_THRESHOLD_DAYS + 30);
    expect(isEscalated({ status: "RESOLVED", createdAt: oldDate })).toBe(false);
    expect(isEscalated({ status: "DISMISSED", createdAt: oldDate })).toBe(false);
    expect(isEscalated({ status: "IN_PROGRESS", createdAt: oldDate })).toBe(false);
  });
});
