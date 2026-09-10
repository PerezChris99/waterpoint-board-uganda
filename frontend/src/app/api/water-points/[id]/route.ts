import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { waterPointStatusUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const waterPoint = await prisma.waterPoint.findUnique({
    where: { id },
    include: {
      caretaker: { select: { id: true, name: true } },
      verifiedBy: { select: { id: true, name: true, role: true } },
      reports: { orderBy: { createdAt: "desc" }, take: 20 },
      maintenanceLogs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { caretaker: { select: { name: true } } },
      },
    },
  });
  if (!waterPoint) {
    return NextResponse.json({ error: { message: "Water point not found" } }, { status: 404 });
  }
  return NextResponse.json({ waterPoint });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("ADMIN", "CARETAKER");
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = waterPointStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid input" } }, { status: 400 });
    }

    const waterPoint = await prisma.waterPoint.findUnique({ where: { id } });
    if (!waterPoint) {
      return NextResponse.json({ error: { message: "Water point not found" } }, { status: 404 });
    }
    if (session.role === "CARETAKER" && waterPoint.caretakerId !== session.sub) {
      return NextResponse.json(
        { error: { message: "You are not the assigned caretaker for this water point" } },
        { status: 403 },
      );
    }
    // An org-scoped admin may only update water points within their own Organization; a
    // super-admin (organizationId == null) can update anything, including unassigned demo data.
    if (
      session.role === "ADMIN" &&
      session.organizationId &&
      waterPoint.organizationId !== session.organizationId
    ) {
      return NextResponse.json(
        { error: { message: "This water point is outside your organization" } },
        { status: 403 },
      );
    }

    const updated = await prisma.waterPoint.update({
      where: { id },
      data: {
        status: parsed.data.status,
        lastVerifiedAt: new Date(),
        verifiedById: session.sub,
        verificationMethod: session.role === "ADMIN" ? "ADMIN_OVERRIDE" : "CARETAKER_UPDATE",
      },
    });
    await writeAuditLog({
      actorId: session.sub,
      action: "WATER_POINT_STATUS_UPDATED",
      entityType: "WaterPoint",
      entityId: id,
      metadata: { from: waterPoint.status, to: parsed.data.status },
    });

    return NextResponse.json({ waterPoint: updated });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
