'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'
import { sendEvolutionMessage } from '@/lib/integrations/evolution-api'

export async function getTeamRequests() {
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, data: [] }

    const supabaseAdmin = await createAdminClient()
    const { data, error } = await supabaseAdmin
        .from('team_requests')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { success: false, data: [] }
    return { success: true, data: data || [] }
}

export async function updateTeamRequestStatus(id: string, status: string) {
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin
        .from('team_requests')
        .update({ status })
        .eq('id', id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/admin/team-requests')
    return { success: true }
}

export async function sendTeamPaymentLink(requestId: string) {
    const supabaseUser = await createClient()
    const { data: isAdmin } = await supabaseUser.rpc('is_super_admin')
    if (!isAdmin) return { success: false, error: 'Acesso Restrito' }

    const supabaseAdmin = await createAdminClient()

    // Busca dados do lead
    const { data: req, error: fetchErr } = await supabaseAdmin
        .from('team_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (fetchErr || !req) return { success: false, error: 'Solicitação não encontrada.' }

    // Gera Checkout Session com email pré-preenchido
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const priceId = process.env.STRIPE_PRICE_TEAM_MONTHLY
    if (!priceId) return { success: false, error: 'STRIPE_PRICE_TEAM_MONTHLY não configurado.' }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? ''

    let checkoutUrl: string
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            customer_email: req.email,
            line_items: [{ price: priceId, quantity: 1 }],
            metadata: {
                source: 'public_checkout',
                price_key: 'team_monthly',
            },
            success_url: `${appUrl}/bem-vindo?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/assinar?plan=team&canceled=true`,
        })
        checkoutUrl = session.url!
    } catch (err: any) {
        console.error('[TEAM-LINK] Stripe error:', err)
        return { success: false, error: `Erro ao gerar link de pagamento: ${err.message}` }
    }

    // Busca instância WhatsApp do admin
    const { data: settingRow } = await supabaseAdmin
        .from('admin_settings')
        .select('key_value')
        .eq('key_name', 'admin_whatsapp_instance')
        .single()

    if (!settingRow?.key_value) {
        return { success: false, error: 'WhatsApp do admin não configurado. Acesse /admin/whatsapp para conectar.' }
    }

    const credentials = JSON.parse(settingRow.key_value)
    if (!credentials?.instanceName) {
        return { success: false, error: 'Instância WhatsApp inválida. Reconecte em /admin/whatsapp.' }
    }

    // Formata o telefone do cliente (remove tudo que não é dígito)
    const clientPhone = String(req.phone).replace(/\D/g, '')

    const firstName = req.name.split(' ')[0]

    const msg = [
        `Olá, ${firstName}! 👋`,
        ``,
        `Sou da equipe *Mentor CRM* e estou entrando em contato sobre sua solicitação do plano *Team*.`,
        ``,
        `Tudo certo para você começar! 🚀 Preparei um link de pagamento exclusivo para você:`,
        ``,
        `👉 ${checkoutUrl}`,
        ``,
        `Após o pagamento, você receberá um email com as instruções para acessar sua conta.`,
        ``,
        `Qualquer dúvida, estou à disposição! 😊`,
    ].join('\n')

    try {
        await sendEvolutionMessage(credentials.instanceName, clientPhone, msg)
    } catch (err: any) {
        console.error('[TEAM-LINK] WhatsApp send error:', err)
        return { success: false, error: `Link gerado mas falha ao enviar WhatsApp: ${err.message}` }
    }

    // Atualiza status para contacted (se ainda pendente) ou converted
    const newStatus = req.status === 'pending' ? 'contacted' : req.status
    await supabaseAdmin
        .from('team_requests')
        .update({ status: newStatus })
        .eq('id', requestId)

    revalidatePath('/admin/team-requests')
    return { success: true, checkoutUrl }
}
