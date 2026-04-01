'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTeamRequests() {
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, data: [] }

    const supabaseAdmin = await createAdminClient()
    const { data, error } = await supabaseAdmin
        .from('team_requests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { success: false, data: [] }
    return { success: true, data: data || [] }
}

export async function updateTeamRequestStatus(id: string, status: string) {
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin
        .from('team_requests')
        .update({ status })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/team-requests')
    return { success: true }
}
