// Provider-agnostic email notification interface. Safe by default: with no provider configured,
// sendNotification() logs and returns { sent: false } instead of throwing, so calling code never
// needs to worry about breaking a request just because notifications aren't set up in a given
// environment (e.g. this sandbox, or a fresh deployment before secrets are provisioned).
//
// Real provider: Resend (https://resend.com), called via plain fetch to avoid adding an SDK
// dependency for a single HTTP call. Configure RESEND_API_KEY (and optionally
// NOTIFICATIONS_FROM_EMAIL) to enable it — see docs/DEPLOYMENT.md.

export interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
}

export interface NotificationResult {
  sent: boolean;
  provider: "resend" | "noop";
}

export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[notifications:noop] Would email ${payload.to}: "${payload.subject}"`);
    return { sent: false, provider: "noop" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFICATIONS_FROM_EMAIL ?? "notifications@waterpointboard.example",
        to: payload.to,
        subject: payload.subject,
        text: payload.body,
      }),
    });
    if (!response.ok) {
      console.error(`Notification provider returned ${response.status}`);
      return { sent: false, provider: "resend" };
    }
    return { sent: true, provider: "resend" };
  } catch (error) {
    // Never let a notification failure break the caller's actual work (e.g. submitting a report).
    console.error("Failed to send notification", error);
    return { sent: false, provider: "resend" };
  }
}
