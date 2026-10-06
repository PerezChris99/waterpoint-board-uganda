-- Baseline migration for WaterPoint Board Uganda.
-- For an already-provisioned production database, mark this migration applied once with:
-- npx prisma migrate resolve --applied 00000000000000_initial
-- Do NOT run this migration against an existing production database before resolving the baseline.

CREATE TYPE "Role" AS ENUM ('ADMIN', 'CARETAKER', 'MEMBER');
CREATE TYPE "OrganizationType" AS ENUM ('DISTRICT_LOCAL_GOVERNMENT', 'NWSC_RURAL_UNIT', 'NGO', 'OTHER');
CREATE TYPE "WaterPointType" AS ENUM ('BOREHOLE', 'SHALLOW_WELL', 'PROTECTED_SPRING', 'TAP_STAND', 'RAINWATER_HARVESTING');
CREATE TYPE "WaterPointStatus" AS ENUM ('AVAILABLE', 'PARTIALLY_AVAILABLE', 'REPORTED_UNAVAILABLE', 'UNDER_MAINTENANCE', 'NEEDS_VERIFICATION');
CREATE TYPE "VerificationMethod" AS ENUM ('FIELD_VISIT', 'COMMUNITY_REPORT', 'DISTRICT_SURVEY', 'CARETAKER_UPDATE', 'ADMIN_OVERRIDE', 'SELF_REPORTED', 'EXTERNAL_DATASET');
CREATE TYPE "ReportIssueType" AS ENUM ('NO_WATER', 'LOW_PRESSURE', 'CONTAMINATION_CONCERN', 'PHYSICAL_DAMAGE', 'VANDALISM', 'OTHER');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED');
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "OrganizationType" NOT NULL,
  "contactEmail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'MEMBER',
  "village" TEXT,
  "phone" TEXT,
  "tokenVersion" INTEGER NOT NULL DEFAULT 0,
  "organizationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WaterPoint" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "WaterPointType" NOT NULL,
  "village" TEXT NOT NULL,
  "parish" TEXT NOT NULL,
  "subCounty" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "status" "WaterPointStatus" NOT NULL DEFAULT 'NEEDS_VERIFICATION',
  "installedYear" INTEGER,
  "source" TEXT NOT NULL,
  "description" TEXT,
  "lastVerifiedAt" TIMESTAMP(3),
  "verificationMethod" "VerificationMethod",
  "verifiedById" TEXT,
  "organizationId" TEXT,
  "caretakerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WaterPoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
  "id" TEXT NOT NULL,
  "waterPointId" TEXT NOT NULL,
  "reporterId" TEXT,
  "reporterName" TEXT,
  "issueType" "ReportIssueType" NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
  "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
  "resolutionNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MaintenanceLog" (
  "id" TEXT NOT NULL,
  "waterPointId" TEXT NOT NULL,
  "caretakerId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MaintenanceLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "WaterPoint_code_key" ON "WaterPoint"("code");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "WaterPoint_status_idx" ON "WaterPoint"("status");
CREATE INDEX "WaterPoint_village_idx" ON "WaterPoint"("village");
CREATE INDEX "WaterPoint_caretakerId_idx" ON "WaterPoint"("caretakerId");
CREATE INDEX "WaterPoint_verifiedById_idx" ON "WaterPoint"("verifiedById");
CREATE INDEX "WaterPoint_organizationId_idx" ON "WaterPoint"("organizationId");
CREATE INDEX "WaterPoint_type_idx" ON "WaterPoint"("type");
CREATE INDEX "Report_waterPointId_idx" ON "Report"("waterPointId");
CREATE INDEX "Report_status_idx" ON "Report"("status");
CREATE INDEX "Report_moderationStatus_idx" ON "Report"("moderationStatus");
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");
CREATE INDEX "MaintenanceLog_waterPointId_idx" ON "MaintenanceLog"("waterPointId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WaterPoint" ADD CONSTRAINT "WaterPoint_verifiedById_fkey"
  FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WaterPoint" ADD CONSTRAINT "WaterPoint_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "WaterPoint" ADD CONSTRAINT "WaterPoint_caretakerId_fkey"
  FOREIGN KEY ("caretakerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_waterPointId_fkey"
  FOREIGN KEY ("waterPointId") REFERENCES "WaterPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey"
  FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_waterPointId_fkey"
  FOREIGN KEY ("waterPointId") REFERENCES "WaterPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceLog" ADD CONSTRAINT "MaintenanceLog_caretakerId_fkey"
  FOREIGN KEY ("caretakerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
