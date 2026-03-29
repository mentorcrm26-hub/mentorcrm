'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveTwilioCredentials(accountSid: string, authToken: string, phoneNumber: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) return { success: false, error: 'Tenant not found' }

    const payload = {
        tenant_id: userProfile.tenant_id,
        provider: 'twilio',
        is_active: true,
        updated_at: new Date().toISOString(),
        credentials: {
            accountSid,
            authToken,
            phoneNumber,
            status: 'connected'
        }
    }

    const { error } = await supabase
        .from('integrations')
        .upsert(payload, {
            onConflict: 'tenant_id,provider'
        })

    if (error) {
        console.error('Twilio Integration Error:', error.message)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings/integrations')
    return { success: true, data: payload.credentials }
}

export async function disconnectTwilio() {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) return { success: false, error: 'Tenant not found' }

    const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('tenant_id', userProfile.tenant_id)
        .eq('provider', 'twilio')

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/settings/integrations')
    return { success: true }
}
