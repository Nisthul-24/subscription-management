/**
 * Email utility with SMTP and console fallback.
 * In dev mode (EMAIL_MODE=console), logs to console instead of sending.
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

function getTransporter() {
  if (process.env.EMAIL_MODE === 'console') {
    return null; // Use console fallback
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = getTransporter();

  if (!transporter) {
    // Console fallback for development
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📧 EMAIL (console mode)');
    console.log(`   To: ${options.to}`);
    console.log(`   Subject: ${options.subject}`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(options.html.replace(/<[^>]*>/g, '').substring(0, 500));
    if (options.attachments?.length) {
      console.log(`   Attachments: ${options.attachments.map((a) => a.filename).join(', ')}`);
    }
    console.log('═══════════════════════════════════════════════════════════');
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Brightloop <noreply@brightloop.dev>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments,
  });
}

// ─── EMAIL TEMPLATES ────────────────────────────────────────────────────────────

export function passwordResetEmail(resetUrl: string, firstName: string): EmailOptions & { to: '' } {
  return {
    to: '',
    subject: 'Reset your Brightloop password',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #0F1E2E; margin-bottom: 16px;">Password Reset</h1>
        <p style="color: #5B6B7A; font-size: 16px; line-height: 1.6;">
          Hi ${firstName},
        </p>
        <p style="color: #5B6B7A; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password.
          This link will expire in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="
            display: inline-block;
            background: linear-gradient(135deg, #0E7C7B, #0A6362);
            color: white;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
          ">Reset Password</a>
        </div>
        <p style="color: #5B6B7A; font-size: 14px;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #DDE5EA; margin: 32px 0;" />
        <p style="color: #5B6B7A; font-size: 12px;">
          © Brightloop Subscription Management
        </p>
      </div>
    `,
  };
}

export function invoiceEmail(
  customerName: string,
  invoiceNumber: string,
  totalFormatted: string,
  dueDate: string
): Omit<EmailOptions, 'attachments'> & { to: '' } {
  return {
    to: '',
    subject: `Invoice ${invoiceNumber} from Brightloop`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="color: #0F1E2E; margin-bottom: 16px;">Invoice ${invoiceNumber}</h1>
        <p style="color: #5B6B7A; font-size: 16px; line-height: 1.6;">
          Hi ${customerName},
        </p>
        <p style="color: #5B6B7A; font-size: 16px; line-height: 1.6;">
          A new invoice has been generated for your subscription.
        </p>
        <div style="background: #F4F7F8; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #5B6B7A; padding: 8px 0;">Invoice Number</td>
              <td style="color: #0F1E2E; font-weight: 600; text-align: right;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="color: #5B6B7A; padding: 8px 0;">Total Amount</td>
              <td style="color: #0F1E2E; font-weight: 600; text-align: right;">${totalFormatted}</td>
            </tr>
            <tr>
              <td style="color: #5B6B7A; padding: 8px 0;">Due Date</td>
              <td style="color: #0F1E2E; font-weight: 600; text-align: right;">${dueDate}</td>
            </tr>
          </table>
        </div>
        <p style="color: #5B6B7A; font-size: 16px; line-height: 1.6;">
          Please find the invoice PDF attached to this email.
        </p>
        <hr style="border: none; border-top: 1px solid #DDE5EA; margin: 32px 0;" />
        <p style="color: #5B6B7A; font-size: 12px;">
          © Brightloop Subscription Management
        </p>
      </div>
    `,
  };
}
