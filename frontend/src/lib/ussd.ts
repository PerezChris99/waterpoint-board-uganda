import type { ReportIssueType } from "@prisma/client";

// Pure, DB-independent USSD menu-building helpers for the Africa's Talking USSD webhook
// (see src/app/api/ussd/route.ts). Kept separate and pure so the menu/parsing logic can be unit
// tested without a database or HTTP mocking.

/** Africa's Talking resends the full input history joined by "*" on every request, e.g.
 * "1*WP-001*3" for a user who chose menu option 1, entered "WP-001", then chose option 3. */
export function parseUssdText(text: string): string[] {
  return text.split("*").filter((segment) => segment.length > 0);
}

// Ordered so the digit typed by the USSD user (1-6) maps directly to array index + 1.
export const USSD_ISSUE_MENU: [ReportIssueType, string][] = [
  ["NO_WATER", "No water"],
  ["LOW_PRESSURE", "Low pressure"],
  ["CONTAMINATION_CONCERN", "Contamination concern"],
  ["PHYSICAL_DAMAGE", "Physical damage"],
  ["VANDALISM", "Vandalism"],
  ["OTHER", "Other"],
];

export function issueTypeFromDigit(digit: string): ReportIssueType | null {
  const index = Number.parseInt(digit, 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= USSD_ISSUE_MENU.length) return null;
  return USSD_ISSUE_MENU[index][0];
}

export function buildMainMenu(): string {
  return "CON Welcome to WaterPoint Board Uganda\n1. Report an issue\n2. Check water point status";
}

export function buildAskForCode(): string {
  return "CON Enter the water point code (e.g. WP-001):";
}

export function buildIssueMenu(waterPointName: string): string {
  const options = USSD_ISSUE_MENU.map(([, label], i) => `${i + 1}. ${label}`).join("\n");
  return `CON ${waterPointName}\n${options}`;
}

export function buildNotFound(): string {
  return "END Water point not found. Please check the code and try again.";
}

export function buildReportConfirmation(): string {
  return "END Thank you. Your report has been submitted for review by the caretaker.";
}

export function buildInvalidSelection(): string {
  return "END Invalid selection. Please dial in again and try again.";
}

export function buildStatusResponse(waterPointName: string, statusLabel: string, verifiedText: string): string {
  return `END ${waterPointName}\nStatus: ${statusLabel}\n${verifiedText}`;
}
