import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { reportStatusUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("ADMIN", "CARETAKER");
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = reportStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid input" } }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: { waterPoint: true },
    });
    if (!report) {
      return NextResponse.json({ error: { message: "Report not found" } }, { status: 404 });
    }
    if (session.role === "CARETAKER" && report.waterPoint.caretakerId !== session.sub) {
      return NextResponse.json(
        { error: { message: "You are not the assigned caretaker for this water point" } },
        { status: 403 },
      );
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { status: parsed.data.status, resolutionNotes: parsed.data.resolutionNotes },
    });
    await writeAuditLog({
      actorId: session.sub,
      action: "REPORT_STATUS_UPDATED",
      entityType: "Report",
      entityId: id,
      metadata: { from: report.status, to: parsed.data.status },
    });

    return NextResponse.json({ report: updated });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
