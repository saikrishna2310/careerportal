import "server-only";
import { Resend } from "resend";

export interface TransactionalEmail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/** Server-only Resend wrapper. Call from a trusted server action, route, or Edge Function. */
export async function sendTransactionalEmail(message: TransactionalEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server.");
  }

  const resend = new Resend(apiKey);
  return resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text
  });
}
