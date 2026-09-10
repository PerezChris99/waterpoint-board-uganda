// One-off (but safely re-runnable) import of real Uganda water points from the Water Point Data
// Exchange (WPDx) — a free, open aggregator of field-collected water point data from Uganda's
// Ministry of Water and Environment, Water For People, The Water Trust, IRC, World Vision,
// YouthMappers, and other WASH-sector organizations (https://www.waterpointdata.org/).
//
// This REPLACES the placeholder/fictional seed water points (identified by their "WP-###" code
// prefix from prisma/seed.ts) with real, geographically accurate water point locations.
//
// Data honesty policy (see docs/DATA-METHODOLOGY.md): WPDx functionality-status values are only
// trusted when the underlying field report is recent (see RECENCY_CUTOFF_YEAR below). ~79% of
// Uganda's WPDx records come from a single 2009 government census — a 17+ year old status claim
// is not presented as current fact. Those points import with real coordinates/type but status
// NEEDS_VERIFICATION, exactly the status this schema already has for "we don't know current
// functionality" — no schema hack, no invented certainty.
//
// Usage: npm run db:import-real-water-points   (from frontend/)
import { PrismaClient, WaterPointType, WaterPointStatus } from "@prisma/client";

const prisma = new PrismaClient();

const WPDX_RESOURCE = "https://data.waterpointdata.org/resource/eqje-vguj.json";
const PAGE_SIZE = 50000;
// A field report this old is treated as historical only — its stated functionality status is
// not carried over as the water point's current status.
const RECENCY_CUTOFF_YEAR = 2016;
// WPDx water_source_clean values that aren't a fixed, visitable water point (trucked/bottled
// water) — excluded, they don't fit this platform's "point on a map you can go to" model.
const EXCLUDED_SOURCES = new Set(["Delivered Water", "Packaged Water"]);
// Loose bounding box sanity check (Uganda is roughly here) — belt-and-suspenders on top of
// WPDx's own GADM country-boundary validation.
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

async function fetchAllUgandaRecords(): Promise<WpdxRecord[]> {
  const all: WpdxRecord[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const url =
      `${WPDX_RESOURCE}?$limit=${PAGE_SIZE}&$offset=${offset}` +
      `&clean_country_name=Uganda&$order=wpdx_id`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WPDx request failed: HTTP ${res.status}`);
    const page = (await res.json()) as WpdxRecord[];
    all.push(...page);
    console.log(`  fetched ${all.length} records so far...`);
    if (page.length < PAGE_SIZE) break;
  }
  return all;
}

function mapType(sourceClean: string | undefined, techClean: string | undefined, rawTech: string | undefined): WaterPointType {
  const src = (sourceClean ?? "").toLowerCase();
  if (src.includes("borehole") || src.includes("tubewell")) return WaterPointType.BOREHOLE;
  if (src.includes("protected well")) return WaterPointType.SHALLOW_WELL;
  if (src.includes("rainwater")) return WaterPointType.RAINWATER_HARVESTING;
  if (src.includes("piped")) return WaterPointType.TAP_STAND;
  if (src.includes("protected spring")) return WaterPointType.PROTECTED_SPRING;
  if (src.includes("dam")) return WaterPointType.SHALLOW_WELL;

  const tech = (techClean ?? rawTech ?? "").toLowerCase();
  if (tech.includes("hand pump") || tech.includes("motorized")) return WaterPointType.BOREHOLE;
  if (tech.includes("tapstand") || tech.includes("kiosk") || tech.includes("tap")) return WaterPointType.TAP_STAND;
  if (tech.includes("spring")) return WaterPointType.PROTECTED_SPRING;
  if (tech.includes("rainwater")) return WaterPointType.RAINWATER_HARVESTING;
  if (tech.includes("well")) return WaterPointType.SHALLOW_WELL;
  return WaterPointType.BOREHOLE;
}

const TYPE_LABEL: Record<WaterPointType, string> = {
  BOREHOLE: "Borehole",
  SHALLOW_WELL: "Protected Well",
  PROTECTED_SPRING: "Protected Spring",
  TAP_STAND: "Tap Stand",
  RAINWATER_HARVESTING: "Rainwater Tank",
};

const STATUS_MAP: Record<string, WaterPointStatus> = {
  Functional: WaterPointStatus.AVAILABLE,
  "Functional, needs repair": WaterPointStatus.PARTIALLY_AVAILABLE,
  "Functional, not in use": WaterPointStatus.REPORTED_UNAVAILABLE,
  "Non-Functional": WaterPointStatus.REPORTED_UNAVAILABLE,
  "Non-Functional, dry season": WaterPointStatus.PARTIALLY_AVAILABLE,
  "Abandoned/Decommissioned": WaterPointStatus.REPORTED_UNAVAILABLE,
};

function mapStatus(statusClean: string | undefined, reportDate: string | undefined): WaterPointStatus {
  const year = reportDate ? new Date(reportDate).getFullYear() : NaN;
  if (!statusClean || !Number.isFinite(year) || year < RECENCY_CUTOFF_YEAR) {
    return WaterPointStatus.NEEDS_VERIFICATION;
  }
  return STATUS_MAP[statusClean] ?? WaterPointStatus.NEEDS_VERIFICATION;
}

interface ImportRow {
  code: string;
  name: string;
  type: WaterPointType;
  village: string;
  parish: string;
  subCounty: string;
  latitude: number;
  longitude: number;
  status: WaterPointStatus;
  source: string;
  description: string;
  lastVerifiedAt: Date;
  verificationMethod: "EXTERNAL_DATASET";
}

function toImportRow(r: WpdxRecord): ImportRow | null {
  if (!r.wpdx_id || !r.lat_deg || !r.lon_deg || !r.clean_adm2 || !r.clean_adm3 || !r.clean_adm4) return null;
  if (r.water_source_clean && EXCLUDED_SOURCES.has(r.water_source_clean)) return null;

  const latitude = Number.parseFloat(r.lat_deg);
  const longitude = Number.parseFloat(r.lon_deg);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (
    latitude < UGANDA_BOUNDS.minLat ||
    latitude > UGANDA_BOUNDS.maxLat ||
    longitude < UGANDA_BOUNDS.minLon ||
    longitude > UGANDA_BOUNDS.maxLon
  ) {
    return null;
  }

  const type = mapType(r.water_source_clean, r.water_tech_clean, r.water_tech);
  const status = mapStatus(r.status_clean, r.report_date);
  const reportDate = r.report_date ? new Date(r.report_date) : new Date();
  const techLabel = r.water_tech_clean ?? r.water_tech ?? "not recorded";
  const datasetLabel = r.dataset_title ?? r.source ?? "Water Point Data Exchange";

  return {
    code: r.wpdx_id,
    name: `${TYPE_LABEL[type]} - ${r.clean_adm4}`,
    type,
    // WPDx's finest administrative resolution for Uganda is parish-level (GADM boundaries don't
    // include informal village boundaries) — village duplicates parish rather than inventing a
    // finer-grained name that doesn't exist in the source data.
    village: r.clean_adm4,
    parish: r.clean_adm4,
    subCounty: r.clean_adm3,
    latitude,
    longitude,
    status,
    source: `Water Point Data Exchange (WPDx) - ${datasetLabel}`,
    description:
      `Imported from the Water Point Data Exchange (WPDx), an open water-point data aggregator. ` +
      `Technology: ${techLabel}. Original WPDx report date: ${reportDate.toISOString().slice(0, 10)}. ` +
      `District: ${r.clean_adm2}.`,
    lastVerifiedAt: reportDate,
    verificationMethod: "EXTERNAL_DATASET",
  };
}

async function main() {
  console.log("Fetching Uganda water points from WPDx...");
  const raw = await fetchAllUgandaRecords();
  console.log(`Fetched ${raw.length} raw records.`);

  const rows: ImportRow[] = [];
  const seenCodes = new Set<string>();
  let skipped = 0;
  for (const r of raw) {
    const row = toImportRow(r);
    if (!row || seenCodes.has(row.code)) {
      skipped++;
      continue;
    }
    seenCodes.add(row.code);
    rows.push(row);
  }
  console.log(`Mapped ${rows.length} valid, de-duplicated water points (${skipped} skipped).`);

  console.log("Removing placeholder/fictional seed water points (code prefix 'WP-')...");
  const removed = await prisma.waterPoint.deleteMany({ where: { code: { startsWith: "WP-" } } });
  console.log(`  removed ${removed.count} placeholder water points (and their cascaded reports/maintenance logs).`);

  const BATCH_SIZE = 1000;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const result = await prisma.waterPoint.createMany({ data: batch, skipDuplicates: true });
    inserted += result.count;
    console.log(`  inserted ${inserted}/${rows.length}...`);
  }

  console.log(`Done. Inserted ${inserted} real water points.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
