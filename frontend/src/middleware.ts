import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const ROLE_PREFIXES: Record<string, string[]> = {
  "/dashboard/security": ["ADMIN", "CARETAKER", "MEMBER"],
  "/dashboard/admin": ["ADMIN"],
  "/dashboard/caretaker": ["ADMIN", "CARETAKER"],
  "/dashboard/member": ["ADMIN", "CARETAKER", "MEMBER"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/health") && !pathname.startsWith("/api/cron/")) {
    const scope = pathname.startsWith("/api/auth/") ? "auth" : "api";
    const limit = scope === "auth" ? RATE_LIMITS.auth : RATE_LIMITS.api;
    const result = await checkRateLimit(request, scope, limit);

    if (!result.allowed) {
      return NextResponse.json(
        { error: { message: "Too many requests. Please retry later." } },
        {
          status: 429,
          headers: {
            "Retry-After": String(result.retryAfter),
            "Cache-Control": "no-store",
          },
        },
      );
    }
  }

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
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
