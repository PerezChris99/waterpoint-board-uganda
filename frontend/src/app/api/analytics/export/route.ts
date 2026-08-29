import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values
    .map((v) => {
      let s = v === null || v === undefined ? "" : String(v);
      // Neutralize spreadsheet formula injection: a cell starting with =, +, -, or @ is
      // interpreted as a formula by Excel/Sheets when the CSV is opened. Prefixing with a
      // single quote forces it to be treated as plain text.
      if (/^[=+\-@]/.test(s)) {
        s = `'${s}`;
      }
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

export async function GET() {
  try {
    await requireRole("ADMIN");

    const waterPoints = await prisma.waterPoint.findMany({
      include: { caretaker: { select: { name: true } }, _count: { select: { reports: true } } },
      orderBy: { code: "asc" },
    });

    const header = toCsvRow([
      "code",
      "name",
      "type",
      "village",
      "parish",
      "status",
      "installedYear",
      "caretaker",
      "reportCount",
      "lastVerifiedAt",
    ]);
    const rows = waterPoints.map((wp) =>
      toCsvRow([
        wp.code,
        wp.name,
        wp.type,
        wp.village,
        wp.parish,
        wp.status,
        wp.installedYear,
        wp.caretaker?.name,
        wp._count.reports,
        wp.lastVerifiedAt?.toISOString(),
      ]),
    );

    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="water-points-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
