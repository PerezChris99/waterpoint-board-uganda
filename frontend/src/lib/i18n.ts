// Minimal client-side localization for the public reporting flow (Phase 24). Deliberately not a
// full i18n framework: this project has no existing i18n library, and the roadmap specifically
// scopes localization to the public reporting flow rather than the whole site. A small dictionary
// + React Context is enough — no new dependency, no routing/middleware changes, no server-side
// locale negotiation.
//
// The Luganda text below is a good-faith starting translation for demonstration purposes and has
// NOT been reviewed by a native speaker — flag this to a native Luganda speaker for review before
// relying on it in a real deployment (see docs/DATA-METHODOLOGY.md).

export type Locale = "en" | "lg";

export const LOCALES: Locale[] = ["en", "lg"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  lg: "Luganda",
};

export const REPORT_FORM_STRINGS = {
  issueTypeLabel: { en: "Issue type", lg: "Ekizibu" },
  descriptionLabel: { en: "Describe what you observed", lg: "Nyonyola ky'olabye" },
  nameLabel: { en: "Your name", lg: "Erinnya lyo" },
  nameOptional: { en: "(optional)", lg: "(si kya lwatu)" },
  submit: { en: "Submit report", lg: "Sindika ripoota" },
  submitting: { en: "Submitting…", lg: "Kisindikibwa…" },
  successMessage: {
    en: "Thank you — your report has been submitted and will be reviewed by the assigned caretaker.",
    lg: "Weebale — ripoota yo etuuse era ejja kukebenkanibwa omulabirizi.",
  },
  genericError: {
    en: "Something went wrong. Please try again.",
    lg: "Wabaddewo ekizibu. Ddamu ogezeeko.",
  },
  networkError: {
    en: "Network error. Please try again.",
    lg: "Ekizibu kya network. Ddamu ogezeeko.",
  },
} as const;

export type ReportFormStringKey = keyof typeof REPORT_FORM_STRINGS;

export function reportFormString(key: ReportFormStringKey, locale: Locale): string {
  return REPORT_FORM_STRINGS[key][locale];
}

// Luganda equivalents of ISSUE_LABELS (src/lib/labels.ts) — kept separate from the shared
// English-only labels map used elsewhere (dashboards, CSV export, audit logs) since those remain
// English-only for this phase.
export const ISSUE_LABELS_LG: Record<string, string> = {
  NO_WATER: "Tewali mazzi",
  LOW_PRESSURE: "Amazzi gakulukuta mpola",
  CONTAMINATION_CONCERN: "Okutya ku bulongoofu bw'amazzi",
  PHYSICAL_DAMAGE: "Ekyonoono ku bikozesebwa",
  VANDALISM: "Okwonoona kw'obugenderevu",
  OTHER: "Ekirala",
};
