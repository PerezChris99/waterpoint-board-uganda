import type { WaterPointStatus, WaterPointType, ReportIssueType, ReportStatus, Role } from "@prisma/client";

export const STATUS_LABELS: Record<WaterPointStatus, string> = {
  AVAILABLE: "Reported available",
  PARTIALLY_AVAILABLE: "Partially available",
  REPORTED_UNAVAILABLE: "Reported unavailable",
  UNDER_MAINTENANCE: "Under maintenance",
  NEEDS_VERIFICATION: "Needs verification",
};

export const STATUS_TONE: Record<WaterPointStatus, "good" | "warn" | "bad" | "info"> = {
  AVAILABLE: "good",
  PARTIALLY_AVAILABLE: "warn",
  REPORTED_UNAVAILABLE: "bad",
  UNDER_MAINTENANCE: "warn",
  NEEDS_VERIFICATION: "info",
};

export const TYPE_LABELS: Record<WaterPointType, string> = {
  BOREHOLE: "Borehole",
  SHALLOW_WELL: "Shallow Well",
  PROTECTED_SPRING: "Protected Spring",
  TAP_STAND: "Tap Stand",
  RAINWATER_HARVESTING: "Rainwater Tank",
};

export const ISSUE_LABELS: Record<ReportIssueType, string> = {
  NO_WATER: "No water",
  LOW_PRESSURE: "Low pressure",
  CONTAMINATION_CONCERN: "Contamination concern",
  PHYSICAL_DAMAGE: "Physical damage",
  VANDALISM: "Vandalism",
  OTHER: "Other",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Open",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  CARETAKER: "Caretaker",
  MEMBER: "Community member",
};
