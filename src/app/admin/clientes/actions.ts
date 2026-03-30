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
        if (!tenant.users || tenant.users.length === 0) return true
        const onlyAdminInvolved = tenant.users.every((u: any) => superAdminIds.includes(u.id))
        return !onlyAdminInvolved
    })

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

export async function toggleTenantVipStatus(tenantId: string, currentVipStatus: boolean) {
    const supabaseAdmin = await createAdminClient()
    const supabaseUser = await createClient()
    
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    const { error } = await supabaseAdmin
        .from('tenants')
        .update({ is_vip: !currentVipStatus })
        .eq('id', tenantId)

    if (error) {
        console.error('Erro ao atualizar tenant VIP status:', error)
        return { success: false, error: 'Falha ao alterar status VIP no banco de dados' }
    }

    revalidatePath('/admin/clientes')
    revalidatePath(`/admin/clientes/${tenantId}`)
    return { success: true }
}

/**
 * ATENÇÃO: UTILIZE COM CAUTELA.
 * Esta função agora executa a LIMPEZA NUCLEAR tanto do banco de dados (Public)
 * quanto da lista de Authentication (Auth.Users) do Supabase.
 */
export async function dangerouslyClearAllClients() {
    console.log('--- START NUCLEAR CLEANUP (AUTH + DB) ---')
    
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')

    if (!user || !isAdmin) {
        console.error('Unauthorized attempt to clear database')
        return { success: false, error: 'Acesso Negado.' }
    }

    const supabaseAdmin = await createAdminClient()

    // 1. Obter IDs de Super Admins para proteção
    const { data: systemAdmins } = await supabaseAdmin.from('system_admins').select('id')
    const superAdminIds = systemAdmins?.map(sa => sa.id) || []

    // 2. Identificar todos os usuários que NÃO são administradores para deletar do AUTH
    const { data: usersToDelete, error: fetchUsersError } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .not('id', 'in', `(${superAdminIds.join(',')})`)

    if (fetchUsersError) {
        console.error('Error identifying users to delete from Auth:', fetchUsersError)
    }

    const userIdsToDelete = usersToDelete?.map(u => u.id) || []
    console.log(`Users identified for Auth Deletion: ${userIdsToDelete.length}`)

    // 3. DELETAR DO SUPABASE AUTH (Lista de Logins)
    // Usamos o Auth Admin API para invalidar as credenciais permanentemente
    for (const uid of userIdsToDelete) {
        try {
            const { error: authDelError } = await supabaseAdmin.auth.admin.deleteUser(uid)
            if (authDelError) {
                console.error(`Error deleting user ${uid} from Auth:`, authDelError.message)
            } else {
                console.log(`Successfully removed login credential for User ID: ${uid}`)
            }
        } catch (err) {
            console.error(`Panic deleting user ${uid}:`, err)
        }
    }

    // 4. LIMPEZA TOTAL DE TENANTS (Nuclear via Service Role no Banco Público)
    // Isso apaga tudo vinculado via CASCADE (Leads, Mensagens, etc.)
    const { data: adminUsers } = await supabaseAdmin
        .from('users')
        .select('tenant_id')
        .in('id', superAdminIds)
    
    const protectedTenantIds = adminUsers?.map(u => u.tenant_id).filter(Boolean) as string[]

    let tenantsQuery = supabaseAdmin.from('tenants').delete()
    if (protectedTenantIds.length > 0) {
        tenantsQuery = tenantsQuery.not('id', 'in', `(${protectedTenantIds.join(',')})`)
    }
    
    const { data: deletedTenants, error: delTenantsError } = await tenantsQuery.select('id')

    if (delTenantsError) {
        console.error('Error in nuclear tenant cleanup:', delTenantsError)
        return { success: false, error: `Erro na remoção do DB Público: ${delTenantsError.message}` }
    }

    // 5. LIMPEZA DE USUÁRIOS NO BANCO PÚBLICO
    await supabaseAdmin
        .from('users')
        .delete()
        .not('id', 'in', `(${superAdminIds.join(',')})`)

    console.log('--- NUCLEAR CLEANUP COMPLETED (AUTH + DB) ---')
    revalidatePath('/admin/clientes')
    revalidatePath('/admin')
    
    return { 
        success: true, 
        message: `Tudo limpo! ${userIdsToDelete.length} Logins invalidados e ${deletedTenants?.length || 0} Workspaces removidos.` 
    }
}
