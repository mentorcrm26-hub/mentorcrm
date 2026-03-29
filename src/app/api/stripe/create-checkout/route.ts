import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICE_MAP: Record<string, string> = {
    agent_monthly: process.env.STRIPE_PRICE_AGENT_MONTHLY!,
    agent_annual:  process.env.STRIPE_PRICE_AGENT_ANNUAL!,
    team_monthly:  process.env.STRIPE_PRICE_TEAM_MONTHLY!,
}

export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceKey } = await req.json()
    const priceId = PRICE_MAP[priceKey]

    if (!priceId) {
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: user.email,
        metadata: {
            user_id: user.id,
            price_key: priceKey,
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}dashboard/settings/billing?success=true`,
        cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}dashboard/settings/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
}
