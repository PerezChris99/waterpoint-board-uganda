import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (session) {
    // Bump tokenVersion so this exact token is rejected by requireRole() from now on, even
    // if a copy of it leaked and outlives the cookie being cleared below. updateMany (not
    // update) so this never throws if the user was already deleted.
    await prisma.user.updateMany({
      where: { id: session.sub },
      data: { tokenVersion: { increment: 1 } },
    });
  }
  await clearSessionCookie();
  return NextResponse.redirect(new URL("/", request.url), {
    status: 303,
  });
}
