import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse, organizationScopeWhere } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireRole("ADMIN", "CARETAKER");
    const scope = organizationScopeWhere(session);

    const [statusCounts, issueCounts, reportStatusCounts, totalWaterPoints, totalReports, recentReports] =
      await Promise.all([
        prisma.waterPoint.groupBy({ by: ["status"], _count: true, where: scope }),
        prisma.report.groupBy({ by: ["issueType"], _count: true, where: { waterPoint: scope } }),
        prisma.report.groupBy({ by: ["status"], _count: true, where: { waterPoint: scope } }),
        prisma.waterPoint.count({ where: scope }),
        prisma.report.count({ where: { waterPoint: scope } }),
        prisma.report.count({
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            waterPoint: scope,
          },
        }),
      ]);

    const villageStats = await prisma.waterPoint.groupBy({
      by: ["village"],
      _count: true,
      where: scope,
    });

    return NextResponse.json({
      totalWaterPoints,
      totalReports,
      reportsLast30Days: recentReports,
      statusCounts,
      issueCounts,
      reportStatusCounts,
      villageStats,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
