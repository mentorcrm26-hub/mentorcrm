import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const PRICE_TO_PLAN: () => Record<string, string> = () => ({
    [process.env.STRIPE_PRICE_AGENT_MONTHLY!]: 'agent',
    [process.env.STRIPE_PRICE_AGENT_ANNUAL!]:  'agent',
    [process.env.STRIPE_PRICE_TEAM_MONTHLY!]:  'team',
})

export async function POST(req: NextRequest) {
    // Auth check — must be logged in
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subscriptionId } = await req.json()
    if (!subscriptionId) return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)

    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return NextResponse.json({ error: `Subscription status is "${subscription.status}", not active.` }, { status: 400 })
    }

    const priceId = subscription.items.data[0]?.price.id
    const plan    = PRICE_TO_PLAN()[priceId] ?? 'agent'

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
            ...user.user_metadata,
            plan,
            trial: false,
            trial_ends_at: null,
            onboarding_status: 'active',
            subscription_status: 'active',
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
        }
    })

    return NextResponse.json({ success: true, plan })
}
