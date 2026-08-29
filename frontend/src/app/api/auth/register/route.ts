import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";
import { registerSchema } from "@/lib/validation";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const limit = rateLimit(`register:${clientIpFrom(request)}`, 5, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: { message: "Too many registration attempts. Try again later." } },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Invalid input", fields: parsed.error.flatten().fieldErrors } },
      { status: 400 },
    );
  }

  const { name, email, password, village } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: { message: "An account with that email already exists" } },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, village, role: "MEMBER" },
  });

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await writeAuditLog({ actorId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
