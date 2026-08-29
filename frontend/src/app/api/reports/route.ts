import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { reportSchema, reportStatusUpdateSchema } from "@/lib/validation";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { requireRole, apiErrorResponse } from "@/lib/rbac";

export async function GET(request: Request) {
  try {
    const session = await requireRole("ADMIN", "CARETAKER");
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status");
    const status = rawStatus
      ? reportStatusUpdateSchema.shape.status.safeParse(rawStatus).data
      : undefined;
    const waterPointId = searchParams.get("waterPointId") ?? undefined;

    const reports = await prisma.report.findMany({
      where: {
        status,
        waterPointId,
        waterPoint:
          session.role === "CARETAKER" ? { caretakerId: session.sub } : undefined,
      },
      include: { waterPoint: { select: { id: true, name: true, village: true, caretakerId: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ reports });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const limit = rateLimit(`report:${clientIpFrom(request)}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: { message: "Too many reports submitted. Try again later." } },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid input", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 },
    );
  }

  const waterPoint = await prisma.waterPoint.findUnique({ where: { id: parsed.data.waterPointId } });
  if (!waterPoint) {
    return NextResponse.json({ error: { message: "Water point not found" } }, { status: 404 });
  }

  const session = await getSession();
  const report = await prisma.report.create({
    data: {
      waterPointId: parsed.data.waterPointId,
      issueType: parsed.data.issueType,
      description: parsed.data.description,
      reporterId: session?.sub,
      reporterName: session ? undefined : (parsed.data.reporterName ?? "Anonymous"),
    },
  });

  await writeAuditLog({
    actorId: session?.sub,
    action: "REPORT_SUBMITTED",
    entityType: "Report",
    entityId: report.id,
  });

  return NextResponse.json({ report }, { status: 201 });
}
