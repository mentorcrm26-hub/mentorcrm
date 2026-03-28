/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'node:crypto'

/**
 * Helper to validate API Key and return tenant_id
 */
async function authenticate(req: NextRequest) {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null

    const rawKey = authHeader.replace('Bearer ', '')
    const keyHash = createHash('sha256').update(rawKey).digest('hex')

    const supabase = createAdminClient()
    const { data } = await supabase
        .from('api_keys')
        .select('tenant_id')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single()

    return data ? data.tenant_id : null
}

/**
 * GET /api/v1/agenda - List appointments (Leads with meeting_at)
 */
export async function GET(req: NextRequest) {
    const tenantId = await authenticate(req)
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createAdminClient()
    
    // In Mentor CRM, meetings are stored in 'meeting_at' field of leads
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, name, meeting_at, status, phone, email, origin')
        .eq('tenant_id', tenantId)
        .not('meeting_at', 'is', null)
        .order('meeting_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ 
        success: true, 
        count: leads?.length || 0, 
        data: leads.map(l => ({
            event_id: l.id,
            title: `Meeting: ${l.name}`,
            start_time: l.meeting_at,
            lead: {
                id: l.id,
                name: l.name,
                phone: l.phone,
                email: l.email,
                status: l.status,
                origin: l.origin
            }
        }))
    })
}
