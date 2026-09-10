import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isEscalated } from "@/lib/escalation";
import { sendNotification } from "@/lib/notifications";
import { sendSms } from "@/lib/sms";
import { ISSUE_LABELS } from "@/lib/labels";

/**
 * Scheduled escalation digest — intended to be triggered by a Vercel Cron job (see
 * docs/DEPLOYMENT.md) hitting this route once a day, e.g. `vercel.json`:
 *   { "crons": [{ "path": "/api/cron/escalations", "schedule": "0 6 * * *" }] }
 *
 * Not user-facing: authenticated by a shared CRON_SECRET (not a user session), and returns 401
 * for any request that doesn't present it — including when CRON_SECRET is unset, which is a
 * safe default-deny rather than an open endpoint.
 *
 * For every water point with at least one escalated report (OPEN/ACKNOWLEDGED for longer than
 * ESCALATION_THRESHOLD_DAYS — see src/lib/escalation.ts), emails and (if a phone is on file)
 * texts the assigned caretaker a single digest. Delivery goes through sendNotification()/sendSms(),
 * which safely no-op if no provider is configured — so running this cron unconfigured is
 * harmless and just logs what it would have sent.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: { message: "Unauthorized" } }, { status: 401 });
  }

  const candidates = await prisma.report.findMany({
    where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
    include: {
      waterPoint: { include: { caretaker: { select: { id: true, email: true, phone: true } } } },
    },
  });
  const escalated = candidates.filter(isEscalated);

  const byCaretaker = new Map<
    string,
    { email: string; phone: string | null; items: typeof escalated }
  >();
  for (const report of escalated) {
    const caretaker = report.waterPoint.caretaker;
    if (!caretaker?.email) continue;
    const entry =
      byCaretaker.get(caretaker.id) ?? { email: caretaker.email, phone: caretaker.phone, items: [] };
    entry.items.push(report);
    byCaretaker.set(caretaker.id, entry);
  }

  let notified = 0;
  for (const { email, phone, items } of byCaretaker.values()) {
    const lines = items.map(
      (r) => `- ${r.waterPoint.name}: ${ISSUE_LABELS[r.issueType]} (open since ${r.createdAt.toDateString()})`,
    );
    const count = items.length;
    const result = await sendNotification({
      to: email,
      subject: `${count} report${count === 1 ? "" : "s"} need attention`,
      body: `The following reports have been unresolved for an extended period:\n\n${lines.join("\n")}\n\nPlease review them in your dashboard.`,
    });
    if (result.sent) notified++;
    if (phone) {
      await sendSms({
        to: phone,
        message: `WaterPoint Board: ${count} report${count === 1 ? "" : "s"} unresolved for over 2 weeks. Check your dashboard.`,
      });
    }
  }

  return NextResponse.json({ escalatedReports: escalated.length, caretakersNotified: notified });
}

