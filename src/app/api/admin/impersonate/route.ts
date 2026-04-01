import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const tenantId = searchParams.get('tenant_id')

    if (!tenantId) {
        return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: isAdmin } = await supabase.rpc('is_super_admin')

    if (!isAdmin) {
        return NextResponse.json({ error: 'Acesso Restrito' }, { status: 403 })
    }

    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('impersonated_tenant_id', tenantId, {
        path: '/',
        maxAge: 3600,
        sameSite: 'lax',
        httpOnly: true,
    })

    return response
}
