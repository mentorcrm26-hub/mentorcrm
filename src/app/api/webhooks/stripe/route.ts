import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const PRICE_TO_PLAN: Record<string, string> = {
        [process.env.STRIPE_PRICE_AGENT_MONTHLY!]: 'agent',
        [process.env.STRIPE_PRICE_AGENT_ANNUAL!]:  'agent_annual',
        [process.env.STRIPE_PRICE_TEAM_MONTHLY!]:  'team',
    }

    const body = await req.text()
    const sig  = req.headers.get('stripe-signature')!

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
        console.error('Stripe webhook signature error:', err.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session
            const userId  = session.metadata?.user_id
            if (!userId) break

            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const priceId = subscription.items.data[0]?.price.id
            const plan    = PRICE_TO_PLAN[priceId] ?? 'agent'

            await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                    plan,
                    trial: false,
                    trial_ends_at: null,
                    onboarding_status: 'active',
                    subscription_status: 'active',
                    stripe_subscription_id: subscription.id,
                    stripe_customer_id: session.customer as string,
                }
            })

            // Sincronizar o PLANO diretamente no workspace (tenant)
            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('tenant_id')
                .eq('id', userId)
                .single()
            
            if (userData?.tenant_id) {
                await supabaseAdmin
                    .from('tenants')
                    .update({ plan })
                    .eq('id', userData.tenant_id)
            }
            break
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription
            const { data: users } = await supabaseAdmin.auth.admin.listUsers()
            const user = users.users.find(
                (u) => u.user_metadata?.stripe_customer_id === subscription.customer
            )
            if (!user) break

            const isActive = subscription.status === 'active' || subscription.status === 'trialing'
            const priceId = subscription.items.data[0]?.price.id
            const plan = PRICE_TO_PLAN[priceId] ?? 'agent'

            await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    ...user.user_metadata,
                    plan,
                    subscription_status: subscription.status,
                    onboarding_status: isActive ? 'active' : 'inactive',
                }
            })

            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('tenant_id')
                .eq('id', user.id)
                .single()
            
            if (userData?.tenant_id) {
                await supabaseAdmin
                    .from('tenants')
                    .update({ plan })
                    .eq('id', userData.tenant_id)
            }
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription
            const { data: users } = await supabaseAdmin.auth.admin.listUsers()
            const user = users.users.find(
                (u) => u.user_metadata?.stripe_customer_id === subscription.customer
            )
            if (!user) break

            await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    ...user.user_metadata,
                    plan: 'sandbox',
                    subscription_status: 'canceled',
                    onboarding_status: 'inactive',
                    stripe_subscription_id: null,
                }
            })

            const { data: userData } = await supabaseAdmin
                .from('users')
                .select('tenant_id')
                .eq('id', user.id)
                .single()
            
            if (userData?.tenant_id) {
                await supabaseAdmin
                    .from('tenants')
                    .update({ plan: 'sandbox' })
                    .eq('id', userData.tenant_id)
            }
            break
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice
            const { data: users } = await supabaseAdmin.auth.admin.listUsers()
            const user = users.users.find(
                (u) => u.user_metadata?.stripe_customer_id === invoice.customer
            )
            if (!user) break

            await supabaseAdmin.auth.admin.updateUserById(user.id, {
                user_metadata: {
                    ...user.user_metadata,
                    subscription_status: 'past_due',
                }
            })
            break
        }
    }

    return NextResponse.json({ received: true })
}
