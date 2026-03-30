'use server'

import { createClient } from '@/lib/supabase/server'
import { stripe, isStripeConfigured } from '@/lib/stripe'
import Stripe from 'stripe'

// Verify if caller is super admin
async function ensureSuperAdmin() {
    const supabase = await createClient()
    const { data: isAdmin } = await supabase.rpc('is_super_admin')
    if (!isAdmin) throw new Error('Unauthorized Access - Super Admin Only')
}

// 1. Get Balance
export async function getStripeBalance() {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, error: 'Chave do Stripe não configurada (.env.local)' }

    try {
        const balance = await stripe.balance.retrieve()
        return { success: true, data: JSON.parse(JSON.stringify(balance)) }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// 2. Get Products & Prices
export async function getStripeProducts() {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, data: [] }

    try {
        const products = await stripe.products.list({ expand: ['data.default_price'], active: true })
        
        // Also get prices for these products
        const productsWithPrices = await Promise.all(products.data.map(async (prod) => {
            const prices = await stripe.prices.list({ product: prod.id, active: true })
            return {
                id: prod.id,
                name: prod.name,
                description: prod.description,
                prices: prices.data.map(p => ({
                    id: p.id,
                    amount: p.unit_amount,
                    currency: p.currency,
                    type: p.type,
                    interval: p.recurring?.interval
                }))
            }
        }))

        return { success: true, data: JSON.parse(JSON.stringify(productsWithPrices)) }
    } catch (e: any) {
        return { success: false, error: e.message, data: [] }
    }
}

// 3. Create Price / Alter Product Value
export async function createStripePrice(productId: string, amountCents: number, interval: 'month' | 'year' = 'month') {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, error: 'Stripe Config Error' }

    try {
        const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: amountCents,
            currency: 'usd',
            recurring: { interval }
        })
        
        // Make it the default price
        await stripe.products.update(productId, { default_price: newPrice.id })
        
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// 4. Get Latest Payments (for refunds/analysis)
export async function getLatestPayments(limit = 20) {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, data: [] }

    try {
        const charges = await stripe.charges.list({ limit })
        const formatted = charges.data.map(c => ({
            id: c.id,
            amount: c.amount,
            status: c.status, // succeeded, failed, pending
            created: c.created,
            receipt_email: c.billing_details.email || c.receipt_email,
            refunded: c.refunded,
            failure_message: c.failure_message,
            payment_intent: c.payment_intent
        }))
        return { success: true, data: JSON.parse(JSON.stringify(formatted)) }
    } catch (e: any) {
        return { success: false, error: e.message, data: [] }
    }
}

// 5. Issue Refund
export async function issueRefund(chargeId: string) {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, error: 'Stripe Config Error' }

    try {
        await stripe.refunds.create({ charge: chargeId })
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// 6. Manual Payout (Transfer to connected bank account)
export async function requestPayout(amountCents: number) {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, error: 'Stripe Config Error' }

    try {
        await stripe.payouts.create({
            amount: amountCents,
            currency: 'usd',
        })
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// 7. List Active Subscriptions
export async function getActiveSubscriptions(limit = 20) {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, data: [] }

    try {
        const subs = await stripe.subscriptions.list({
            status: 'active',
            limit,
            expand: ['data.customer']
        })

        const formatted = subs.data.map((s: any) => {
            const customer = s.customer
            return {
                id: s.id,
                status: s.status,
                created: s.created,
                current_period_end: s.current_period_end,
                cancel_at_period_end: s.cancel_at_period_end,
                amount: (s.items.data[0]?.price.unit_amount || 0) * (s.items.data[0]?.quantity || 1),
                interval: s.items.data[0]?.price.recurring?.interval,
                customer_email: customer?.email || 'N/A',
                customer_name: customer?.name || 'Sem Nome'
            }
        })

        return { success: true, data: JSON.parse(JSON.stringify(formatted)) }
    } catch (e: any) {
        return { success: false, error: e.message, data: [] }
    }
}

// 8. Cancel Subscription (Kill Switch)
export async function cancelStripeSubscription(subId: string) {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, error: 'Stripe Config Error' }

    try {
        await stripe.subscriptions.cancel(subId)
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// 9. Generate Checkout / Payment Link for a Price
export async function generatePaymentLink(priceId: string) {
    await ensureSuperAdmin()
    if (!isStripeConfigured()) return { success: false, error: 'Stripe Config Error' }

    try {
        const link = await stripe.paymentLinks.create({
            line_items: [{ price: priceId, quantity: 1 }]
        })
        return { success: true, data: link.url }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
