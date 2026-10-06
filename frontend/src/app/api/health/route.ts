import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = performance.now();
  const production = process.env.NODE_ENV === "production";
  const missingProductionControls = production
    ? [
        !process.env.DATABASE_URL ? "DATABASE_URL" : null,
        !process.env.JWT_SECRET ? "JWT_SECRET" : null,
        !process.env.AUDIT_HMAC_SECRET ? "AUDIT_HMAC_SECRET" : null,
        !process.env.MFA_ENCRYPTION_KEY ? "MFA_ENCRYPTION_KEY" : null,
        !process.env.UPSTASH_REDIS_REST_URL ? "UPSTASH_REDIS_REST_URL" : null,
        !process.env.UPSTASH_REDIS_REST_TOKEN ? "UPSTASH_REDIS_REST_TOKEN" : null,
        !process.env.CRON_SECRET ? "CRON_SECRET" : null,
        !process.env.RESEND_API_KEY ? "RESEND_API_KEY" : null,
        !process.env.NOTIFICATIONS_FROM_EMAIL ? "NOTIFICATIONS_FROM_EMAIL" : null,
      ].filter((value): value is string => value !== null)
    : [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    const databaseLatencyMs = Math.round((performance.now() - started) * 100) / 100;
    const ready = missingProductionControls.length === 0;
    if (!ready) console.warn("Production controls incomplete", { missing: missingProductionControls });

    return NextResponse.json(
      {
        status: ready ? "ok" : "degraded",
        version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
        database: { status: "ok", latencyMs: databaseLatencyMs },
        productionControls: ready ? "configured" : "incomplete",

        time: new Date().toISOString(),
      },
      { status: ready ? 200 : 503, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        version: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
        database: { status: "error" },
        time: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
