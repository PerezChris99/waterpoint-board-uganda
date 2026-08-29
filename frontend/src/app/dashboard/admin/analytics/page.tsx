import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/verified-session";
import { prisma } from "@/lib/db";
import { STATUS_LABELS, ISSUE_LABELS } from "@/lib/labels";
import { StatusPieChart, IssueBarChart } from "@/components/charts";
import type { WaterPointStatus, ReportIssueType } from "@prisma/client";

export const revalidate = 0;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function AdminAnalyticsPage() {
  const session = await getVerifiedSession();
  if (!session || session.role !== "ADMIN") redirect("/forbidden");

  const [statusGroups, issueGroups, villageGroups, reportsLast30Days] = await Promise.all([
    prisma.waterPoint.groupBy({ by: ["status"], _count: true }),
    prisma.report.groupBy({ by: ["issueType"], _count: true }),
    prisma.waterPoint.groupBy({ by: ["village"], _count: true }),
    prisma.report.count({
      where: { createdAt: { gte: daysAgo(30) } },
    }),
  ]);

  const statusData = statusGroups.map((g) => ({
    name: STATUS_LABELS[g.status as WaterPointStatus],
    value: g._count,
  }));
  const issueData = issueGroups.map((g) => ({
    name: ISSUE_LABELS[g.issueType as ReportIssueType],
    value: g._count,
  }));
  const villageData = villageGroups
    .map((g) => ({ name: g.village, value: g._count }))
    .sort((a, b) => b.value - a.value);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {reportsLast30Days} report{reportsLast30Days === 1 ? "" : "s"} in the last 30 days.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <h2 className="font-semibold">Water points by status</h2>
          <StatusPieChart data={statusData} />
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
          <h2 className="font-semibold">Reports by issue type</h2>
          <IssueBarChart data={issueData} />
        </div>
        <div className="rounded-lg border border-black/10 p-4 dark:border-white/10 lg:col-span-2">
          <h2 className="font-semibold">Water points by village</h2>
          <IssueBarChart data={villageData} />
        </div>
      </div>
    </div>
  );
}
