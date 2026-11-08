// * Brevo transactional email (https://developers.brevo.com/reference/sendtransacemail).
// * Server-only. No `@/` imports, so a plain `node` script can send a test mail.
import type { EmailContent } from "../followUp/emailTemplates.ts";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

// * hello@bezold.com.tw is DKIM-verified on Brevo (bezold.com.tw domain)
export const EMAIL_SENDER = {
  name: "Bezold 頂讓必售",
  email: "hello@bezold.com.tw",
};

export class EmailSendError extends Error {}

export const sendEmail = async ({
  to,
  content,
  tag,
}: {
  to: string;
  content: EmailContent;
  tag: string; // * groups sends in Brevo's logs, e.g. "listing-follow-up"
}) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new EmailSendError("BREVO_API_KEY is not set");

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: EMAIL_SENDER,
      replyTo: EMAIL_SENDER,
      to: [{ email: to }],
      subject: content.subject,
      htmlContent: content.html,
      textContent: content.text,
      tags: [tag],
    }),
  });

  if (!response.ok) {
    // * Brevo answers { code, message } — never echo the request (it has the key)
    const detail = await response.text().catch(() => "");
    throw new EmailSendError(
      `Brevo ${response.status}: ${detail.slice(0, 300)}`,
    );
  }
  const result = (await response.json().catch(() => ({}))) as {
    messageId?: string;
  };
  return result.messageId ?? "";
};
