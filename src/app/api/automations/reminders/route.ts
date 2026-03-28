/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

/**
 * 🔒 CORE SYSTEM LOCK - DO NOT MODIFY 🔒
 * 
 * Este arquivo foi VALIDADO EM PRODUÇÃO no dia 20/03/2026.
 * Todo o sistema de automação (1h, 30m e 0m) e tratamento de Fuso Horário está 100% funcional.
 * Evite qualquer modificação neste motor central para garantir que os agendamentos continuem sendo enviados corretamente.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp-service'
import { formatFlorida, getFloridaDate } from '@/lib/timezone'
import { addMinutes, subMinutes } from 'date-fns'
import { parseTemplate } from '@/lib/integrations/message-parser'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    const supabase = await createAdminClient()
    const nowReal = new Date()

    // 1. Fetch upcoming meetings in the next ~70 minutes
    // IMPORTANT: status must be 'Scheduled' and meeting_at within range
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*, tenant:tenants(id, name)')
        .not('meeting_at', 'is', null)
        .eq('status', 'Scheduled')
        .gte('meeting_at', subMinutes(nowReal, 10).toISOString())
        .lte('meeting_at', addMinutes(nowReal, 70).toISOString())

    if (error) {
        console.error('CRON ERROR:', error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const results = { sent_1h: 0, sent_30m: 0, sent_0m: 0, processed: leads?.length || 0 }

    for (const lead of leads || []) {
        const meetingAtReal = new Date(lead.meeting_at)
        const diffMinutes = Math.round((meetingAtReal.getTime() - nowReal.getTime()) / (60 * 1000))
        const notified = lead.meeting_notified || {}

        // Fetch settings for this tenant to see custom templates
        const { data: config } = await supabase
            .from('appointment_settings')
            .select('*, reminder_0m:reminder_0m_template_id(content), reminder_1h:reminder_1h_template_id(content), reminder_30m:reminder_30m_template_id(content)')
            .eq('tenant_id', lead.tenant_id)
            .single()

        // AUTOMATION: 1 HOUR BEFORE (55 - 65 min)
        if (diffMinutes <= 65 && diffMinutes >= 55 && !notified['1h']) {
            const templateContent = (config?.reminder_1h as any)?.content
            const success = await processReminder(supabase, lead, '1h', templateContent, notified, config)
            if (success) {
                results.sent_1h++
                notified['1h'] = true
            }
        }

        // AUTOMATION: 30 MINUTES BEFORE (25 - 35 min)
        if (diffMinutes <= 35 && diffMinutes >= 25 && !notified['30m']) {
            const templateContent = (config?.reminder_30m as any)?.content
            const success = await processReminder(supabase, lead, '30m', templateContent, notified, config)
            if (success) {
                results.sent_30m++
                notified['30m'] = true
            }
        }

        // AUTOMATION: AT MEETING TIME (-5 to +5 min)
        if (diffMinutes <= 5 && diffMinutes >= -5 && !notified['0m']) {
            const templateContent = (config?.reminder_0m as any)?.content
            const success = await processReminder(supabase, lead, '0m', templateContent, notified, config)
            if (success) {
                results.sent_0m++
                notified['0m'] = true
            }
        }
    }

    return NextResponse.json({
        success: true,
        processed: results.processed,
        timestamp_florida: formatFlorida(nowReal),
        stats: results
    })
}

async function processReminder(supabase: any, lead: any, type: string, customTemplate: string | null, notified: any, config: any) {
    // 0. Fetch default sender for meeting links
    const { data: defaultSender } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', lead.tenant_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

    let sentAnything = false;

    // 1. Send to Lead
    if (lead.phone) {
        let timeText = '';
        if (type === '1h') timeText = 'em 1 hora';
        else if (type === '30m') timeText = 'em 30 minutos';
        else if (type === '0m') timeText = 'neste momento';

        const defaultContent = type === '0m' 
            ? `Olá {nome_cliente}! Estou te aguardando na nossa sala de reunião.\n\nLink: {link_google_meet}`
            : `Olá {nome_cliente}! Passando para confirmar nossa reunião de hoje às {hora_reuniao} (${timeText}). Nos vemos em breve!`;
        
        const parsedMessage = parseTemplate(customTemplate || defaultContent, lead, defaultSender);

        const res = await sendWhatsAppMessage({
            phone: lead.phone,
            message: parsedMessage,
            tenantId: lead.tenant_id
        })
        if (res && res.success) sentAnything = true;
    }

    // 2. Notificação Profissional (Apenas se configurado e apenas para 30m e 0m)
    if ((type === '30m' && config?.notify_professional_30m) || (type === '0m' && config?.notify_professional_0m)) {
        const profPhone = config.professional_phone;
        if (profPhone) {
            const meetingAt = getFloridaDate(lead.meeting_at);
            let timeMsg = '';
            if (type === '30m') timeMsg = 'em 30 min';
            else if (type === '0m') timeMsg = 'AGORA';
            
            const professionalMessage = `⚠️ [LEMBRETE CRM]: Reunião de ${lead.name} às ${formatFlorida(meetingAt, 'HH:mm')} (${timeMsg}).`;
            const resProf = await sendWhatsAppMessage({
                phone: profPhone,
                message: professionalMessage,
                tenantId: lead.tenant_id
            })
            if (resProf && resProf.success) sentAnything = true;
        }
    }

    // 3. Mark as notified in DB
    if (sentAnything) {
        const updatedNotified = { ...notified, [type]: true }
        await supabase
            .from('leads')
            .update({ meeting_notified: updatedNotified })
            .eq('id', lead.id)
    }
    
    return sentAnything;
}
