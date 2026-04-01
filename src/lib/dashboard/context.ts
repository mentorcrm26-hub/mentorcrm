
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getDashboardContext() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    // Impersonation logic
    const { cookies: getCookies, headers: getHeaders } = await import('next/headers')
    const cookieStore = await getCookies()
    const headerStore = await getHeaders()
    const impersonatedTenantId = headerStore.get('x-impersonated-tenant-id') || cookieStore.get('impersonated_tenant_id')?.value
    
    let userProfile = null
    let tenantId = null
    let userRole = 'agent'

    let queryClient: any = supabase

    if (isSuperAdmin && impersonatedTenantId) {
        // Impersonated view — use admin client to bypass RLS
        tenantId = impersonatedTenantId
        userRole = 'admin'

        const supabaseAdmin = await createAdminClient()
        queryClient = supabaseAdmin

        const { data: tenantData } = await supabaseAdmin
            .from('tenants')
            .select('name')
            .eq('id', tenantId)
            .single()

        userProfile = {
             role: 'admin',
             tenant_id: tenantId,
             tenants: tenantData,
             is_impersonating: true
        }
    } else {
        // Normal view
        const { data: profile } = await supabase
            .from('users')
            .select('role, tenant_id, tenants (name, status)')
            .eq('id', user.id)
            .single()

        if (!profile?.tenant_id) {
            return redirect('/login')
        }

        userProfile = profile
        tenantId = profile.tenant_id
        userRole = profile.role || 'agent'
    }

    return {
        supabase: queryClient,
        user,
        userProfile,
        tenantId,
        userRole,
        isSuperAdmin
    }
}
