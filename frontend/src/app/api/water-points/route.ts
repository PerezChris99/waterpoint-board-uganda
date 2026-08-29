import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { waterPointQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = waterPointQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    village: searchParams.get("village") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid query" } }, { status: 400 });
  }
  const { status, type, village, q } = parsed.data;

  const waterPoints = await prisma.waterPoint.findMany({
    where: {
      status: status ?? undefined,
      type: type ?? undefined,
      village: village ?? undefined,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      type: true,
      status: true,
      village: true,
      parish: true,
      latitude: true,
      longitude: true,
      lastVerifiedAt: true,
      _count: { select: { reports: true } },
    },
  });

  return NextResponse.json({ waterPoints });
}
