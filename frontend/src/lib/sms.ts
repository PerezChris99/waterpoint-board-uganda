// Provider-agnostic SMS interface, mirroring src/lib/notifications.ts. Safe by default: with no
// provider configured, sendSms() logs and returns { sent: false } instead of throwing.
//
// Real provider: Africa's Talking (https://africastalking.com) — the dominant SMS/USSD gateway
// for East Africa, used directly via its HTTP API to avoid adding an SDK dependency. Configure
// AFRICAS_TALKING_API_KEY and AFRICAS_TALKING_USERNAME (and optionally AFRICAS_TALKING_SENDER_ID)
// to enable real delivery — see docs/DEPLOYMENT.md.

export interface SmsPayload {
  to: string;
  message: string;
}

export interface SmsResult {
  sent: boolean;
  provider: "africas-talking" | "noop";
}

const AFRICAS_TALKING_URL = "https://api.africastalking.com/version1/messaging";

export async function sendSms(payload: SmsPayload): Promise<SmsResult> {
  const apiKey = process.env.AFRICAS_TALKING_API_KEY;
  const username = process.env.AFRICAS_TALKING_USERNAME;
  if (!apiKey || !username) {
    console.log(`[sms:noop] Would text ${payload.to}: "${payload.message}"`);
    return { sent: false, provider: "noop" };
  }

  try {
    const body = new URLSearchParams({
      username,
      to: payload.to,
      message: payload.message,
    });
    const senderId = process.env.AFRICAS_TALKING_SENDER_ID;
    if (senderId) body.set("from", senderId);

    const response = await fetch(AFRICAS_TALKING_URL, {
      method: "POST",
      headers: {
        apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) {
      console.error(`SMS provider returned ${response.status}`);
      return { sent: false, provider: "africas-talking" };
    }
    return { sent: true, provider: "africas-talking" };
  } catch (error) {
    // Never let an SMS failure break the caller's actual work (e.g. submitting a report).
    console.error("Failed to send SMS", error);
    return { sent: false, provider: "africas-talking" };
  }
}
