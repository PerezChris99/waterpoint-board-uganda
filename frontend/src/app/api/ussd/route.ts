import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { STATUS_LABELS } from "@/lib/labels";
import {
  parseUssdText,
  issueTypeFromDigit,
  buildMainMenu,
  buildAskForCode,
  buildIssueMenu,
  buildNotFound,
  buildReportConfirmation,
  buildInvalidSelection,
  buildStatusResponse,
} from "@/lib/ussd";

/**
 * USSD webhook for feature-phone access (Africa's Talking USSD contract): the gateway POSTs
 * form-encoded `sessionId`/`serviceCode`/`phoneNumber`/`text` on every keypress, and expects a
 * plain-text response prefixed "CON " (show another menu, session continues) or "END " (final
 * message, session closes). See docs/DEPLOYMENT.md for how to point an Africa's Talking USSD
 * channel at this route.
 *
 * `text` accumulates the caller's full input history joined by "*" across the session
 * (e.g. "1*WP-001*3"), so the whole flow below is re-derived from scratch on every request —
 * there is no server-side session state to manage.
 *
 * Menu:
 *   (empty)         -> main menu: 1) report an issue, 2) check status
 *   1                -> ask for water point code
 *   1*<code>         -> issue type menu
 *   1*<code>*<digit> -> creates a PENDING_REVIEW report (same moderation queue as anonymous web
 *                       reports — a phone number alone isn't a verified account) and ends
 *   2                -> ask for water point code
 *   2*<code>         -> reports current status and ends
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const phoneNumber = String(form.get("phoneNumber") ?? "unknown");
  const rawText = String(form.get("text") ?? "");

  const limit = rateLimit(`ussd:${phoneNumber}`, 20, 60 * 60 * 1000);
  if (!limit.allowed) {
    return textResponse("END Too many requests. Please try again later.");
  }

  const steps = parseUssdText(rawText);
  if (steps.length === 0) {
    return textResponse(buildMainMenu());
  }

  const [menuChoice, code, issueDigit] = steps;
  if (menuChoice !== "1" && menuChoice !== "2") {
    return textResponse(buildInvalidSelection());
  }
  if (steps.length === 1) {
    return textResponse(buildAskForCode());
  }

  const waterPoint = await prisma.waterPoint.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!waterPoint) {
    return textResponse(buildNotFound());
  }

  if (menuChoice === "2") {
    const verifiedText = waterPoint.lastVerifiedAt
      ? `Last verified: ${waterPoint.lastVerifiedAt.toDateString()}`
      : "Not yet verified.";
    return textResponse(
      buildStatusResponse(waterPoint.name, STATUS_LABELS[waterPoint.status], verifiedText),
    );
  }

  // menuChoice === "1": report an issue
  if (steps.length === 2) {
    return textResponse(buildIssueMenu(waterPoint.name));
  }

  const issueType = issueTypeFromDigit(issueDigit);
  if (!issueType) {
    return textResponse(buildInvalidSelection());
  }

  // Same moderation queue as anonymous web reports (see docs/DATA-METHODOLOGY.md) — a phone
  // number by itself isn't an authenticated account, so it starts PENDING_REVIEW.
  await prisma.report.create({
    data: {
      waterPointId: waterPoint.id,
      issueType,
      description: `Reported via USSD by ${phoneNumber}.`,
      reporterName: `USSD caller (${phoneNumber})`,
      moderationStatus: "PENDING_REVIEW",
    },
  });

  return textResponse(buildReportConfirmation());
}

function textResponse(body: string): NextResponse {
  return new NextResponse(body, { headers: { "Content-Type": "text/plain" } });
}
