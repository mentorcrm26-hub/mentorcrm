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
            const source  = session.metadata?.source

            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            const priceId = subscription.items.data[0]?.price.id
            const plan    = PRICE_TO_PLAN[priceId] ?? 'agent'

            // ─── PATH A: Existing user upgrading (old flow from /dashboard/settings/billing) ───
            if (userId) {
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

                const { data: userData } = await supabaseAdmin
                    .from('users')
                    .select('tenant_id')
                    .eq('id', userId)
                    .single()

                if (userData?.tenant_id) {
                    await supabaseAdmin
                        .from('tenants')
                        .update({
                            plan,
                            status: 'active',
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: subscription.id,
                        })
                        .eq('id', userData.tenant_id)
                }
                break
            }

            // ─── PATH B: New user via public checkout (payment-first flow) ───
            if (source === 'public_checkout') {
                const email    = session.customer_details?.email
                const fullName = session.customer_details?.name || 'Novo Usuário'

                if (!email) {
                    console.error('public_checkout: no email in session.customer_details')
                    break
                }

                // Check if a user with this email already exists
                const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
                const existingUser = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase())

                let targetUserId: string

                if (existingUser) {
                    // User exists (e.g. had a sandbox account) — just upgrade them
                    targetUserId = existingUser.id
                    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                        user_metadata: {
                            ...existingUser.user_metadata,
                            plan,
                            trial: false,
                            trial_ends_at: null,
                            onboarding_status: 'active',
                            subscription_status: 'active',
                            stripe_subscription_id: subscription.id,
                            stripe_customer_id: session.customer as string,
                        }
                    })
                } else {
                    // Brand new user — invite them (DB trigger will create tenant + user automatically)
                    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? ''
                    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                        email,
                        {
                            data: {
                                full_name: fullName,
                                plan,
                                onboarding_status: 'active',
                                subscription_status: 'active',
                                stripe_subscription_id: subscription.id,
                                stripe_customer_id: session.customer as string,
                            },
                            redirectTo: `${appUrl}/dashboard`,
                        }
                    )

                    if (inviteError || !inviteData?.user) {
                        console.error('Failed to invite new user:', inviteError)
                        break
                    }

                    targetUserId = inviteData.user.id
                }

                // Update tenant with Stripe details and correct plan/status
                // The DB trigger already created the tenant when user was invited,
                // so we just need to update the plan and Stripe IDs.
                const { data: userRecord } = await supabaseAdmin
                    .from('users')
                    .select('tenant_id')
                    .eq('id', targetUserId)
                    .single()

                if (userRecord?.tenant_id) {
                    await supabaseAdmin
                        .from('tenants')
                        .update({
                            plan,
                            status: 'active',
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: subscription.id,
                        })
                        .eq('id', userRecord.tenant_id)
                }
            }
            break
        }

        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription
            const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
            const user = allUsers.find(
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
                    .update({ plan, status: isActive ? 'active' : 'suspended' })
                    .eq('id', userData.tenant_id)
            }
            break
        }

        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription
            const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
            const user = allUsers.find(
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
                    .update({ plan: 'sandbox', status: 'suspended' })
                    .eq('id', userData.tenant_id)
            }
            break
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice
            const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
            const user = allUsers.find(
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
