import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import type { Role } from "@prisma/client";
import type { SessionPayload } from "@/lib/jwt";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Throws ApiError(401/403) if the caller isn't authenticated with an allowed role. */
export async function requireRole(...allowed: Role[]): Promise<SessionPayload> {
  const session = await getSession();
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
