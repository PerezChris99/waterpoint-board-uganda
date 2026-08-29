import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("ADMIN", "CARETAKER");

    const [statusCounts, issueCounts, reportStatusCounts, totalWaterPoints, totalReports, recentReports] =
      await Promise.all([
        prisma.waterPoint.groupBy({ by: ["status"], _count: true }),
        prisma.report.groupBy({ by: ["issueType"], _count: true }),
        prisma.report.groupBy({ by: ["status"], _count: true }),
        prisma.waterPoint.count(),
        prisma.report.count(),
        prisma.report.count({
          where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        }),
      ]);

    const villageStats = await prisma.waterPoint.groupBy({
      by: ["village"],
      _count: true,
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
