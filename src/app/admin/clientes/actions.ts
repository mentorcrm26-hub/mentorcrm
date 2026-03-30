'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Função Nuclear de Busca: Visualiza todos os clientes do sistema ignorando RLS
 * mas filtrando os Super Administradores.
 */
export async function getTenantsList() {
    console.log('--- FETCHING CLIENTS (ADMIN PRIVILEGED) ---')
    
    // 1. Verificar permissão via client comum (RLS checker)
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    
    if (!isAdmin) {
        console.warn('Unauthorized client list attempt')
        return { success: false, data: [] }
    }

    // 2. Usar Admin Client (Service Role) para puxar todos os registros sem restrição
    const supabaseAdmin = await createAdminClient()

    // 3. Obter a lista de Super Admins para remover da visualização de "Clientes"
    const { data: systemAdmins } = await supabaseAdmin
        .from('system_admins')
        .select('id')
    
    const superAdminIds = systemAdmins?.map(sa => sa.id) || []
    console.log('Internal Super Admins to hide:', superAdminIds.length)

    // 4. Buscar Tenants e seus Usuários associados
    const { data, error } = await supabaseAdmin
        .from('tenants')
        .select(`
            id,
            name,
            status,
            created_at,
            users (
                id,
                email,
                full_name,
                role
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching tenants with admin privileges:', error)
        return { success: false, data: [] }
    }

    // 5. FILTRAR: Remover workspaces que pertencem exclusivamente a Super Admins
    const filteredCustomers = data.filter(tenant => {
        // Se o tenant não tem usuários, ele é orfão e deve aparecer para auditoria
        if (!tenant.users || tenant.users.length === 0) return true
        
        // Se todos os usuários do tenant são Super Admins, escondemos ele da lista de clientes
        const onlyAdminInvolved = tenant.users.every((u: any) => superAdminIds.includes(u.id))
        return !onlyAdminInvolved
    })

    console.log(`Displaying ${filteredCustomers.length} real customers (from ${data.length} total tenants)`)
    return { success: true, data: filteredCustomers }
}

export async function toggleTenantStatus(tenantId: string, currentStatus: string) {
    const supabaseAdmin = await createAdminClient()
    const supabaseUser = await createClient()
    
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'

    const { error } = await supabaseAdmin
        .from('tenants')
        .update({ status: newStatus })
        .eq('id', tenantId)

    if (error) {
        console.error('Erro ao atualizar tenant status:', error)
        return { success: false, error: 'Falha ao alterar status no banco de dados' }
    }

    revalidatePath('/admin/clientes')
    return { success: true }
}

/**
 * ATENÇÃO: UTILIZE COM CAUTELA.
 */
export async function dangerouslyClearAllClients() {
    console.log('--- NUCLEAR CLEANUP START ---')
    
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')

    if (!user || !isAdmin) return { success: false, error: 'Acesso Negado.' }

    const supabaseAdmin = await createAdminClient()

    // 1. Obter todos os Super Admins para proteção
    const { data: systemAdmins } = await supabaseAdmin.from('system_admins').select('id')
    const superAdminIds = systemAdmins?.map(sa => sa.id) || []

    // 2. Obter Tenants dos Super Admins para proteção
    const { data: adminUsers } = await supabaseAdmin
        .from('users')
        .select('tenant_id')
        .in('id', superAdminIds)
    
    const protectedTenantIds = adminUsers?.map(u => u.tenant_id).filter(Boolean) as string[]

    // 3. LIMPEZA TOTAL DE TENANTS NÃO PROTEGIDOS
    let tenantsQuery = supabaseAdmin.from('tenants').delete()
    if (protectedTenantIds.length > 0) {
        tenantsQuery = tenantsQuery.not('id', 'in', `(${protectedTenantIds.join(',')})`)
    }
    
    const { data: deletedTenants } = await tenantsQuery.select('id')

    // 4. LIMPEZA DE USUÁRIOS NÃO PROTEGIDOS
    await supabaseAdmin
        .from('users')
        .delete()
        .not('id', 'in', `(${superAdminIds.join(',')})`)

    console.log('--- NUCLEAR CLEANUP END ---')
    revalidatePath('/admin/clientes')
    revalidatePath('/admin')
    return { success: true, message: `Base limpa! ${deletedTenants?.length || 0} workspaces removidos.` }
}
