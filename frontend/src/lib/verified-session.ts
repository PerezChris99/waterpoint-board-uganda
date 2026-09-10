import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/jwt";

// Node-runtime-only extension of SessionPayload: adds the caller's current organization
// scope, always re-read fresh from the database (see rationale below) rather than embedded
// in the JWT, so an org reassignment takes effect immediately without requiring re-login.
export interface VerifiedSessionPayload extends SessionPayload {
  organizationId: string | null;
}

/**
 * Node-runtime only (Server Components / Route Handlers) — never import this from
 * middleware.ts, which runs on the Edge runtime and cannot use Prisma.
 *
 * Re-checks the session against the database so a logged-out or role-changed user's
 * still-unexpired JWT is rejected immediately, instead of trusting the (possibly stale)
 * role embedded in the signed cookie until it naturally expires up to 7 days later.
 */
export async function getVerifiedSession(): Promise<VerifiedSessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { role: true, tokenVersion: true, organizationId: true },
  });
  if (!user || user.tokenVersion !== session.tokenVersion) return null;

  return { ...session, role: user.role, organizationId: user.organizationId };
}
