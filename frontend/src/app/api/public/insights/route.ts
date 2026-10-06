import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TYPE_LABELS, STATUS_LABELS, ISSUE_LABELS } from "@/lib/labels";
import type { WaterPointType, WaterPointStatus, ReportIssueType } from "@prisma/client";

export const dynamic = "force-dynamic";
const MAP_SAMPLE_SIZE = 15000;

export async function GET() {
  const [waterPoints, totalWaterPoints, statusGroups, typeGroups, issueGroups, totalReports, monthlyRows, villageGroups] =
    await Promise.all([
      prisma.$queryRaw<{ id: string; name: string; code: string; type: WaterPointType; status: WaterPointStatus; village: string; latitude: number; longitude: number }>`
        SELECT id, name, code, type, status, village, latitude, longitude
        FROM "WaterPoint" TABLESAMPLE SYSTEM (15)
        LIMIT ${MAP_SAMPLE_SIZE};
      `,
      prisma.waterPoint.count(),
      prisma.waterPoint.groupBy({ by: ["status"], _count: true }),
      prisma.waterPoint.groupBy({ by: ["type"], _count: true }),
      prisma.report.groupBy({ by: ["issueType"], _count: true, where: { moderationStatus: "APPROVED" } }),
      prisma.report.count({ where: { moderationStatus: "APPROVED" } }),
      prisma.$queryRaw<{ month: Date; value: bigint }>`
        SELECT date_trunc('month', "createdAt") AS month, COUNT(*)::bigint AS value
        FROM "Report"
        WHERE "moderationStatus" = 'APPROVED' AND "createdAt" >= NOW() - INTERVAL '12 months'
        GROUP BY 1 ORDER BY 1 ASC;
      `,
      prisma.waterPoint.groupBy({ by: ["village"], _count: true }),
    ]);

  const monthlyReports = monthlyRows.map((row) => ({ month: row.month.toISOString().slice(0, 7), value: Number(row.value) })).slice(-12);

  return NextResponse.json({
    waterPoints,
    statusCounts: statusGroups.map((g) => ({ name: STATUS_LABELS[g.status as WaterPointStatus], value: g._count })),
    typeCounts: typeGroups.map((g) => ({ name: TYPE_LABELS[g.type as WaterPointType], value: g._count })),
    issueCounts: issueGroups.map((g) => ({ name: ISSUE_LABELS[g.issueType as ReportIssueType], value: g._count })),
    monthlyReports,
    villageCounts: villageGroups.map((g) => ({ name: g.village, value: g._count })).sort((a, b) => b.value - a.value).slice(0, 10),
    totals: { waterPoints: totalWaterPoints, reports: totalReports, villages: villageGroups.length },
  }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
