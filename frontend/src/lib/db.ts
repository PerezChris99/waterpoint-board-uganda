import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev and across warm
// serverless invocations in production, per Prisma's Next.js guidance.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
