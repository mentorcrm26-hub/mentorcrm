'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Drawing } from '@/types/draw'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getTenantId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { supabase, tenantId: null, userId: null }

    const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    return { supabase, tenantId: profile?.tenant_id ?? null, userId: user.id }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getDrawings() {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized', data: [] }

    const { data, error } = await supabase
        .from('drawings')
        .select(`
            *,
            linked_leads_count:drawing_leads(count)
        `)
        .eq('tenant_id', tenantId)
        .order('updated_at', { ascending: false })

    if (error) return { success: false, error: error.message, data: [] }

    // Flatten count from Supabase aggregation
    const drawings = (data || []).map((d: any) => ({
        ...d,
        linked_leads_count: d.linked_leads_count?.[0]?.count ?? 0,
    }))

    return { success: true, data: drawings as Drawing[] }
}

export async function getDrawingById(id: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized', data: null }

    const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

    if (error) return { success: false, error: error.message, data: null }
    return { success: true, data: data as Drawing }
}

export async function getDrawingsForLead(leadId: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized', data: [] }

    const { data, error } = await supabase
        .from('drawing_leads')
        .select('drawing:drawings(*)')
        .eq('lead_id', leadId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message, data: [] }

    const drawings = (data || []).map((row: any) => row.drawing).filter(Boolean)
    return { success: true, data: drawings as Drawing[] }
}

export async function getLinkedLeadsForDrawing(drawingId: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized', data: [] }

    const { data, error } = await supabase
        .from('drawing_leads')
        .select('lead_id, lead:leads(id, name, email)')
        .eq('drawing_id', drawingId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message, data: [] }
    return { success: true, data: data || [] }
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createDrawing(title: string = 'Untitled Drawing') {
    const { supabase, tenantId, userId } = await getTenantId()
    if (!tenantId || !userId) return { success: false, error: 'Unauthorized', data: null }

    const { data, error } = await supabase
        .from('drawings')
        .insert({
            tenant_id: tenantId,
            created_by: userId,
            title,
            canvas_data: {},
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message, data: null }

    revalidatePath('/dashboard/draw')
    return { success: true, data: data as Drawing }
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateDrawingCanvasData(id: string, canvasData: Record<string, unknown>) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('drawings')
        .update({ canvas_data: canvasData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function updateDrawingThumbnail(id: string, thumbnailUrl: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('drawings')
        .update({ thumbnail_url: thumbnailUrl, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/draw')
    return { success: true }
}

export async function updateDrawingTitle(id: string, title: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('drawings')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/draw')
    return { success: true }
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteDrawing(id: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized' }

    // Also delete thumbnail from storage if exists
    const { data: drawing } = await supabase
        .from('drawings')
        .select('thumbnail_url')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

    if (drawing?.thumbnail_url) {
        const path = drawing.thumbnail_url.split('/drawings/')[1]
        if (path) {
            await supabase.storage.from('drawings').remove([path])
        }
    }

    const { error } = await supabase
        .from('drawings')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/draw')
    return { success: true }
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export async function duplicateDrawing(id: string) {
    const { supabase, tenantId, userId } = await getTenantId()
    if (!tenantId || !userId) return { success: false, error: 'Unauthorized', data: null }

    const { data: source } = await supabase
        .from('drawings')
        .select('title, canvas_data, width, height')
        .eq('id', id)
        .eq('tenant_id', tenantId)
        .single()

    if (!source) return { success: false, error: 'Drawing not found', data: null }

    const { data, error } = await supabase
        .from('drawings')
        .insert({
            tenant_id: tenantId,
            created_by: userId,
            title: `${source.title} (Copy)`,
            canvas_data: source.canvas_data,
            width: source.width,
            height: source.height,
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message, data: null }

    revalidatePath('/dashboard/draw')
    return { success: true, data: data as Drawing }
}

// ─── Upload thumbnail to Supabase Storage ────────────────────────────────────

export async function uploadDrawingThumbnail(id: string, base64Png: string) {
    try {
        const { supabase, tenantId } = await getTenantId()
        if (!tenantId) {
            console.error('[Upload] No tenantId found')
            return { success: false, error: 'Unauthorized', url: null }
        }

        // Convert base64 to binary
        const base64Data = base64Png.replace(/^data:image\/png;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')

        // Use a unique filename to bypass ANY caching (Storage/CDN/Browser)
        const timestamp = Date.now()
        const path = `${tenantId}/${id}/thumbnail_${timestamp}.png`

        // 1. Upload to bucket
        const { error: uploadError } = await supabase.storage
            .from('drawings')
            .upload(path, buffer, {
                contentType: 'image/png',
                cacheControl: '3600',
                upsert: true,
            })

        if (uploadError) {
            console.error(`[Upload] Storage error for ${path}:`, uploadError.message)
            return { success: false, error: uploadError.message, url: null }
        }

        // 2. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('drawings')
            .getPublicUrl(path)

        console.log(`[Upload] Successful for ${id}. URL: ${publicUrl}`)

        // 3. Update DB record (also revalidates path)
        const dbRes = await updateDrawingThumbnail(id, publicUrl)
        if (!dbRes.success) {
            console.error(`[Upload] DB Update error:`, dbRes.error)
            return { success: false, error: dbRes.error, url: null }
        }

        return { success: true, url: publicUrl }
    } catch (e: any) {
        console.error('[Upload] Critical error:', e.message)
        return { success: false, error: e.message, url: null }
    }
}

// ─── Lead Linking ─────────────────────────────────────────────────────────────

export async function linkDrawingToLeads(drawingId: string, leadIds: string[]) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized' }

    if (leadIds.length === 0) return { success: true }

    const rows = leadIds.map(leadId => ({
        drawing_id: drawingId,
        lead_id: leadId,
        tenant_id: tenantId,
    }))

    const { error } = await supabase
        .from('drawing_leads')
        .upsert(rows, { onConflict: 'drawing_id,lead_id' })

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/draw')
    return { success: true }
}

export async function unlinkDrawingFromLead(drawingId: string, leadId: string) {
    const { supabase, tenantId } = await getTenantId()
    if (!tenantId) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('drawing_leads')
        .delete()
        .eq('drawing_id', drawingId)
        .eq('lead_id', leadId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/draw')
    return { success: true }
}
