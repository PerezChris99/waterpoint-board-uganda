import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Lightweight liveness/readiness probe for uptime monitors and load balancers.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", time: new Date().toISOString() });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}
