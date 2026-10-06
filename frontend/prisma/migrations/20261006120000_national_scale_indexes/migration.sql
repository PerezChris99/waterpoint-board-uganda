-- Search and operational indexes for national-scale read patterns.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "WaterPoint_name_trgm_idx"
  ON "WaterPoint" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "WaterPoint_village_name_id_idx"
  ON "WaterPoint" ("village", "name", "id");

CREATE INDEX IF NOT EXISTS "WaterPoint_status_type_name_id_idx"
  ON "WaterPoint" ("status", "type", "name", "id");

CREATE INDEX IF NOT EXISTS "Report_waterPoint_status_createdAt_idx"
  ON "Report" ("waterPointId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "MaintenanceLog_caretaker_createdAt_idx"
  ON "MaintenanceLog" ("caretakerId", "createdAt");

CREATE INDEX IF NOT EXISTS "AuditLog_actor_createdAt_idx"
  ON "AuditLog" ("actorId", "createdAt");
