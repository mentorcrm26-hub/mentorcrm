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
    const { data, error } = await supabase
        .from('api_keys')
        .select('tenant_id, id')
        .eq('key_hash', keyHash)
        .eq('is_active', true)
        .single()

    if (error || !data) return null

    // Update last_used_at asynchronously
    supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id).then()

    return data.tenant_id
}

/**
 * GET /api/v1/leads - List tenant leads
 */
export async function GET(req: NextRequest) {
    const tenantId = await authenticate(req)
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized. Please check your API Key.' }, { status: 401 })

    const supabase = createAdminClient()
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ 
        success: true, 
        count: leads?.length || 0, 
        data: leads 
    })
}

/**
 * POST /api/v1/leads - Create new lead
 */
export async function POST(req: NextRequest) {
    const tenantId = await authenticate(req)
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        
        if (!body.name) return NextResponse.json({ error: 'Field "name" is required.' }, { status: 400 })

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('leads')
            .insert({
                tenant_id: tenantId,
                name: body.name,
                email: body.email,
                phone: body.phone,
                origin: body.origin || 'External API',
                product_interest: body.product_interest,
                notes: body.notes,
                status: body.status || 'New Lead'
            })
            .select()
            .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })

        return NextResponse.json({ 
            success: true, 
            message: 'Lead created successfully.',
            data: data
        }, { status: 201 })

    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 })
    }
}
