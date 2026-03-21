import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/mail';
import { sendWhatsAppMessage } from '@/lib/whatsapp-service';
import { parseTemplate } from './message-parser';

export async function triggerAutomation(event: 'new_lead' | 'status_change' | 'meeting_scheduled' | 'lead_birthday', lead: any, supabaseInstance?: any) {
  const supabase = supabaseInstance || await createClient();

  // 1. Fetch active automations for this event and tenant
  const { data: automations } = await supabase
    .from('automations')
    .select('*, template:message_templates(*)')
    .eq('tenant_id', lead.tenant_id)
    .eq('trigger_event', event)
    .eq('is_active', true);

  if (!automations || automations.length === 0) return;

  for (const automation of automations) {
    // 2. Check conditions (if status_change, check for specific status)
    if (event === 'status_change' && automation.trigger_condition?.status) {
      if (lead.status !== automation.trigger_condition.status) continue;
    }

    // 3. Send message
    if (automation.template) {
      // Fetch a default user for this tenant to provide meeting links
      const { data: defaultSender } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', lead.tenant_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      const parsedContent = parseTemplate(automation.template.content, lead, defaultSender);
      
      if (automation.template.type === 'email' && lead.email) {
        await sendEmail({
          to: lead.email,
          subject: automation.template.subject || 'Notificação Mentor CRM',
          html: parsedContent,
        });
      } else if (automation.template.type === 'whatsapp' && lead.phone) {
        await sendWhatsAppMessage({
          phone: lead.phone,
          message: parsedContent,
          tenantId: lead.tenant_id,
        });
      }
    }
  }
}

export async function manualSendMessage(messageOrTemplateId: string, lead: any) {
  const supabase = await createClient();

  let type = lead.type; // 'email' or 'whatsapp' passed from UI
  let content = lead.content; // raw content if manual
  let subject = lead.subject;

  if (messageOrTemplateId !== 'custom') {
    const { data: template } = await supabase
      .from('message_templates')
      .select('*')
      .eq('id', messageOrTemplateId)
      .single();

    if (!template) return { success: false, error: 'Template not found' };
    
    const { data: { user } } = await supabase.auth.getUser();
    let sender = null;
    if (user) {
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
      sender = profile;
    }

    type = template.type;
    content = parseTemplate(template.content, lead, sender);
    subject = template.subject ? parseTemplate(template.subject, lead, sender) : undefined;
  } else {
    // Se for customizado, tenta extrair o assunto se ele começar com "Subject:"
    if (type === 'email' && typeof content === 'string' && content.startsWith('Subject:')) {
      const lines = content.split('\n');
      subject = lines[0].replace('Subject:', '').trim();
      content = lines.slice(1).join('\n').trim();
    }
  }

  if (type === 'email' && lead.email) {
    console.log(`[Email] Enviando para: ${lead.email}`);
    return await sendEmail({
      to: lead.email,
      subject: subject || 'Notificação Mentor CRM',
      html: content.replace(/\n/g, '<br>'),
    });
  } else if (type === 'whatsapp' && lead.phone) {
    return await sendWhatsAppMessage({
      phone: lead.phone,
      message: content,
      tenantId: lead.tenant_id,
    });
  }

  return { success: false, error: 'Recipient info missing or Type mismatch' };
}
