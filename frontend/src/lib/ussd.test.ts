import { describe, expect, it } from "vitest";
import { parseUssdText, issueTypeFromDigit, USSD_ISSUE_MENU } from "./ussd";

describe("parseUssdText", () => {
  it("splits Africa's Talking's asterisk-joined input history", () => {
    expect(parseUssdText("1*WP-001*3")).toEqual(["1", "WP-001", "3"]);
  });

  it("returns an empty array for the initial empty request", () => {
    expect(parseUssdText("")).toEqual([]);
  });

  it("ignores trailing empty segments", () => {
    expect(parseUssdText("1*")).toEqual(["1"]);
  });
});

describe("issueTypeFromDigit", () => {
  it("maps digit 1 to the first menu entry", () => {
    expect(issueTypeFromDigit("1")).toBe(USSD_ISSUE_MENU[0][0]);
  });

  it("maps the last digit to the last menu entry", () => {
    const lastDigit = String(USSD_ISSUE_MENU.length);
    expect(issueTypeFromDigit(lastDigit)).toBe(USSD_ISSUE_MENU[USSD_ISSUE_MENU.length - 1][0]);
  });

  it("returns null for an out-of-range or non-numeric digit", () => {
    expect(issueTypeFromDigit("0")).toBeNull();
    expect(issueTypeFromDigit("99")).toBeNull();
    expect(issueTypeFromDigit("abc")).toBeNull();
  });
});
