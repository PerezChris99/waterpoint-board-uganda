import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { TYPE_LABELS, STATUS_LABELS, ISSUE_LABELS } from "@/lib/labels";
import { StatusPieChart, DonutChart, IssueBarChart, TrendLineChart } from "@/components/charts";
import { MapLoader } from "@/components/map-loader";
import type { WaterPointType, WaterPointStatus, ReportIssueType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Map & Insights",
  description: "Live map of real Uganda water points plus dynamic statistics on status, type, and reports.",
};

export const revalidate = 0;

// The dataset (~98,700 real, WPDx-imported water points) is too large to fetch and sort in full
// on every page load without a multi-second, multi-MB response. The map instead shows a random,
// nationwide-representative sample of this size — clustering (see WaterPointsMap) keeps it
// readable, and the full dataset remains browsable/searchable at /water-points.
const MAP_SAMPLE_SIZE = 15000;

interface MapSampleRow {
  id: string;
  name: string;
  code: string;
  village: string;
  status: WaterPointStatus;
  latitude: number;
  longitude: number;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default async function MapInsightsPage() {
  const [waterPoints, totalWaterPoints, statusGroups, typeGroups, issueGroups, reports, villageGroups] =
    await Promise.all([
      prisma.$queryRaw<MapSampleRow[]>`
        SELECT id, name, code, village, status, latitude, longitude
        FROM "WaterPoint"
        ORDER BY random()
        LIMIT ${MAP_SAMPLE_SIZE};
      `,
      prisma.waterPoint.count(),
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

  const statusData = statusGroups.map((g) => ({
    name: STATUS_LABELS[g.status as WaterPointStatus],
    value: g._count,
  }));
  const typeData = typeGroups.map((g) => ({
    name: TYPE_LABELS[g.type as WaterPointType],
    value: g._count,
  }));
  const issueData = issueGroups.map((g) => ({
    name: ISSUE_LABELS[g.issueType as ReportIssueType],
    value: g._count,
  }));
  const villageData = villageGroups
    .map((g) => ({ name: g.village, value: g._count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-medium tracking-wide text-[var(--wb-water-500)] uppercase">Live data</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Map &amp; Insights</h1>
        <p className="mt-2 text-sm text-black/60 dark:text-white/60">
          {waterPoints.length < totalWaterPoints
            ? `A live, nationwide-random sample of ${waterPoints.length.toLocaleString()} of the
               ${totalWaterPoints.toLocaleString()} real water points we track — statistics below
               cover all of them. Browse or search the full list at`
            : "Every tracked water point plotted below, with statistics computed live from the same database. Browse or search the full list at"}{" "}
          <Link href="/water-points" className="underline">
            /water-points
          </Link>
          .
        </p>
      </div>

      <div className="mt-8">
        <MapLoader waterPoints={waterPoints} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
        {[
          { label: "Water points", value: totalWaterPoints },
          { label: "Villages", value: villageGroups.length },
          { label: "Community reports", value: reports.length },
          { label: "Water point types", value: typeGroups.length },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-black/10 bg-[var(--wb-surface-100)] p-4 dark:border-white/10 dark:bg-[var(--wb-surface-800)]"
          >
            <p className="text-2xl font-semibold text-[var(--wb-water-500)]">{stat.value}</p>
            <p className="mt-1 text-xs text-black/60 dark:text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold">Live statistics</h2>
      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Status breakdown">
          <StatusPieChart data={statusData} />
        </ChartCard>
        <ChartCard title="Water point types">
          <DonutChart data={typeData} />
        </ChartCard>
        <ChartCard title="Report issue types">
          <IssueBarChart data={issueData} />
        </ChartCard>
        <ChartCard title="Reports over time (last 12 months)">
          <TrendLineChart data={monthlyReports} />
        </ChartCard>
      </div>

      <h2 className="mt-12 text-xl font-semibold">Top villages by water point count</h2>
      <div className="mt-6 rounded-lg border border-black/10 p-4 dark:border-white/10">
        <IssueBarChart data={villageData} />
      </div>
    </main>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-black/10 p-4 dark:border-white/10">
      <h3 className="shrink-0 text-sm font-semibold text-black/70 dark:text-white/70">{title}</h3>
      <div className="mt-2 min-w-0 flex-1">{children}</div>
    </div>
  );
}
