ALTER TABLE "WaterPoint" ADD COLUMN "district" TEXT;
CREATE INDEX IF NOT EXISTS "WaterPoint_district_idx" ON "WaterPoint"("district");
