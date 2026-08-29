import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { ISSUE_LABELS, REPORT_STATUS_LABELS } from "@/lib/labels";

export const revalidate = 0;

const STATUS_TONE_CLASSES: Record<string, string> = {
  OPEN: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  ACKNOWLEDGED: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  IN_PROGRESS: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
  RESOLVED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  DISMISSED: "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300",
};

export default async function MemberDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const reports = await prisma.report.findMany({
    where: { reporterId: session.sub },
    orderBy: { createdAt: "desc" },
    include: { waterPoint: { select: { id: true, name: true, code: true, village: true } } },
  });

  const openCount = reports.filter((r) => r.status === "OPEN" || r.status === "ACKNOWLEDGED" || r.status === "IN_PROGRESS").length;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Welcome, {session.name}</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {reports.length} report{reports.length === 1 ? "" : "s"} submitted · {openCount} still open
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/water-points"
          className="rounded-md bg-[var(--wb-water-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--wb-water-400)]"
        >
          Browse water points
        </Link>
        <Link
          href="/map"
          className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          View live map
        </Link>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Your reports</h2>
      {reports.length === 0 ? (
        <p className="mt-3 text-black/60 dark:text-white/60">
          You haven&apos;t submitted any reports yet. Visit a water point&apos;s page to flag an
          issue.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {reports.map((report) => (
            <li key={report.id} className="rounded-lg border border-black/10 p-4 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link
                    href={`/water-points/${report.waterPoint.id}`}
                    className="font-semibold hover:text-[var(--wb-water-500)]"
                  >
                    {report.waterPoint.name}
                  </Link>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    {report.waterPoint.code} · {report.waterPoint.village}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE_CLASSES[report.status]}`}
                >
                  {REPORT_STATUS_LABELS[report.status]}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">{ISSUE_LABELS[report.issueType]}</p>
              <p className="mt-1 text-sm text-black/70 dark:text-white/70">{report.description}</p>
              {report.resolutionNotes && (
                <p className="mt-2 rounded-md bg-black/5 p-2 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">
                  Caretaker note: {report.resolutionNotes}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
