import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { rateLimit, clientIpFrom } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const limit = rateLimit(`login:${clientIpFrom(request)}`, 10, 15 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: { message: "Too many login attempts. Try again later." } },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: { message: "Invalid input" } }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const validPassword = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !validPassword) {
    return NextResponse.json({ error: { message: "Invalid email or password" } }, { status: 401 });
  }

  await createSessionCookie({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  await writeAuditLog({ actorId: user.id, action: "USER_LOGIN", entityType: "User", entityId: user.id });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
