import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/status-badge";
import { TYPE_LABELS } from "@/lib/labels";
import type { WaterPointStatus, WaterPointType } from "@prisma/client";

export const metadata: Metadata = {
  title: "Water Points",
  description: "Browse every tracked water point, filter by status, type, and village.",
};

export const revalidate = 0;

const PAGE_SIZE = 3;

interface SearchParams {
  status?: string;
  type?: string;
  village?: string;
  q?: string;
  page?: string;
}

export default async function WaterPointsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = params.status as WaterPointStatus | undefined;
  const type = params.type as WaterPointType | undefined;
  const village = params.village;
  const q = params.q;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const where = {
    status: status || undefined,
    type: type || undefined,
    village: village || undefined,
    name: q ? { contains: q, mode: "insensitive" as const } : undefined,
  };

  const [waterPoints, villages, total] = await Promise.all([
    prisma.waterPoint.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        status: true,
        village: true,
        lastVerifiedAt: true,
        _count: { select: { reports: true } },
      },
    }),
    prisma.waterPoint.findMany({ distinct: ["village"], select: { village: true }, orderBy: { village: "asc" } }),
    prisma.waterPoint.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  function pageHref(targetPage: number): string {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (type) sp.set("type", type);
    if (village) sp.set("village", village);
    sp.set("page", String(targetPage));
    return `/water-points?${sp.toString()}`;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-semibold">Water Points</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {total} water point{total === 1 ? "" : "s"} match your filters.
        </p>
      </div>

      <form className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name"
          aria-label="Search water points by name"
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Filter by status"
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        >
          <option value="">All statuses</option>
          <option value="AVAILABLE">Reported available</option>
          <option value="PARTIALLY_AVAILABLE">Partially available</option>
          <option value="REPORTED_UNAVAILABLE">Reported unavailable</option>
          <option value="UNDER_MAINTENANCE">Under maintenance</option>
          <option value="NEEDS_VERIFICATION">Needs verification</option>
        </select>
        <select
          name="type"
          defaultValue={type ?? ""}
          aria-label="Filter by type"
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="village"
          defaultValue={village ?? ""}
          aria-label="Filter by village"
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        >
          <option value="">All villages</option>
          {villages.map((v) => (
            <option key={v.village} value={v.village}>
              {v.village}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-[var(--wb-water-500)] px-4 py-2 font-medium text-white hover:bg-[var(--wb-water-400)]"
        >
          Apply filters
        </button>
      </form>

      <ul className="mx-auto mt-8 grid max-w-3xl gap-4">
        {waterPoints.map((wp) => (
          <li key={wp.id}>
            <Link
              href={`/water-points/${wp.id}`}
              className="flex flex-col gap-3 rounded-lg border border-black/10 p-5 transition-shadow hover:shadow-md dark:border-white/10 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-xs font-mono text-black/40 dark:text-white/40">{wp.code}</p>
                <h2 className="mt-1 font-semibold">{wp.name}</h2>
                <p className="mt-0.5 text-sm text-black/60 dark:text-white/60">
                  {TYPE_LABELS[wp.type]} · {wp.village}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <StatusBadge status={wp.status} />
                <p className="text-xs text-black/50 dark:text-white/50">
                  {wp._count.reports} report{wp._count.reports === 1 ? "" : "s"}
                  {wp.lastVerifiedAt
                    ? ` · verified ${wp.lastVerifiedAt.toLocaleDateString()}`
                    : " · not yet verified"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {waterPoints.length === 0 && (
        <p className="mt-10 text-center text-black/60 dark:text-white/60">
          No water points match those filters.
        </p>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2 text-sm">
          <Link
            href={pageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={`rounded-md border border-black/15 px-3 py-1.5 dark:border-white/20 ${
              currentPage === 1 ? "pointer-events-none opacity-40" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            ← Prev
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 ${
                p === currentPage
                  ? "bg-[var(--wb-water-500)] font-medium text-white"
                  : "border border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              }`}
            >
              {p}
            </Link>
          ))}
          <Link
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={`rounded-md border border-black/15 px-3 py-1.5 dark:border-white/20 ${
              currentPage === totalPages ? "pointer-events-none opacity-40" : "hover:bg-black/5 dark:hover:bg-white/10"
            }`}
          >
            Next →
          </Link>
        </nav>
      )}
    </main>
  );
}
