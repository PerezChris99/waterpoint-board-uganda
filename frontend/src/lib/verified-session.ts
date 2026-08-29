import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/jwt";

/**
 * Node-runtime only (Server Components / Route Handlers) — never import this from
 * middleware.ts, which runs on the Edge runtime and cannot use Prisma.
 *
 * Re-checks the session against the database so a logged-out or role-changed user's
 * still-unexpired JWT is rejected immediately, instead of trusting the (possibly stale)
 * role embedded in the signed cookie until it naturally expires up to 7 days later.
 */
export async function getVerifiedSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { role: true, tokenVersion: true },
  });
  if (!user || user.tokenVersion !== session.tokenVersion) return null;

  return { ...session, role: user.role };
}
