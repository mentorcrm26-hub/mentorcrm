/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function wrapInEmailTemplate(bodyHtml: string, subject: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px 12px 0 0;padding:28px 36px;text-align:center;">
              <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Mentor CRM</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:36px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
              <div style="color:#374151;font-size:15px;line-height:1.7;">
                ${bodyHtml}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This message was sent via <strong style="color:#6366f1;">Mentor CRM</strong>.
                Please do not reply directly to this email unless the sender has set a reply address.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Mentor CRM <noreply@mentorcrm.site>',
  replyTo,
  skipTemplate = false,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  skipTemplate?: boolean;
}) {
  const finalHtml = skipTemplate ? html : wrapInEmailTemplate(html, subject);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html: finalHtml,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error('[Resend Error]:', error);
      return { success: false, error: (error as any).message || 'Resend API error' };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Mail Error]:', err);
    return { success: false, error: err?.message || 'Unexpected error sending email' };
  }
}
