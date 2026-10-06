import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { sendNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

const RESET_TTL_MS = 30 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const ipLimit = await rateLimit(`password-reset:ip:${clientIpFrom(request)}`, 5, 15 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json({ message: "If the account exists, reset instructions have been sent." });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 320 || !email.includes("@")) {
    return NextResponse.json({ message: "If the account exists, reset instructions have been sent." });
  }

  const accountLimit = await rateLimit(`password-reset:account:${email}`, 3, 60 * 60 * 1000);
  if (!accountLimit.allowed) {
    return NextResponse.json({ message: "If the account exists, reset instructions have been sent." });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(rawToken);
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendNotification({
      to: user.email,
      subject: "WaterPoint Board password reset",
      body: `A password reset was requested for your WaterPoint Board account. Use this link within 30 minutes: ${resetUrl}\n\nIf you did not request this, ignore this message. Your current password remains unchanged.`,
    });
  }

  return NextResponse.json({ message: "If the account exists, reset instructions have been sent." });
}
