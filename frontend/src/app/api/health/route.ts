import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Lightweight liveness/readiness probe for uptime monitors and load balancers.
// Forced dynamic: a statically-prerendered health check would freeze its result at build time,
// permanently masking real outages instead of checking the DB on every request.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
