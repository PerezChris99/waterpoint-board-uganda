import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse, organizationScopeWhere } from "@/lib/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values
    .map((v) => {
      let s = v === null || v === undefined ? "" : String(v);
      if (/^[=+\-@]/.test(s)) s = `'${s}`;
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(",");
}

export const dynamic = "force-dynamic";
export const maxDuration = 300

export async function GET() {
  try {
    const session = await requireRole("ADMIN");
    const limit = await rateLimit(`analytics-export:${session.sub}`, 2, 60 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json({ error: { message: "Export limit reached. Try again later." } }, { status: 429 });
    }

    await writeAuditLog({ actorId: session.sub, action: "WATER_POINT_EXPORT", entityType: "WaterPoint" });

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let cursor: string | undefined;
        let first = true;
        try {
          while (true) {
            const rows = await prisma.waterPoint.findMany({
              where: organizationScopeWhere(session),
              ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
              take: 1000,
              orderBy: [{ code: "asc" }, { id: "asc" }],
              include: {
                caretaker: { select: { name: true } },
                verifiedBy: { select: { name: true } },
                _count: { select: { reports: true } },
              },
            });

            if (first) {
              controller.enqueue(
                encoder.encode(
                  toCsvRow([
                    "code", "name", "type", "village", "parish", "status", "installedYear",
                    "caretaker", "reportCount", "lastVerifiedAt", "verificationMethod", "verifiedBy",
                  ]) + "\n",
                ),
              );
              first = false;
            }

            if (rows.length === 0) break;

            const text = rows
              .map((wp) =>
                toCsvRow([
                  wp.code, wp.name, wp.type, wp.village, wp.parish, wp.status, wp.installedYear,
                  wp.caretaker?.name, wp._count.reports, wp.lastVerifiedAt?.toISOString(),
                  wp.verificationMethod, wp.verifiedBy?.name,
                ]),
              )
              .join("\n") + "\n";
            controller.enqueue(encoder.encode(text));
            cursor = rows[rows.length - 1]?.id;
            if (rows.length < 1000) break;
          }
          controller.close();
        } catch (error) {
          console.error("Streaming analytics export failed", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="water-points-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
