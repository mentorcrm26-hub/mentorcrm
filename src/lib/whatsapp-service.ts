import { createClient } from '@/lib/supabase/server';
import { sendEvolutionMessage } from './integrations/evolution-api';

export class WhatsAppService {
    private tenantId: string;

    constructor(tenantId: string) {
        this.tenantId = tenantId;
    }

    async sendMessage(phone: string, message: string) {
        const supabase = await createClient();

        // 1. Get WhatsApp Integration
        const { data: integration } = await supabase
            .from('integrations')
            .select('credentials')
            .eq('tenant_id', this.tenantId)
            .eq('provider', 'whatsapp')
            .single();

        if (!integration || !integration.credentials?.instanceName) {
            console.error(`[WA-ERROR] No WhatsApp integration found for tenant ${this.tenantId}`);
            return { success: false, error: 'WhatsApp not connected' };
        }

        try {
            const { instanceName } = integration.credentials;
            let cleanPhone = phone.replace(/\D/g, '');
            if (cleanPhone.length === 10) cleanPhone = `1${cleanPhone}`;

            const res = await sendEvolutionMessage(instanceName, cleanPhone, message);

            // Log de histórico
            await this.logMessage(phone, message);

            return { success: true, data: res };
        } catch (err: any) {
            console.error(`[WA-ERROR] Failed to send:`, err);
            return { success: false, error: err.message };
        }
    }

    private async logMessage(phone: string, message: string) {
        const supabase = await createClient();
        try {
            const { data: lead } = await supabase
                .from('leads')
                .select('id')
                .eq('tenant_id', this.tenantId)
                .ilike('phone', `%${phone}%`)
                .single();

            if (lead) {
                const { data: conv } = await supabase
                    .from('conversations')
                    .upsert({
                        tenant_id: this.tenantId,
                        lead_id: lead.id,
                        last_message_content: message,
                        last_message_at: new Date().toISOString()
                    }, { onConflict: 'tenant_id,lead_id' })
                    .select('id').single();

                if (conv) {
                    await supabase.from('messages').insert({
                        tenant_id: this.tenantId,
                        conversation_id: conv.id,
                        direction: 'outbound',
                        content: message,
                        status: 'sent'
                    });
                }
            }
        } catch (e) {
            console.error('[WA-LOG] Error:', e);
        }
    }
}

// Manter função legada para compatibilidade temporária
export async function sendWhatsAppMessage({ phone, message, tenantId }: { phone: string, message: string, tenantId: string }) {
    const service = new WhatsAppService(tenantId);
    return service.sendMessage(phone, message);
}

export async function sendProfessionalMirror({ professionalPhone, leadName, meetingAt, tenantId }: any) {
    if (!professionalPhone) return
    const msg = `⚠️ [ESPELHO AGENTE]: Lembrete de Reunião com o Lead ${leadName}.\n📅 Horário (Miami/Florida): ${meetingAt}`
    const service = new WhatsAppService(tenantId);
    return service.sendMessage(professionalPhone, msg);
}
