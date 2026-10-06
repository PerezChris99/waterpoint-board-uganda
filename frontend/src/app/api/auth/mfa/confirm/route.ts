import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { decryptMfaSecret, verifyTotp } from "@/lib/mfa";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "CARETAKER", "MEMBER");
    const body = await request.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user?.mfaSecretEncrypted) {
      return NextResponse.json({ error: { message: "Start MFA setup first" } }, { status: 400 });
    }

    const secret = decryptMfaSecret(user.mfaSecretEncrypted);
    if (!verifyTotp(secret, code)) {
      return NextResponse.json({ error: { message: "Invalid authenticator code" } }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true, tokenVersion: { increment: 1 } },
    });
    await writeAuditLog({ actorId: user.id, action: "MFA_ENABLED", entityType: "User", entityId: user.id });
    return NextResponse.json({ message: "MFA enabled successfully" });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
