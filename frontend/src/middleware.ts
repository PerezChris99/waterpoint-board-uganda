import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";

const ROLE_PREFIXES: Record<string, string[]> = {
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/caretaker": ["ADMIN", "CARETAKER"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiredRoles = Object.entries(ROLE_PREFIXES).find(([prefix]) =>
    pathname.startsWith(prefix),
  )?.[1];

  if (!requiredRoles) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!requiredRoles.includes(session.role)) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
