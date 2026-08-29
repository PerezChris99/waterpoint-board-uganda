import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { REPORT_STATUS_LABELS } from "@/lib/labels";

export const revalidate = 0;

export default async function AdminOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/forbidden");

  const [totalUsers, totalWaterPoints, totalReports, openReports, recentAudit] = await Promise.all([
    prisma.user.count(),
    prisma.waterPoint.count(),
    prisma.report.count(),
    prisma.report.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Admin overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Users", value: totalUsers },
          { label: "Water points", value: totalWaterPoints },
          { label: "Total reports", value: totalReports },
          { label: "Open reports", value: openReports },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-black/60 dark:text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-3 text-sm">
        <a
          href="/api/analytics/export"
          className="rounded-md border border-black/15 px-3 py-2 font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Export water points CSV
        </a>
        <Link
          href="/dashboard/admin/analytics"
          className="rounded-md bg-[var(--wb-water-500)] px-3 py-2 font-medium text-white hover:bg-[var(--wb-water-400)]"
        >
          View analytics
        </Link>
      </div>

      <h2 className="mt-10 text-lg font-semibold">Recent activity</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {recentAudit.map((entry) => (
          <li key={entry.id} className="flex justify-between rounded-md bg-black/5 px-3 py-2 dark:bg-white/10">
            <span>
              {entry.actor?.name ?? "System"} — {entry.action.replaceAll("_", " ").toLowerCase()}
            </span>
            <span className="text-black/50 dark:text-white/50">
              {entry.createdAt.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-black/40 dark:text-white/40">
        Report status legend: {Object.values(REPORT_STATUS_LABELS).join(", ")}
      </p>
    </div>
  );
}
