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
                if (credentials?.status === 'connected' && credentials?.instanceName && credentials?.number) {
                    const msg = [
                        `🔔 *Nova Solicitação Team Plan*`,
                        ``,
                        `👤 *Nome:* ${data.name}`,
                        `📧 *Email:* ${data.email}`,
                        `📱 *Telefone:* ${data.phone}`,
                        `👥 *Equipe:* ${data.team_size} agentes`,
                        data.message ? `💬 *Mensagem:* ${data.message}` : null,
                        ``,
                        `👉 Acesse: ${process.env.NEXT_PUBLIC_APP_URL || 'https://www.mentorcrm.site'}/admin/team-requests`,
                    ].filter(Boolean).join('\n')

                    await sendEvolutionMessage(credentials.instanceName, credentials.number, msg)
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
