import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";
import { TYPE_LABELS, ISSUE_LABELS, REPORT_STATUS_LABELS } from "@/lib/labels";
import { ReportForm } from "@/components/report-form";

export const revalidate = 0;

async function getWaterPoint(id: string) {
  return prisma.waterPoint.findUnique({
    where: { id },
    include: {
      caretaker: { select: { name: true } },
      reports: { orderBy: { createdAt: "desc" }, take: 10 },
      maintenanceLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { caretaker: { select: { name: true } } },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const waterPoint = await getWaterPoint(id);
  if (!waterPoint) return { title: "Water point not found" };
  return {
    title: waterPoint.name,
    description: `${TYPE_LABELS[waterPoint.type]} in ${waterPoint.village}, ${waterPoint.subCounty}.`,
  };
}

export default async function WaterPointDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const waterPoint = await getWaterPoint(id);
  if (!waterPoint) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-xs font-mono text-black/40 dark:text-white/40">{waterPoint.code}</p>
      <h1 className="mt-1 text-2xl font-semibold">{waterPoint.name}</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {TYPE_LABELS[waterPoint.type]} · {waterPoint.village}, {waterPoint.parish}, {waterPoint.subCounty}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <StatusBadge status={waterPoint.status} />
        <span className="text-xs text-black/50 dark:text-white/50">
          {waterPoint.lastVerifiedAt
            ? `Last verified ${waterPoint.lastVerifiedAt.toLocaleDateString()}`
            : "Not yet verified"}
        </span>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-black/10 p-4 text-sm sm:grid-cols-3 dark:border-white/10">
        <div>
          <dt className="text-black/50 dark:text-white/50">Source</dt>
          <dd className="mt-0.5 font-medium">{waterPoint.source}</dd>
        </div>
        <div>
          <dt className="text-black/50 dark:text-white/50">Installed</dt>
          <dd className="mt-0.5 font-medium">{waterPoint.installedYear ?? "Unknown"}</dd>
        </div>
        <div>
          <dt className="text-black/50 dark:text-white/50">Caretaker</dt>
          <dd className="mt-0.5 font-medium">{waterPoint.caretaker?.name ?? "Unassigned"}</dd>
        </div>
      </dl>

      {waterPoint.description && (
        <p className="mt-4 text-sm text-black/70 dark:text-white/70">{waterPoint.description}</p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Report an issue</h2>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Seen a problem here? Let the caretaker know.
        </p>
        <div className="mt-4">
          <ReportForm waterPointId={waterPoint.id} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Recent reports</h2>
        {waterPoint.reports.length === 0 ? (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">No reports yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {waterPoint.reports.map((report) => (
              <li key={report.id} className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{ISSUE_LABELS[report.issueType]}</span>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {REPORT_STATUS_LABELS[report.status]}
                  </span>
                </div>
                <p className="mt-1 text-black/70 dark:text-white/70">{report.description}</p>
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">
                  {report.createdAt.toLocaleDateString()}
                  {report.reporterName ? ` · ${report.reporterName}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Maintenance history</h2>
        {waterPoint.maintenanceLogs.length === 0 ? (
          <p className="mt-2 text-sm text-black/60 dark:text-white/60">No maintenance logged yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {waterPoint.maintenanceLogs.map((log) => (
              <li key={log.id} className="rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-xs text-black/50 dark:text-white/50">
                    {log.createdAt.toLocaleDateString()}
                  </span>
                </div>
                {log.notes && <p className="mt-1 text-black/70 dark:text-white/70">{log.notes}</p>}
                <p className="mt-1 text-xs text-black/40 dark:text-white/40">by {log.caretaker.name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
