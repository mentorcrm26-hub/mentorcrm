'use server'

import { createClient } from '@supabase/supabase-js'
import { sendEvolutionMessage } from '@/lib/integrations/evolution-api'

export async function submitTeamContact(data: {
    name: string
    email: string
    phone: string
    team_size: string
    message: string
}) {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await supabaseAdmin
            .from('team_requests')
            .insert({
                name: data.name,
                email: data.email,
                phone: data.phone,
                team_size: data.team_size,
                message: data.message || null,
                status: 'pending',
            })

        if (error) {
            console.error('Error saving team request:', error)
            return { success: false, error: 'Erro ao salvar solicitação.' }
        }

        // Send WhatsApp notification to admin (best-effort, never fail the response)
        try {
            const { data: settingRow } = await supabaseAdmin
                .from('admin_settings')
                .select('key_value')
                .eq('key_name', 'admin_whatsapp_instance')
                .single()

            if (settingRow?.key_value) {
                const credentials = JSON.parse(settingRow.key_value)
                if (credentials?.instanceName && credentials?.notifyNumber) {
                    // Número de destino das notificações (separado do número da instância)
                    const rawNumber = String(credentials.notifyNumber).replace(/\D/g, '')

                    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://www.mentorcrm.site'

                    const msg = [
                        `🚀 *Novo Lead — Plano Team!*`,
                        ``,
                        `Acabou de chegar uma nova solicitação de acesso ao plano Team no Mentor CRM.`,
                        ``,
                        `👤 *Nome:* ${data.name}`,
                        `📧 *Email:* ${data.email}`,
                        `📱 *Telefone:* ${data.phone}`,
                        `👥 *Tamanho da equipe:* ${data.team_size} agentes`,
                        data.message ? `💬 *Mensagem:* ${data.message}` : null,
                        ``,
                        `⚡ Entre em contato em até 24h para fechar mais esse cliente!`,
                        ``,
                        `👉 ${appUrl}/admin/team-requests`,
                    ].filter(Boolean).join('\n')

                    await sendEvolutionMessage(credentials.instanceName, rawNumber, msg)
                    console.log('[TEAM-CONTACT] WhatsApp notification sent to', rawNumber)
                }
            }
        } catch (notifErr) {
            console.error('[TEAM-CONTACT] WhatsApp notification error:', notifErr)
        }

        return { success: true }
    } catch (err) {
        console.error('Team contact error:', err)
        return { success: false, error: 'Erro inesperado.' }
    }
}
