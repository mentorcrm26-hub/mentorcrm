'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLeadNotes(leadId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching notes:', error)
        return { success: false, error: error.message }
    }
    return { success: true, data }
}

export async function addLeadNote(leadId: string, content: string) {
    const supabase = await createClient()
    
    // Get tenant_id from lead
    const { data: lead } = await supabase
        .from('leads')
        .select('tenant_id')
        .eq('id', leadId)
        .single()

    if (!lead) {
        console.error('Lead not found for note insertion:', leadId)
        return { success: false, error: 'Lead not found' }
    }

    console.log('Inserting note for lead:', leadId, 'Tenant:', lead.tenant_id)

    const { data, error } = await supabase
        .from('lead_notes')
        .insert([{
            lead_id: leadId,
            tenant_id: lead.tenant_id,
            content
        }])
        .select()
        .single()

    if (error) {
        console.error('Supabase error adding note:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/leads')
    return { success: true, data }
}

export async function updateLeadNote(noteId: string, content: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('lead_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single()

    if (error) {
        console.error('Error updating note:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/leads')
    return { success: true, data }
}

export async function deleteLeadNote(noteId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId)

    if (error) {
        console.error('Error deleting note:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/leads')
    return { success: true }
}
