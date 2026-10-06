import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import { registerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  const limit = await rateLimit(`password-reset-confirm:${clientIpFrom(request)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json({ error: { message: "Too many attempts. Try again later." } }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const passwordCheck = registerSchema.shape.password.safeParse(password);
  if (!token || !passwordCheck.success) {
    return NextResponse.json({ error: { message: "Invalid or expired reset link." } }, { status: 400 });
  }

  const tokenHash = hashToken(token);
  const reset = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!reset || reset.usedAt || reset.expiresAt <= new Date()) {
    return NextResponse.json({ error: { message: "Invalid or expired reset link." } }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash, tokenVersion: { increment: 1 }, mfaEnabled: false, mfaSecretEncrypted: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: reset.userId, id: { not: reset.id } },
    }),
  ]);

  await writeAuditLog({
    actorId: reset.userId,
    action: "PASSWORD_RESET",
    entityType: "User",
    entityId: reset.userId,
  });

  return NextResponse.json({ message: "Password reset successfully. You can now log in." });
}
