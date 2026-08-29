import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        village: true,
        createdAt: true,
        _count: { select: { caretakerOf: true, reports: true } },
      },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
