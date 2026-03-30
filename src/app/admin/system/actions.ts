'use server'

import { createClient } from '@/lib/supabase/server'
import { isStripeConfigured } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'

async function ensureSuperAdmin() {
    const supabase = await createClient()
    const { data: isAdmin } = await supabase.rpc('is_super_admin')
    if (!isAdmin) throw new Error('Unauthorized Access')
}

export async function getSystemHealth() {
    await ensureSuperAdmin()

    // 1. Supabase Database check
    let dbStatus = 'ok'
    let dbLatency = 0
    let dbError = null
    try {
        const supabase = await createClient()
        const start = Date.now()
        const { error } = await supabase.from('system_admins').select('id').limit(1)
        if (error) throw error
        dbLatency = Date.now() - start
    } catch (e: any) {
        dbStatus = 'error'
        dbError = e.message
    }

    // 2. Stripe Gateway
    const stripeStatus = isStripeConfigured() ? 'ok' : 'missing'

    // 3. Evolution API (WhatsApp)
    let evoStatus = 'ok'
    let evoLatency = 0
    let evoError = null
    const evoUrl = process.env.EVOLUTION_API_URL
    const evoKey = process.env.EVOLUTION_API_KEY
    if (!evoUrl || !evoKey) {
        evoStatus = 'missing'
    } else {
        try {
            const start = Date.now()
            // Timeout to prevent hanging the page if Evo is down
            const controller = new AbortController()
            const id = setTimeout(() => controller.abort(), 3000)
            
            // Just a lightweight request to check if Evo is responding
            const res = await fetch(`${evoUrl}/instance/fetchInstances`, {
                headers: { 'apikey': evoKey },
                signal: controller.signal
            })
            clearTimeout(id)
            
            if (!res.ok) {
                evoStatus = 'warning'
                evoError = `HTTP ${res.status}`
            }
            evoLatency = Date.now() - start
        } catch (e: any) {
            evoStatus = 'error'
            evoError = e.message || 'Connection Refused'
        }
    }

    // 4. OpenAI + Resend (Just config presence checks)
    const resendStatus = !!process.env.RESEND_API_KEY ? 'ok' : 'missing'
    const openaiStatus = !!process.env.OPENAI_API_KEY ? 'ok' : 'missing'

    return {
        success: true,
        data: {
            database: { status: dbStatus, latencyMs: dbLatency, error: dbError },
            stripe: { status: stripeStatus },
            evolution: { status: evoStatus, latencyMs: evoLatency, error: evoError },
            resend: { status: resendStatus },
            openai: { status: openaiStatus }
        }
    }
}

// Global Next.js Router Cache Flush (Super useful for admin changes like landing page)
export async function clearGlobalCache() {
    await ensureSuperAdmin()
    try {
        revalidatePath('/', 'layout') // Flushes entire app cache
        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
