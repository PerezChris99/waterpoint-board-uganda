/**
 * Production-safe reference data seed for WaterPoint Board Uganda.
 *
 * IMPORTANT DATA POLICY:
 * - No invented water points, coordinates, names, organisations, users, reports, phone numbers,
 *   emails, maintenance events, or operational statuses are created here.
 * - Water-point records come from the Water Point Data Exchange (WPDx), using its Uganda records
 *   and original coordinates/administrative fields.
 * - Old functionality observations are deliberately converted to NEEDS_VERIFICATION rather than
 *   presented as current facts.
 * - Users are only created when the operator supplies a real account identity through environment
 *   variables. No fake demo credentials exist in source code.
 *
 * WPDx is an open aggregator of field-collected water-point data. For official national
 * operational use, this dataset must be reconciled with the Ministry of Water and Environment
 * / WEMIS / WASMIS records and the responsible District Water Officers.
 *
 * Run from frontend:
 *   npm run db:seed
 *
 * Required:
 *   DATABASE_URL
 *   SEED_ADMIN_EMAIL
 *   SEED_ADMIN_PASSWORD
 *
 * Optional:
 *   SEED_ADMIN_NAME
 *   SEED_RESET_WATER_POINTS=true   # destructive: replaces water-point rows only
 */

import { PrismaClient, WaterPointStatus, WaterPointType } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const WPDX_RESOURCE = "https://data.waterpointdata.org/resource/eqje-vguj.json";
const PAGE_SIZE = 50000;
const RECENCY_CUTOFF_YEAR = 2016;
const EXCLUDED_SOURCES = new Set(["Delivered Water", "Packaged Water"]);
const UGANDA_BOUNDS = { minLat: -1.6, maxLat: 4.3, minLon: 29.4, maxLon: 35.2 };

interface WpdxRecord {
  wpdx_id?: string;
  lat_deg?: string;
  lon_deg?: string;
  clean_adm2?: string;
  clean_adm3?: string;
  clean_adm4?: string;
  water_source_clean?: string;
  water_tech_clean?: string;
  water_tech?: string;
  status_clean?: string;
  report_date?: string;
  source?: string;
  dataset_title?: string;
}

const STATUS_MAP: Record<string, WaterPointStatus> = {
  Functional: WaterPointStatus.AVAILABLE,
  "Functional, needs repair": WaterPointStatus.PARTIALLY_AVAILABLE,
  "Functional, not in use": WaterPointStatus.REPORTED_UNAVAILABLE,
  "Non-Functional": WaterPointStatus.REPORTED_UNAVAILABLE,
  "Non-Functional, dry season": WaterPointStatus.PARTIALLY_AVAILABLE,
  "Abandoned/Decommissioned": WaterPointStatus.REPORTED_UNAVAILABLE,
};

async function fetchAllUgandaRecords(): Promise<WpdxRecord[]> {
  const all: WpdxRecord[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url =
      `${WPDX_RESOURCE}?$limit=${PAGE_SIZE}&$offset=${offset}` +
      `&clean_country_name=Uganda&$order=wpdx_id`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`WPDx request failed: HTTP ${response.status}`);
    }

    const page = (await response.json()) as WpdxRecord[];
    all.push(...page);
    console.log(`  fetched ${all.length} records...`);

    if (page.length < PAGE_SIZE) break;
  }

  return all;
}

function mapType(
  sourceClean: string | undefined,
  techClean: string | undefined,
  rawTech: string | undefined,
): WaterPointType {
  const source = (sourceClean ?? "").toLowerCase();

  if (source.includes("borehole") || source.includes("tubewell")) return WaterPointType.BOREHOLE;
  if (source.includes("protected well")) return WaterPointType.SHALLOW_WELL;
  if (source.includes("rainwater")) return WaterPointType.RAINWATER_HARVESTING;
  if (source.includes("piped")) return WaterPointType.TAP_STAND;
  if (source.includes("protected spring")) return WaterPointType.PROTECTED_SPRING;
  if (source.includes("dam")) return WaterPointType.SHALLOW_WELL;

  const technology = (techClean ?? rawTech ?? "").toLowerCase();
  if (technology.includes("hand pump") || technology.includes("motorized")) {
    return WaterPointType.BOREHOLE;
  }
  if (
    technology.includes("tapstand") ||
    technology.includes("kiosk") ||
    technology.includes("tap")
  ) {
    return WaterPointType.TAP_STAND;
  }
  if (technology.includes("spring")) return WaterPointType.PROTECTED_SPRING;
  if (technology.includes("rainwater")) return WaterPointType.RAINWATER_HARVESTING;
  if (technology.includes("well")) return WaterPointType.SHALLOW_WELL;

  return WaterPointType.BOREHOLE;
}

function typeLabel(type: WaterPointType): string {
  switch (type) {
    case WaterPointType.BOREHOLE:
      return "Borehole";
    case WaterPointType.SHALLOW_WELL:
      return "Protected Well";
    case WaterPointType.PROTECTED_SPRING:
      return "Protected Spring";
    case WaterPointType.TAP_STAND:
      return "Tap Stand";
    case WaterPointType.RAINWATER_HARVESTING:
      return "Rainwater Tank";
  }
}

function mapStatus(statusClean: string | undefined, reportDate: string | undefined) {
  const year = reportDate ? new Date(reportDate).getFullYear() : NaN;

  if (!statusClean || !Number.isFinite(year) || year < RECENCY_CUTOFF_YEAR) {
    return WaterPointStatus.NEEDS_VERIFICATION;
  }

  return STATUS_MAP[statusClean] ?? WaterPointStatus.NEEDS_VERIFICATION;
}

function toWaterPoint(r: WpdxRecord) {
  if (
    !r.wpdx_id ||
    !r.lat_deg ||
    !r.lon_deg ||
    !r.clean_adm2 ||
    !r.clean_adm3 ||
    !r.clean_adm4
  ) {
    return null;
  }

  if (r.water_source_clean && EXCLUDED_SOURCES.has(r.water_source_clean)) return null;

  const latitude = Number.parseFloat(r.lat_deg);
  const longitude = Number.parseFloat(r.lon_deg);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < UGANDA_BOUNDS.minLat ||
    latitude > UGANDA_BOUNDS.maxLat ||
    longitude < UGANDA_BOUNDS.minLon ||
    longitude > UGANDA_BOUNDS.maxLon
  ) {
    return null;
  }

  const type = mapType(r.water_source_clean, r.water_tech_clean, r.water_tech);
  const reportDate = r.report_date ? new Date(r.report_date) : null;

  return {
    code: r.wpdx_id,
    name: `${typeLabel(type)} - ${r.clean_adm4}`,
    type,
    district: r.clean_adm2,
    village: r.clean_adm4,
    parish: r.clean_adm4,
    subCounty: r.clean_adm3,
    latitude,
    longitude,
    status: mapStatus(r.status_clean, r.report_date),
    source: `Water Point Data Exchange (WPDx) - ${r.dataset_title ?? r.source ?? "source record"}`,
    description:
      `Imported from WPDx. Technology: ${r.water_tech_clean ?? r.water_tech ?? "not recorded"}. ` +
      `Original report date: ${reportDate ? reportDate.toISOString().slice(0, 10) : "not recorded"}.`,
    lastVerifiedAt: reportDate,
    verificationMethod: "EXTERNAL_DATASET" as const,
  };
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required. " +
        "No fabricated demo account is created by the seed.",
    );
  }

  if (password.length < 16) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 16 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await hashPassword(password);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name: process.env.SEED_ADMIN_NAME?.trim() || existing.name,
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`Updated real operator account: ${email}`);
    return;
  }

  await prisma.user.create({
    data: {
      name: process.env.SEED_ADMIN_NAME?.trim() || email.split("@")[0],
      email,
      passwordHash,
      role: "ADMIN",
      village: null,
    },
  });

  console.log(`Created real operator account supplied by environment: ${email}`);
}

async function seedWaterPoints() {
  console.log("Fetching Uganda records from WPDx...");
  const raw = await fetchAllUgandaRecords();

  const rows = [];
  const seenCodes = new Set<string>();

  for (const record of raw) {
    const row = toWaterPoint(record);

    if (!row || seenCodes.has(row.code)) continue;

    seenCodes.add(row.code);
    rows.push(row);
  }

  if (rows.length === 0) {
    throw new Error("WPDx returned no valid Uganda water-point records; refusing to seed.");
  }

  console.log(`Validated ${rows.length} real WPDx water-point records.`);

  if (process.env.SEED_RESET_WATER_POINTS === "true") {
    await prisma.waterPoint.deleteMany();
    console.log("Existing water-point records removed because SEED_RESET_WATER_POINTS=true.");
  }

  let inserted = 0;

  for (let i = 0; i < rows.length; i += 1000) {
    const batch = rows.slice(i, i + 1000);
    const result = await prisma.waterPoint.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
    console.log(`  inserted ${inserted}/${rows.length} new records...`);
  }

  console.log(`Real water-point seed complete: ${inserted} new records.`);
}

async function main() {
  console.log("Starting production-safe real-data seed...");
  await seedAdmin();
  await seedWaterPoints();

  console.log(
    "No fictional organisations, users, water points, reports, maintenance logs, phone numbers, " +
      "coordinates, or operational events were created.",
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
