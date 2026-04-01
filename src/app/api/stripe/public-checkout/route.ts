import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const PRICE_MAP: Record<string, string | undefined> = {
    agent_monthly: process.env.STRIPE_PRICE_AGENT_MONTHLY,
    agent_annual: process.env.STRIPE_PRICE_AGENT_ANNUAL,
}

export async function GET(request: NextRequest) {
    const plan = request.nextUrl.searchParams.get('plan')

    if (!plan || !PRICE_MAP[plan]) {
        return NextResponse.redirect(new URL('/assinar?plan=agent_monthly', request.url))
    }

    const priceId = PRICE_MAP[plan]!
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? ''

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        billing_address_collection: 'auto',
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
            price_key: plan,
            source: 'public_checkout',
        },
        success_url: `${appUrl}/bem-vindo?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/assinar?plan=${plan}&canceled=true`,
    })

    return NextResponse.redirect(session.url!)
}
