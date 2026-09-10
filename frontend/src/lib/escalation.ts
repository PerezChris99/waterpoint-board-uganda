// Reports that have sat unresolved past a threshold are surfaced as "escalated" so caretakers/
// admins can prioritize them. This is computed on read (no stored flag/state, no cron/DB write
// required) — see docs/DEVELOPMENT_PLAN.md Phase 22 and the cron-triggered digest in
// src/app/api/cron/escalations/route.ts for a scheduled notification variant of the same logic.

export const ESCALATION_THRESHOLD_DAYS = 14;

export interface EscalationCandidate {
  status: string;
  createdAt: Date;
}

/** A report is "escalated" once it has sat OPEN or ACKNOWLEDGED (i.e. nobody has actively started
 * work on it) for longer than ESCALATION_THRESHOLD_DAYS. RESOLVED/DISMISSED/IN_PROGRESS reports
 * are never escalated — the first because they're done, the second because someone is on it. */
export function isEscalated(report: EscalationCandidate): boolean {
  if (report.status !== "OPEN" && report.status !== "ACKNOWLEDGED") return false;
  const ageMs = Date.now() - report.createdAt.getTime();
  return ageMs > ESCALATION_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}
