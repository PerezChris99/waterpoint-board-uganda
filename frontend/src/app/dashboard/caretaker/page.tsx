import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";
import { CaretakerActions } from "@/components/caretaker-actions";
import { ISSUE_LABELS, REPORT_STATUS_LABELS } from "@/lib/labels";

export const revalidate = 0;

export default async function CaretakerDashboardPage() {
  const session = await getSession();
  if (!session || (session.role !== "CARETAKER" && session.role !== "ADMIN")) {
    redirect("/forbidden");
  }

  const where = session.role === "CARETAKER" ? { caretakerId: session.sub } : {};
  const waterPoints = await prisma.waterPoint.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      reports: {
        where: { status: { in: ["OPEN", "ACKNOWLEDGED", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const openReportCount = waterPoints.reduce((sum, wp) => sum + wp.reports.length, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Caretaker dashboard</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {waterPoints.length} assigned water point{waterPoints.length === 1 ? "" : "s"} ·{" "}
        {openReportCount} open report{openReportCount === 1 ? "" : "s"}
      </p>

      <ul className="mt-6 flex flex-col gap-4">
        {waterPoints.map((wp) => (
          <li key={wp.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-mono text-black/40 dark:text-white/40">{wp.code}</p>
                <h2 className="font-semibold">{wp.name}</h2>
              </div>
              <StatusBadge status={wp.status} />
            </div>

            <CaretakerActions waterPointId={wp.id} currentStatus={wp.status} />

            {wp.reports.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium">Open reports</h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {wp.reports.map((report) => (
                    <li key={report.id} className="rounded-md bg-black/5 p-3 text-sm dark:bg-white/10">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{ISSUE_LABELS[report.issueType]}</span>
                        <span className="text-xs text-black/50 dark:text-white/50">
                          {REPORT_STATUS_LABELS[report.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-black/70 dark:text-white/70">{report.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {waterPoints.length === 0 && (
        <p className="mt-8 text-black/60 dark:text-white/60">No water points assigned yet.</p>
      )}
    </div>
  );
}
