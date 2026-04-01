'use server'

import { createClient } from '@supabase/supabase-js'

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

        return { success: true }
    } catch (err) {
        console.error('Team contact error:', err)
        return { success: false, error: 'Erro inesperado.' }
    }
}
