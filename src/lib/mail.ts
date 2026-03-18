import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = 'Mentor CRM <contato@inovamkt.io>', 
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string; // Fundamental para SaaS Shared Sender
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      replyTo: replyTo,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      // Retorna a mensagem de erro específica para o frontend não crashar
      return { success: false, error: (error as any).message || 'Erro na API do Resend' };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error('[Mail Error]:', err);
    return { success: false, error: err?.message || 'Erro inesperado ao enviar e-mail' };
  }
}
