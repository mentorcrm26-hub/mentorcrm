'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes, createHash } from 'node:crypto'

/**
 * Generates a new API Key for the current tenant.
 */
export async function createApiKey(name: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized user' }

    // Get tenant_id from user profile
    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) return { success: false, error: 'Tenant not found' }

    // 1. Generate Raw Key (Plain text)
    const rawKey = `mc_live_${randomBytes(24).toString('hex')}`
    
    // 2. Generate SHA-256 Hash for DB
    const keyHash = createHash('sha256').update(rawKey).digest('hex')
    
    // 3. Generate Readable Preview
    const keyPreview = `${rawKey.substring(0, 11)}...${rawKey.substring(rawKey.length - 4)}`

    const { error } = await supabase
        .from('api_keys')
        .insert({
            tenant_id: userProfile.tenant_id,
            user_id: user.id,
            name: name || 'New Integration',
            key_hash: keyHash,
            key_preview: keyPreview,
            is_active: true
        })

    if (error) {
        console.error('Database Error:', error)
        return { success: false, error: 'Error saving API key.' }
    }

    revalidatePath('/dashboard/settings/integrations')
    return { success: true, apiKey: rawKey }
}

/**
 * List keys for current tenant
 */
export async function getApiKeys() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

/**
 * Revokes (Deletes) a key
 */
export async function revokeApiKey(id: string) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/settings/integrations')
    return { success: true }
}
