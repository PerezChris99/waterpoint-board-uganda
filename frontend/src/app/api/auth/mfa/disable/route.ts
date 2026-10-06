import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await requireRole("ADMIN", "CARETAKER", "MEMBER");
    const body = await request.json().catch(() => null);
    const code = typeof body?.code === "string" ? body.code : "";
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user?.mfaEnabled || !user.mfaSecretEncrypted) {
      return NextResponse.json({ error: { message: "MFA is not enabled" } }, { status: 400 });
    }
    const { decryptMfaSecret, verifyTotp } = await import("@/lib/mfa");
    if (!verifyTotp(decryptMfaSecret(user.mfaSecretEncrypted), code)) {
      return NextResponse.json({ error: { message: "Invalid authenticator code" } }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: false, mfaSecretEncrypted: null, tokenVersion: { increment: 1 } },
    });
    await writeAuditLog({ actorId: user.id, action: "MFA_DISABLED", entityType: "User", entityId: user.id });
    return NextResponse.json({ message: "MFA disabled" });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
