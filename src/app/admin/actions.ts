'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'

/**
 * Função unificada para obter métricas globais do Super Admin.
 * Usa Admin Client para garantir que NADA escape do relatório.
 */
export async function getAdminOverviewData() {
    console.log('--- GENERATING GLOBAL OVERVIEW (ADMIN PRIVILEGED) ---')
    
    // 1. Verificar permissão via client comum
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    // 2. Usar Admin Client para bypass total de RLS nas métricas
    const supabaseAdmin = await createAdminClient()

    try {
        // A. Identificar IDs de Super Admins para filtro
        const { data: systemAdmins } = await supabaseAdmin.from('system_admins').select('id')
        const superAdminIds = systemAdmins?.map(sa => sa.id) || []

        // B. Buscar todos os Tenants e seus usuários
        const { data: allTenants, error: tenantErr } = await supabaseAdmin
            .from('tenants')
            .select('id, status, users(id)')

        if (tenantErr) throw tenantErr

        // C. FILTRAR: Apenas tenants que possuem pelo menos um usuário que NÃO é Super Admin
        const realClientTenants = allTenants.filter(tenant => {
            if (!tenant.users || tenant.users.length === 0) return true // Orphans count as system load
            return tenant.users.some((u: any) => !superAdminIds.includes(u.id))
        })

        const tenantStats = {
            total: realClientTenants.length,
            active: realClientTenants.filter(t => t.status === 'active').length,
            trial: realClientTenants.filter(t => t.status === 'trial').length,
            suspended: realClientTenants.filter(t => t.status === 'suspended').length
        }

        const realTenantIds = realClientTenants.map(t => t.id)

        // D. Automações apenas de clientes reais
        let automationsCount = 0
        if (realTenantIds.length > 0) {
            const { count } = await supabaseAdmin
                .from('automations')
                .select('*', { count: 'exact', head: true })
                .in('tenant_id', realTenantIds)
            
            automationsCount = count || 0
        }

        // E. Cálculo de MRR (Stripe)
        let mrrCents = 0
        let hasStripeError = false

        if (isStripeConfigured()) {
            try {
                let hasMore = true
                let startingAfter: string | undefined = undefined
                
                while(hasMore) {
                    const subs: Stripe.ApiList<Stripe.Subscription> = await stripe.subscriptions.list({
                        status: 'active',
                        limit: 100,
                        starting_after: startingAfter
                    })

                    subs.data.forEach(sub => {
                        sub.items.data.forEach(item => {
                            if (item.price.unit_amount) {
                                const amount = item.price.unit_amount * (item.quantity || 1)
                                if (item.price.recurring?.interval === 'year') {
                                    mrrCents += amount / 12
                                } else if (item.price.recurring?.interval === 'month') {
                                    mrrCents += amount
                                }
                            }
                        })
                    })

                    if (subs.has_more) {
                        startingAfter = subs.data[subs.data.length - 1].id
                    } else {
                        hasMore = false
                    }
                }
            } catch (stripeErr) {
                console.error("Stripe MRR Error:", stripeErr)
                hasStripeError = true
            }
        }

        console.log(`Overview generated: ${tenantStats.total} real clients.`)

        return {
            success: true,
            data: {
                tenantStats,
                automationsCount,
                mrrCents,
                hasStripeError
            }
        }
    } catch (e: any) {
        console.error('Critical Error in Overview Data:', e)
        return { success: false, error: e.message }
    }
}
