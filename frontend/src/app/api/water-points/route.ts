import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { waterPointQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = waterPointQuerySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    village: searchParams.get("village") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid query" } }, { status: 400 });
  }

  const { status, type, village, q, cursor, limit } = parsed.data;
  const rows = await prisma.waterPoint.findMany({
    where: {
      status: status ?? undefined,
      type: type ?? undefined,
      village: village ?? undefined,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
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

  const hasNextPage = rows.length > limit;
  const waterPoints = hasNextPage ? rows.slice(0, limit) : rows;
  const nextCursor = hasNextPage ? waterPoints[waterPoints.length - 1]?.id ?? null : null;

  return NextResponse.json(
    { waterPoints, pagination: { limit, hasNextPage, nextCursor } },
    { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
  );
}
