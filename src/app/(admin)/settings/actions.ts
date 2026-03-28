'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAdminSettings(data: { id: string, key_name: string, key_value: string }[]) {
    const supabase = await createClient()

    // Verify if user is admin (security_role is handled by RLS if configured, but let's check profile)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return { success: false, error: 'Only super_admins can change global settings' }
    }

    for (const item of data) {
        const { error } = await supabase
            .from('admin_settings')
            .upsert({
                id: item.id,
                key_name: item.key_name,
                key_value: item.key_value,
                updated_at: new Date().toISOString()
            })

        if (error) return { success: false, error: error.message }
    }

    revalidatePath('/settings')
    return { success: true }
}

export async function getAdminSettings() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('admin_settings')
        .select('*')

    if (error) return []
    return data
}

export async function triggerTrialCleanup() {
    const supabase = await createClient()

    // Security check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return { success: false, error: 'Access Denied' }
    }

    // Call the postgres function
    const { data, error } = await supabase.rpc('cleanup_expired_trials')

    if (error) {
        console.error('Cleanup RPC Error:', error)
        return { success: false, error: error.message }
    }

    return { success: true, deletedCount: data }
}
