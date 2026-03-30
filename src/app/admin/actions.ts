'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'

export async function getAdminOverviewData() {
    const supabase = await createClient()
    
    // Confirmação de segurança dupla na root do admin
    const { data: isAdmin } = await supabase.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    try {
        // 1. Estatísticas de Workspaces / Clientes
        const { data: tenants } = await supabase.from('tenants').select('status')
        const tenantStats = {
            total: tenants?.length || 0,
            active: tenants?.filter(t => t.status === 'active').length || 0,
            trial: tenants?.filter(t => t.status === 'trial').length || 0,
            suspended: tenants?.filter(t => t.status === 'suspended').length || 0
        }

        // 2. Estatísticas de Automações Ativas no Ecossistema
        const { count: automationsCount } = await supabase
            .from('automations')
            .select('*', { count: 'exact', head: true })

        // 3. Cálculo de MRR Real Puxado Dinamicamente do Stripe
        let mrrCents = 0
        let hasStripeError = false

        if (isStripeConfigured()) {
            try {
                let hasMore = true
                let startingAfter: string | undefined = undefined
                
                // Em produção real com muitos clientes, lidar com paginação
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
                                    mrrCents += amount / 12 // Rateia as anuais para achar MRR
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

        return {
            success: true,
            data: {
                tenantStats,
                automationsCount: automationsCount || 0,
                mrrCents,
                hasStripeError
            }
        }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
