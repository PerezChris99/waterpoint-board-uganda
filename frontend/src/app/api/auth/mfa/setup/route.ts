import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole, apiErrorResponse } from "@/lib/rbac";
import { encryptMfaSecret, generateTotpSecret, otpauthUri } from "@/lib/mfa";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await requireRole("ADMIN", "CARETAKER", "MEMBER");
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) return NextResponse.json({ error: { message: "User not found" } }, { status: 404 });
    if (user.mfaEnabled) {
      return NextResponse.json({ error: { message: "MFA is already enabled" } }, { status: 409 });
    }

    const secret = generateTotpSecret();
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecretEncrypted: encryptMfaSecret(secret) },
    });

    return NextResponse.json({
      secret,
      otpauthUri: otpauthUri(secret, user.email),
      message: "Add this account to an authenticator app, then confirm with the generated code.",
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
