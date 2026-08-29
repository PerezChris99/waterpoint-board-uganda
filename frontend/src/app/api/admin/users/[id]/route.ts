import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { userRoleUpdateSchema } from "@/lib/validation";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole("ADMIN");
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = userRoleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: { message: "Invalid input" } }, { status: 400 });
    }
    if (id === session.sub) {
      return NextResponse.json(
        { error: { message: "You cannot change your own role" } },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    }

    // Bump tokenVersion so any session this user already has open is invalidated immediately —
    // otherwise their previously-issued JWT would keep its old role claim until it expires.
    const user = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role, tokenVersion: { increment: 1 } },
    });
    await writeAuditLog({
      actorId: session.sub,
      action: "USER_ROLE_UPDATED",
      entityType: "User",
      entityId: id,
      metadata: { role: parsed.data.role },
    });

    return NextResponse.json({ user: { id: user.id, role: user.role } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
