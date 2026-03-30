'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTenantsList() {
    const supabase = await createClient()
    
    // Confirmação dupla de Super Admin
    const { data: isAdmin } = await supabase.rpc('is_super_admin')
    if (!isAdmin) return { success: false, data: [] }

    const { data, error } = await supabase
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
        .order('created_at', { ascending: false }) // Mais recentes primeiro

    if (error) {
        console.error('Erro ao buscar clientes:', error)
        return { success: false, data: [] }
    }

    return { success: true, data }
}

// Suspender Workspace / Cliente
export async function toggleTenantStatus(tenantId: string, currentStatus: string) {
    const supabase = await createClient()
    const { data: isAdmin } = await supabase.rpc('is_super_admin')
    
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended'

    const { error } = await supabase
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
 * Esta função utiliza o ADMIN CLIENT (Service Role) para ignorar RLS e apagar TUDO.
 * Remove todos os tenants e usuários que NÃO pertencem ao Super Admin atual.
 */
export async function dangerouslyClearAllClients() {
    console.log('--- NUCLEAR CLEANUP START (ADMIN PRIVILEGED) ---')
    
    // 1. Verificar permissão do usuário atual (Usando client comum para checar sessão)
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')

    if (!user || !isAdmin) {
        console.error('Unauthorized attempt to clear database')
        return { success: false, error: 'Acesso Negado: Apenas Super Admins podem realizar esta limpeza.' }
    }

    // 2. Criar Cliente Admin (Service Role) para Bypass de RLS
    const supabaseAdmin = await createAdminClient()

    // 3. Obter ID do Tenant do Admin atual para protegê-lo
    const { data: adminUserRecord } = await supabaseAdmin
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    const protectedTenantId = adminUserRecord?.tenant_id
    console.log('Protecting Admin User ID:', user.id)
    console.log('Protecting Admin Tenant ID:', protectedTenantId)

    // 4. LIMPEZA TOTAL DE TENANTS (Nuclear via Service Role)
    // Isso apaga tudo vinculado via CASCADE (Leads, Mensagens, Notas, etc.)
    let tenantsQuery = supabaseAdmin.from('tenants').delete()
    if (protectedTenantId) {
        tenantsQuery = tenantsQuery.neq('id', protectedTenantId)
    }
    
    const { data: deletedTenants, error: delTenantsError } = await tenantsQuery.select('id')

    if (delTenantsError) {
        console.error('Error in nuclear tenant cleanup:', delTenantsError)
        return { success: false, error: `Erro na remoção nuclear: ${delTenantsError.message}` }
    }

    // 5. LIMPEZA DE USUÁRIOS (Não protegidos)
    const { error: delUsersError } = await supabaseAdmin
        .from('users')
        .delete()
        .neq('id', user.id)

    if (delUsersError) {
        console.error('Error in user cleanup:', delUsersError)
    }

    console.log('--- NUCLEAR CLEANUP END (SUCCESS) ---')
    console.log('Tenants deleted:', deletedTenants?.length || 0)

    revalidatePath('/admin/clientes')
    return { success: true, message: `Base de dados limpa! ${deletedTenants?.length || 0} workspaces e todos os leads vinculados foram removidos.` }
}
