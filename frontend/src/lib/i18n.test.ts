import { describe, expect, it } from "vitest";
import { reportFormString, ISSUE_LABELS_LG, LOCALES, LOCALE_LABELS } from "./i18n";

describe("reportFormString", () => {
  it("returns the English string for the en locale", () => {
    expect(reportFormString("submit", "en")).toBe("Submit report");
  });

  it("returns the Luganda string for the lg locale", () => {
    expect(reportFormString("submit", "lg")).toBe("Sindika ripoota");
  });
});

describe("locale metadata", () => {
  it("declares exactly the two supported locales", () => {
    expect(LOCALES).toEqual(["en", "lg"]);
  });

  it("has a display label for every locale", () => {
    for (const locale of LOCALES) {
      expect(LOCALE_LABELS[locale]).toBeTruthy();
    }
  });
});

describe("ISSUE_LABELS_LG", () => {
  it("has a Luganda translation for every issue type used by ISSUE_LABELS", () => {
    const issueTypes = ["NO_WATER", "LOW_PRESSURE", "CONTAMINATION_CONCERN", "PHYSICAL_DAMAGE", "VANDALISM", "OTHER"];
    for (const issueType of issueTypes) {
      expect(ISSUE_LABELS_LG[issueType]).toBeTruthy();
    }
  });
});
