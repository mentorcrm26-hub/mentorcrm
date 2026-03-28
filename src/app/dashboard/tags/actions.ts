'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTags() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data, error } = await supabase.from('tags').select('*').order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, tags: data }
}

export async function createTag(name: string, colorHex: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'User profile not found' }

    const { error } = await supabase.from('tags').insert({
        tenant_id: profile.tenant_id,
        name,
        color_hex: colorHex
    })

    if (error) return { success: false, error: error.message }
    
    revalidatePath('/dashboard/tags')
    revalidatePath('/dashboard/leads')
    return { success: true }
}

export async function deleteTag(tagId: string) {
    const supabase = await createClient()

    // NEW: Check if tag is native before deletion
    const { data: tag } = await supabase.from('tags').select('is_native').eq('id', tagId).single()
    if (tag?.is_native) return { success: false, error: 'Cannot delete native tags.' }

    const { error } = await supabase.from('tags').delete().eq('id', tagId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/tags')
    revalidatePath('/dashboard/leads')
    return { success: true }
}

export async function toggleLeadTag(leadId: string, tagId: string, attach: boolean) {
    const supabase = await createClient()
    if (attach) {
        const { error } = await supabase.from('lead_tags').insert({ lead_id: leadId, tag_id: tagId })
        if (error && error.code !== '23505') return { success: false, error: error.message } 
    } else {
        const { error } = await supabase.from('lead_tags').delete().match({ lead_id: leadId, tag_id: tagId })
        if (error) return { success: false, error: error.message }
    }
    revalidatePath('/dashboard/leads')
    return { success: true }
}
