import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { maintenanceLogSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "CARETAKER");
    const body = await request.json().catch(() => null);
    const parsed = maintenanceLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid input" } }, { status: 400 });
    }

    const waterPoint = await prisma.waterPoint.findUnique({
      where: { id: parsed.data.waterPointId },
    });
    if (!waterPoint) {
      return NextResponse.json({ error: { message: "Water point not found" } }, { status: 404 });
    }
    if (session.role === "CARETAKER" && waterPoint.caretakerId !== session.sub) {
      return NextResponse.json(
        { error: { message: "You are not the assigned caretaker for this water point" } },
        { status: 403 },
      );
    }

    const log = await prisma.maintenanceLog.create({
      data: {
        waterPointId: parsed.data.waterPointId,
        caretakerId: session.sub,
        action: parsed.data.action,
        notes: parsed.data.notes,
      },
    });
    await writeAuditLog({
      actorId: session.sub,
      action: "MAINTENANCE_LOG_ADDED",
      entityType: "WaterPoint",
      entityId: parsed.data.waterPointId,
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
