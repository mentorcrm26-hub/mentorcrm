'use server'

import { createClient } from '@/lib/supabase/server'

export async function getTenantDetails(tenantId: string) {
    console.log('--- getTenantDetails START ---')
    console.log('tenantId received:', tenantId, typeof tenantId)
    
    // Check if tenantId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!tenantId || tenantId === 'undefined' || !uuidRegex.test(tenantId)) {
        console.error('CRITICAL: Invalid or missing tenantId received:', tenantId)
        return { success: false, error: 'ID de Workspace inválido' }
    }

    const supabase = await createClient()
    
    // Confirmação de Super Admin
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_super_admin')
    console.log('is_super_admin result:', isAdmin, 'error:', adminError)
    
    if (!isAdmin) {
        console.warn('Access denied: User is NOT super admin')
        return { success: false, error: 'Acesso Restrito' }
    }

    // Buscar tenant, seus usuários e outras métricas relevantes
    console.log('Fetching tenant from DB for ID:', tenantId)
    const { data, error } = await supabase
        .from('tenants')
        .select(`
            id,
            name,
            status,
            created_at,
            stripe_customer_id,
            is_vip,
            users (
                id,
                email,
                full_name,
                role,
                created_at
            )
        `)
        .eq('id', tenantId)
        .maybeSingle()

    if (error) {
        console.error('CRITICAL: Supabase Error in getTenantDetails:', JSON.stringify(error, null, 2))
        return { success: false, error: `Erro no Banco: ${error.message}` }
    }

    if (!data) {
        console.warn('Tenant not found in DB for ID:', tenantId)
        return { success: false, error: 'Workspace não encontrado' }
    }

    console.log('Tenant details found:', data.name)
    console.log('--- getTenantDetails END ---')
    return { success: true, data }
}
