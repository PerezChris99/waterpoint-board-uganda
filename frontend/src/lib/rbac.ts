import { NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/verified-session";
import type { Role } from "@prisma/client";
import type { SessionPayload } from "@/lib/jwt";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Throws ApiError(401/403) if the caller isn't authenticated with an allowed role.
 * Re-checks the session against the database so a logged-out or role-changed user's
 * still-unexpired JWT can't be reused (see tokenVersion on the User model).
 */
export async function requireRole(...allowed: Role[]): Promise<SessionPayload> {
  const session = await getVerifiedSession();
  if (!session) throw new ApiError(401, "Authentication required");

  if (allowed.length > 0 && !allowed.includes(session.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  return session;
}

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { message: error.message } }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
}
