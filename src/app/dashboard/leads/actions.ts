'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { triggerAutomation, manualSendMessage as manualSendMessageInternal } from '@/lib/integrations/automation-engine'
import { cleanPhone } from '@/lib/utils'
import { addMinutes, subMinutes } from 'date-fns'

async function checkSchedulingConflict(supabase: any, tenantId: string, meetingAt: string, excludeLeadId?: string) {
    const meetingDate = new Date(meetingAt)
    const startTime = subMinutes(meetingDate, 59).toISOString()
    const endTime = addMinutes(meetingDate, 59).toISOString()

    let query = supabase
        .from('leads')
        .select('id, name, meeting_at')
        .eq('tenant_id', tenantId)
        .eq('status', 'Scheduled')
        .gte('meeting_at', startTime)
        .lte('meeting_at', endTime)
        .is('is_archived', false)

    if (excludeLeadId) {
        query = query.neq('id', excludeLeadId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error checking scheduling conflict:', error)
        return null
    }

    return data && data.length > 0 ? data[0] : null
}

export async function createLead(data: { name: string, email?: string, phone?: string, notes?: string, birth_date?: string, meeting_at?: string }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) {
        return { success: false, error: 'Tenant not found. Contact support.' }
    }

    const tenantId = userProfile.tenant_id

    // Check for scheduling conflicts
    if (data.meeting_at) {
        const conflict = await checkSchedulingConflict(supabase, tenantId, data.meeting_at)
        if (conflict) {
            const timeStr = new Date(conflict.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return { 
                success: false, 
                error: `Schedule Conflict: ${conflict.name} has a meeting booked at ${timeStr}. Please choose a time at least 1 hour apart.` 
            }
        }
    }

    const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert([{
            tenant_id: userProfile.tenant_id,
            name: data.name,
            email: data.email || null,
            phone: data.phone ? cleanPhone(data.phone) : null,
            notes: data.notes || null,
            birth_date: data.birth_date || null,
            meeting_at: data.meeting_at || null,
            status: data.meeting_at ? 'Scheduled' : 'New Lead' // Auto-schedule if time set
        }])
        .select()
        .single()

    if (insertError) {
        console.error('Error creating lead:', insertError)
        return { success: false, error: insertError.message }
    }

    // Sync to calendar if meeting set
    let syncError = null
    if (data.meeting_at && newLead) {
        try {
            const { syncLeadMeeting } = await import('@/lib/integrations/calendar/sync-engine')
            await syncLeadMeeting(newLead.id)
        } catch (e: any) {
            console.error('Sync Error on Create:', e)
            syncError = e.message
        }
    }

    // 3. Trigger Automations
    try {
        await triggerAutomation('new_lead', newLead)
        if (data.meeting_at) {
            await triggerAutomation('meeting_scheduled', newLead)
        }
        
        // 4. Create initial note if provided
        if (data.notes && newLead) {
            await supabase.from('lead_notes').insert([{
                lead_id: newLead.id,
                tenant_id: tenantId,
                content: data.notes
            }])
        }
    } catch (e) {
        console.error('Automation/Note Trigger Error:', e)
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/analytics')
    return { success: true, syncError }
}

export async function deleteLead(leadId: string) {
    const supabase = await createClient()

    // Get lead info first to check for external event IDs
    const { data: lead } = await supabase.from('leads').select('apple_event_id, google_event_id').eq('id', leadId).single()

    const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId)

    if (error) {
        console.error('Error deleting lead:', error)
        return { success: false, error: error.message }
    }

    // If it had external events, delete them too
    if (lead?.apple_event_id || lead?.google_event_id) {
        try {
            const { deleteExternalEvent, deleteGoogleEvent } = await import('@/lib/integrations/calendar/sync-engine')
            
            if (lead.apple_event_id) {
                await deleteExternalEvent(lead.apple_event_id)
            }
            
            if (lead.google_event_id) {
                await deleteGoogleEvent(lead.google_event_id)
            }
        } catch (e) {
            console.error('Delete Sync Error:', e)
        }
    }

    revalidatePath('/dashboard/leads')
    return { success: true }
}

export async function updateLead(leadId: string, data: { name: string, email?: string, phone?: string, notes?: string, birth_date?: string, meeting_at?: string, status?: string }) {
    const supabase = await createClient()

    // Fetch old lead to check for changes
    const { data: oldLead } = await supabase.from('leads').select('*').eq('id', leadId).single()

    const updatePayload: any = {
        name: data.name,
        email: data.email || null,
        phone: data.phone ? cleanPhone(data.phone) : null,
        notes: data.notes || null,
        birth_date: data.birth_date || null,
        meeting_at: data.meeting_at || null,
        updated_at: new Date().toISOString()
    }

    // Check for scheduling conflicts if meeting time changed
    if (data.meeting_at && data.meeting_at !== oldLead?.meeting_at) {
        const conflict = await checkSchedulingConflict(supabase, oldLead.tenant_id, data.meeting_at, leadId)
        if (conflict) {
            const timeStr = new Date(conflict.meeting_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return { 
                success: false, 
                error: `Schedule Conflict: ${conflict.name} has a meeting booked at ${timeStr}. Please choose a time at least 1 hour apart.` 
            }
        }
    }

    // RESET NOTIFICATIONS if meeting_at changed
    if (data.meeting_at !== oldLead?.meeting_at) {
        updatePayload.meeting_notified = {}
    }

    // Use provided status, or auto-move to Scheduled if a meeting is set
    if (data.status) {
        updatePayload.status = data.status
    } else if (data.meeting_at) {
        updatePayload.status = 'Scheduled'
    }

    const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId)

    if (error) {
        console.error('Error updating lead:', error)
        return { success: false, error: error.message }
    }

    // Trigger automations if meeting was scheduled OR changed
    if (data.meeting_at && data.meeting_at !== oldLead?.meeting_at) {
        try {
            const { data: updatedLead } = await supabase.from('leads').select('*').eq('id', leadId).single()
            if (updatedLead) await triggerAutomation('meeting_scheduled', updatedLead)
        } catch (e) {
            console.error('Automation Update Error:', e)
        }
    }

    let syncError = null
    try {
        const { syncLeadMeeting } = await import('@/lib/integrations/calendar/sync-engine')
        await syncLeadMeeting(leadId)
    } catch (e: any) {
        console.error('Sync Engine Error:', e)
        syncError = e.message
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/analytics')
    return { success: true, syncError }
}

export async function updateLeadStatus(leadId: string, newStatus: string) {
    const supabase = await createClient()

    let updatePayload: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
    }

    // If moving back to New Lead or Contacting, cancel any existing meeting
    if (newStatus === 'New Lead' || newStatus === 'Contacting') {
        updatePayload.meeting_at = null
    }

    const { error } = await supabase
        .from('leads')
        .update(updatePayload)
        .eq('id', leadId)

    if (error) {
        console.error('Error updating lead status:', error)
        return { success: false, error: error.message }
    }

    let syncError = null
    try {
        if (newStatus === 'Scheduled' || newStatus === 'New Lead' || newStatus === 'Contacting') {
            const { syncLeadMeeting } = await import('@/lib/integrations/calendar/sync-engine')
            await syncLeadMeeting(leadId)
        }
    } catch (e: any) {
        console.error('Sync Engine Error:', e)
        syncError = e.message
    }

    // Trigger Automations for status change
    try {
        const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single()
        if (lead) await triggerAutomation('status_change', lead)
    } catch (e) {
        console.error('Automation Status Change Error:', e)
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/analytics')
    return { success: true, syncError }
}

export async function createManyLeads(leads: { name: string, email?: string, phone?: string, notes?: string, birth_date?: string, status?: string, product_interest?: string }[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) {
        return { success: false, error: 'Tenant not found.' }
    }

    const tenantId = userProfile.tenant_id

    const payload = leads.map(lead => ({
        tenant_id: tenantId,
        name: lead.name,
        email: lead.email || null,
        phone: lead.phone || null,
        notes: lead.notes || null,
        product_interest: lead.product_interest || null,
        birth_date: lead.birth_date || null,
        status: lead.status || 'New Lead'
    }))

    const { data: insertedData, error } = await supabase
        .from('leads')
        .insert(payload)
        .select()

    if (error) {
        console.error('Error importing leads:', error)
        return { success: false, error: error.message }
    }

    // Trigger Automations for each imported lead (async)
    if (insertedData) {
        Promise.allSettled(insertedData.map(l => triggerAutomation('new_lead', l)))
            .catch(e => console.error('Bulk automation error:', e))
    }

    revalidatePath('/dashboard/leads')
    return { success: true, count: insertedData?.length || 0 }
}

export async function manualSendMessage(messageOrTemplateId: string, lead: any): Promise<{ success: boolean, error?: any, data?: any }> {
    return await manualSendMessageInternal(messageOrTemplateId, lead)
}

export async function archiveLead(leadId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('leads')
        .update({ 
            is_archived: true, 
            archived_at: new Date().toISOString() 
        })
        .eq('id', leadId)

    if (error) {
        console.error('Error archiving lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/vault')
    return { success: true }
}

export async function restoreLead(leadId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('leads')
        .update({ 
            is_archived: false, 
            archived_at: null 
        })
        .eq('id', leadId)

    if (error) {
        console.error('Error restoring lead:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/leads')
    revalidatePath('/dashboard/vault')
    return { success: true }
}
