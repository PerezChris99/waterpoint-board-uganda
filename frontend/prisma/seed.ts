/**
 * Fixed, deterministic seed data for WaterPoint Board Uganda.
 *
 * This script is idempotent: it wipes and recreates the same dataset every
 * time it runs (same seeded PRNG), so the demo always shows the same ~60
 * water points, users, reports, and maintenance history. Application code
 * never mutates the core water-point list — only Reports/MaintenanceLogs
 * grow, and only through the app's own reporting/caretaker flows.
 *
 * All data is fictional. See docs/DATA-METHODOLOGY.md.
 */
import { PrismaClient, type Role, type WaterPointType, type WaterPointStatus, type ReportIssueType, type ReportStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

// --- Deterministic PRNG (mulberry32) so the dataset is fixed across runs ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260828);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
const weightedPick = <T,>(entries: [T, number][]): T => {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * total;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return entries[entries.length - 1][0];
};
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// --- Geography: real Uganda towns/cities, jittered around each real centre ---
// Coordinates are real town/city centres so the map reflects true national coverage;
// the exact water point within each town remains fictional demo data (see docs/DATA-METHODOLOGY.md).
interface Region {
  label: string; // town/division name shown in the "village" field
  district: string; // shown in the "subCounty" field
  lat: number;
  lon: number;
  weight: number; // relative number of water points generated here
}
const REGIONS: Region[] = [
  { label: "Kampala Central", district: "Kampala District — Central Division", lat: 0.3136, lon: 32.5811, weight: 10 },
  { label: "Kawempe", district: "Kampala District — Kawempe Division", lat: 0.36, lon: 32.57, weight: 9 },
  { label: "Nakawa", district: "Kampala District — Nakawa Division", lat: 0.335, lon: 32.61, weight: 9 },
  { label: "Makindye", district: "Kampala District — Makindye Division", lat: 0.285, lon: 32.6, weight: 8 },
  { label: "Rubaga", district: "Kampala District — Rubaga Division", lat: 0.3, lon: 32.55, weight: 8 },
  { label: "Wakiso", district: "Wakiso District", lat: 0.4044, lon: 32.4593, weight: 9 },
  { label: "Entebbe", district: "Wakiso District — Entebbe Municipality", lat: 0.0512, lon: 32.4637, weight: 6 },
  { label: "Mukono", district: "Mukono District", lat: 0.3533, lon: 32.7554, weight: 7 },
  { label: "Jinja", district: "Jinja District", lat: 0.4479, lon: 33.2026, weight: 8 },
  { label: "Iganga", district: "Iganga District", lat: 0.6072, lon: 33.4686, weight: 5 },
  { label: "Mbale", district: "Mbale District", lat: 1.0827, lon: 34.175, weight: 6 },
  { label: "Tororo", district: "Tororo District", lat: 0.6928, lon: 34.1808, weight: 5 },
  { label: "Soroti", district: "Soroti District", lat: 1.7146, lon: 33.6113, weight: 5 },
  { label: "Lira", district: "Lira District", lat: 2.235, lon: 32.9096, weight: 6 },
  { label: "Gulu", district: "Gulu District", lat: 2.7746, lon: 32.299, weight: 6 },
  { label: "Kitgum", district: "Kitgum District", lat: 3.2833, lon: 32.8833, weight: 4 },
  { label: "Arua", district: "Arua District", lat: 3.0306, lon: 30.9111, weight: 5 },
  { label: "Hoima", district: "Hoima District", lat: 1.4356, lon: 31.3517, weight: 5 },
  { label: "Fort Portal", district: "Kabarole District — Fort Portal", lat: 0.671, lon: 30.2748, weight: 5 },
  { label: "Kasese", district: "Kasese District", lat: 0.1833, lon: 30.0833, weight: 5 },
  { label: "Mbarara", district: "Mbarara District", lat: -0.6072, lon: 30.6545, weight: 7 },
  { label: "Kabale", district: "Kabale District", lat: -1.2486, lon: 29.9884, weight: 5 },
  { label: "Masaka", district: "Masaka District", lat: -0.3369, lon: 31.7343, weight: 6 },
  { label: "Moroto", district: "Moroto District", lat: 2.5333, lon: 34.6667, weight: 4 },
];
const PARISH_SUFFIXES = ["Central", "North", "South", "East", "West"];
const VILLAGE_SUFFIXES = ["Trading Centre", "Landing Site", "Estate", "Hill", "Ward", "Farms"];
const ALL_VILLAGES = REGIONS.flatMap((r) => VILLAGE_SUFFIXES.map((s) => `${r.label} ${s}`));
// Real-world coordinate jitter per point, roughly +/-3km, so points cluster near — but don't all
// stack on — each town's true centre.
const JITTER_DEG = 0.03;
const SOURCES = [
  "Ministry of Water and Environment",
  "District Local Government",
  "World Vision Uganda (fictional demo record)",
  "UNICEF WASH Programme (fictional demo record)",
  "Water For People (fictional demo record)",
  "Community Self-Help Fund",
  "Local Water User Committee",
];


const TYPE_WEIGHTS: [WaterPointType, number][] = [
  ["BOREHOLE", 40],
  ["SHALLOW_WELL", 20],
  ["PROTECTED_SPRING", 20],
  ["TAP_STAND", 15],
  ["RAINWATER_HARVESTING", 5],
];
const STATUS_WEIGHTS: [WaterPointStatus, number][] = [
  ["AVAILABLE", 55],
  ["PARTIALLY_AVAILABLE", 15],
  ["NEEDS_VERIFICATION", 15],
  ["UNDER_MAINTENANCE", 10],
  ["REPORTED_UNAVAILABLE", 5],
];
const ISSUE_WEIGHTS: [ReportIssueType, number][] = [
  ["NO_WATER", 25],
  ["LOW_PRESSURE", 20],
  ["PHYSICAL_DAMAGE", 20],
  ["CONTAMINATION_CONCERN", 15],
  ["VANDALISM", 10],
  ["OTHER", 10],
];
const ISSUE_DESCRIPTIONS: Record<ReportIssueType, string[]> = {
  NO_WATER: [
    "No water has flowed from this point for the last two days.",
    "Pump handle moves freely but nothing comes out.",
    "Community members report the point ran dry this week.",
  ],
  LOW_PRESSURE: [
    "Water flow is much weaker than usual, takes twice as long to fill a jerrycan.",
    "Pressure has been dropping gradually over the past few weeks.",
  ],
  CONTAMINATION_CONCERN: [
    "Water looks cloudy after the recent heavy rains.",
    "Slight odour noticed this morning, requesting verification before use.",
    "Reported unusual colour near the outlet.",
  ],
  PHYSICAL_DAMAGE: [
    "Concrete apron around the point has cracked.",
    "Pump handle is loose and difficult to operate.",
    "Drainage channel is blocked and causing pooling.",
  ],
  VANDALISM: [
    "Padlock on the cover has been broken.",
    "Someone removed the handle overnight; suspected tampering.",
  ],
  OTHER: [
    "Requesting a general inspection, nothing urgent observed.",
    "Queue times have become very long during morning hours.",
  ],
};
const MAINTENANCE_ACTIONS = [
  "Routine inspection",
  "Replaced worn pump seal",
  "Cleared drainage channel",
  "Tightened loose handle bolts",
  "Chlorination and water quality check",
  "Repaired cracked apron",
  "Replaced padlock after vandalism report",
  "Full pump overhaul",
];

const FIRST_NAMES = [
  "Grace", "Moses", "Sarah", "Peter", "Immaculate", "David", "Florence", "Joseph",
  "Betty", "Robert", "Josephine", "Samuel", "Agnes", "Emmanuel", "Judith", "Charles",
  "Harriet", "Patrick", "Ruth", "Vincent",
];
const LAST_NAMES = [
  "Nakato", "Okello", "Namubiru", "Ssemwogerere", "Achieng", "Kato", "Nabirye",
  "Mugisha", "Auma", "Byaruhanga", "Namusoke", "Wamala", "Kirabo", "Tumusiime",
];

function fullName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

async function main() {
  console.log("Resetting seed data...");
  await prisma.auditLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.waterPoint.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const adminPassword = await hashPassword("Admin#2026Secure");
  await prisma.user.create({
    data: {
      name: "Grace Nakato",
      email: "admin@waterpointboard.example",
      passwordHash: adminPassword,
      role: "ADMIN" as Role,
      village: "Kampala Central Estate",
    },
  });

  const caretakerPassword = await hashPassword("Caretaker#2026");
  const caretakers = [];
  for (let i = 0; i < 8; i++) {
    caretakers.push(
      await prisma.user.create({
        data: {
          name: fullName(),
          email: `caretaker${i + 1}@waterpointboard.example`,
          passwordHash: caretakerPassword,
          role: "CARETAKER" as Role,
          village: pick(ALL_VILLAGES),
        },
      }),
    );
  }

  const memberPassword = await hashPassword("Member#2026");
  const members = [];
  for (let i = 0; i < 15; i++) {
    members.push(
      await prisma.user.create({
        data: {
          name: fullName(),
          email: `member${i + 1}@waterpointboard.example`,
          passwordHash: memberPassword,
          role: "MEMBER" as Role,
          village: pick(ALL_VILLAGES),
        },
      }),
    );
  }
  console.log(`Created ${1 + caretakers.length + members.length} users.`);

  // --- Water points (vast, realistic, spread across real Uganda towns and cities) ---
  const waterPoints = [];
  let seq = 0;
  for (const region of REGIONS) {
    for (let j = 0; j < region.weight; j++) {
      const village = `${region.label} ${pick(VILLAGE_SUFFIXES)}`;
      const parish = `${region.label} ${pick(PARISH_SUFFIXES)}`;
      const type = weightedPick(TYPE_WEIGHTS);
      const status = weightedPick(STATUS_WEIGHTS);
      const caretaker = pick(caretakers);
      const code = `WP-${String(++seq).padStart(3, "0")}`;
      const installedYear = randInt(1998, 2023);
      const lastVerifiedDays = randInt(0, 120);

      const wp = await prisma.waterPoint.create({
        data: {
          code,
          name: `${village} ${typeLabel(type)} ${j + 1}`,
          type,
          village,
          parish,
          subCounty: region.district,
          latitude: region.lat + (rng() - 0.5) * JITTER_DEG,
          longitude: region.lon + (rng() - 0.5) * JITTER_DEG,
          status,
          installedYear,
          source: pick(SOURCES),
          description: `${typeLabel(type)} serving ${village} and nearby households.`,
          lastVerifiedAt: status === "NEEDS_VERIFICATION" ? null : daysAgo(lastVerifiedDays),
          caretakerId: caretaker.id,
        },
      });
      waterPoints.push(wp);
    }
  }
  console.log(`Created ${waterPoints.length} water points.`);

  // --- Reports (community submitted, realistic spread over ~2 years) ---
  let reportCount = 0;
  for (const wp of waterPoints) {
    const numReports = randInt(0, 5);
    for (let r = 0; r < numReports; r++) {
      const issueType = weightedPick(ISSUE_WEIGHTS);
      const status = weightedPick<ReportStatus>([
        ["RESOLVED", 45],
        ["OPEN", 20],
        ["ACKNOWLEDGED", 15],
        ["IN_PROGRESS", 15],
        ["DISMISSED", 5],
      ]);
      const anonymous = rng() < 0.3;
      const reporter = anonymous ? null : pick(members);
      await prisma.report.create({
        data: {
          waterPointId: wp.id,
          reporterId: reporter?.id ?? null,
          reporterName: anonymous ? pick(["Concerned neighbour", "Local resident", null]) : null,
          issueType,
          description: pick(ISSUE_DESCRIPTIONS[issueType]),
          status,
          resolutionNotes:
            status === "RESOLVED" ? "Caretaker inspected and resolved the issue." : null,
          createdAt: daysAgo(randInt(1, 730)),
        },
      });
      reportCount++;
    }
  }
  console.log(`Created ${reportCount} reports.`);

  // --- Maintenance logs (caretaker activity history) ---
  let logCount = 0;
  for (const wp of waterPoints) {
    const numLogs = randInt(0, 4);
    for (let l = 0; l < numLogs; l++) {
      await prisma.maintenanceLog.create({
        data: {
          waterPointId: wp.id,
          caretakerId: wp.caretakerId!,
          action: pick(MAINTENANCE_ACTIONS),
          notes: rng() < 0.5 ? "No further issues observed after service." : null,
          createdAt: daysAgo(randInt(1, 600)),
        },
      });
      logCount++;
    }
  }
  console.log(`Created ${logCount} maintenance logs.`);

  console.log("Seed complete.");
  console.log("Demo accounts: admin@waterpointboard.example / Admin#2026Secure");
  console.log("               caretaker1@waterpointboard.example / Caretaker#2026");
  console.log("               member1@waterpointboard.example / Member#2026");
}

function typeLabel(type: WaterPointType): string {
  switch (type) {
    case "BOREHOLE":
      return "Borehole";
    case "SHALLOW_WELL":
      return "Shallow Well";
    case "PROTECTED_SPRING":
      return "Protected Spring";
    case "TAP_STAND":
      return "Tap Stand";
    case "RAINWATER_HARVESTING":
      return "Rainwater Tank";
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
