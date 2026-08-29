import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { TYPE_LABELS, STATUS_LABELS, ISSUE_LABELS } from "@/lib/labels";
import type { WaterPointType, WaterPointStatus, ReportIssueType } from "@prisma/client";

// Public, unauthenticated aggregate data for the map + statistics page.
// No PII (reporter identity, emails, caretaker names) is ever included here.
export const revalidate = 60;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const [waterPoints, statusGroups, typeGroups, issueGroups, reports, villageGroups] = await Promise.all([
    prisma.waterPoint.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        type: true,
        status: true,
        village: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.waterPoint.groupBy({ by: ["status"], _count: true }),
    prisma.waterPoint.groupBy({ by: ["type"], _count: true }),
    prisma.report.groupBy({ by: ["issueType"], _count: true }),
    prisma.report.findMany({ select: { createdAt: true } }),
    prisma.waterPoint.groupBy({ by: ["village"], _count: true }),
  ]);

  const monthly = new Map<string, number>();
  for (const report of reports) {
    const key = monthKey(report.createdAt);
    monthly.set(key, (monthly.get(key) ?? 0) + 1);
  }
  const monthlyReports = Array.from(monthly.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-12)
    .map(([month, value]) => ({ month, value }));

  return NextResponse.json({
    waterPoints,
    statusCounts: statusGroups.map((g) => ({
      name: STATUS_LABELS[g.status as WaterPointStatus],
      value: g._count,
    })),
    typeCounts: typeGroups.map((g) => ({
      name: TYPE_LABELS[g.type as WaterPointType],
      value: g._count,
    })),
    issueCounts: issueGroups.map((g) => ({
      name: ISSUE_LABELS[g.issueType as ReportIssueType],
      value: g._count,
    })),
    monthlyReports,
    villageCounts: villageGroups
      .map((g) => ({ name: g.village, value: g._count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10),
    totals: {
      waterPoints: waterPoints.length,
      reports: reports.length,
      villages: villageGroups.length,
    },
  });
}
