import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse, organizationScopeWhere } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await requireRole("ADMIN");
    const users = await prisma.user.findMany({
      where: organizationScopeWhere(session),
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        village: true,
        organizationId: true,
        createdAt: true,
        _count: { select: { caretakerOf: true, reports: true } },
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
