import { NextResponse } from "next/server";
import { getVerifiedSession, type VerifiedSessionPayload } from "@/lib/verified-session";
import type { Role } from "@prisma/client";
import { logger } from "@/lib/logger";

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
export async function requireRole(...allowed: Role[]): Promise<VerifiedSessionPayload> {
  const session = await getVerifiedSession();
  if (!session) throw new ApiError(401, "Authentication required");

  if (allowed.length > 0 && !allowed.includes(session.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  return session;
}

/**
 * Builds a Prisma `where` fragment that scopes a query to the caller's Organization.
 * An ADMIN/CARETAKER with no organizationId is treated as a platform-wide super-admin
 * (sees/manages everything, including unassigned demo data) — returns an empty filter.
 * An org-scoped caller only sees rows belonging to their own Organization.
 */
export function organizationScopeWhere(session: { organizationId: string | null }): {
  organizationId?: string;
} {
  return session.organizationId ? { organizationId: session.organizationId } : {};
}

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: { message: error.message } }, { status: error.status });
  }
  logger.error("Unhandled API error", {
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error,
  });
  return NextResponse.json({ error: { message: "Internal server error" } }, { status: 500 });
}
