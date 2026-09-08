import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM || 'MotoMarket <onboarding@resend.dev>';

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set — skipping send to', to);
    return { skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
  if (error) {
    console.error('[email] Resend error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
  return data;
}
