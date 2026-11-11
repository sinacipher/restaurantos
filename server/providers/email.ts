import { env } from '../config/env.js';
import { Resend } from 'resend';

const resend = env.EMAIL_MODE === 'resend' && env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (env.EMAIL_MODE === 'preview' || !resend) {
    console.log(`\n=========================================`);
    console.log(`📧 EMAIL PREVIEW`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html}`);
    console.log(`=========================================\n`);
    return;
  }

  try {
    await resend.emails.send({
      from: env.RESEND_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}