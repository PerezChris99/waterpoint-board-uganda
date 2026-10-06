import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

function auditSecret(): string {
  const secret = process.env.AUDIT_HMAC_SECRET || process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUDIT_HMAC_SECRET or JWT_SECRET must be configured with at least 32 characters");
    }
    return "ci-audit-secret";
  }
  return secret;
}

function integrityHash(input: {
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Prisma.InputJsonValue | undefined;
  createdAt: Date;
}): string {
  const canonical = JSON.stringify({
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? null,
    createdAt: input.createdAt.toISOString(),
  });
  return createHmac("sha256", auditSecret()).update(canonical).digest("hex");
}

export async function writeAuditLog(entry: {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  const createdAt = new Date();
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata,
      createdAt,
      integrityHash: integrityHash({
        actorId: entry.actorId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId ?? null,
        metadata: entry.metadata,
        createdAt,
      }),
    },
  });
}
