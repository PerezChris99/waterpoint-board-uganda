ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "integrityHash" TEXT;
CREATE INDEX IF NOT EXISTS "AuditLog_integrityHash_idx" ON "AuditLog"("integrityHash");
