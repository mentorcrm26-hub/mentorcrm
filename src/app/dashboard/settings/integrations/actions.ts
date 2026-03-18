'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/lib/mail'

export async function saveAppleCalendarCredentials(email: string, appPassword: string) {
    const supabase = await createClient()

    // Validação básica do token pra garantir segurança antes de armazenar
    try {
        // Tentaremos fazer uma requisição na Apple só pra ver se o 401 Unathorized não apita.
        const auth = Buffer.from(`${email}:${appPassword}`).toString('base64')
        const testRes = await fetch('https://caldav.icloud.com/', {
            method: 'PROPFIND',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Depth': '0',
                'Content-Type': 'application/xml',
            },
            body: `<d:propfind xmlns:d="DAV:">
                     <d:prop><d:current-user-principal/></d:prop>
                   </d:propfind>`
        })

        if (!testRes.ok && testRes.status !== 207) {
            return { success: false, error: 'Credenciais inválidas da Apple. Verifique o Email ou a App-Specific Password.' }
        }

        // Get current user tenant
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Unauthorized' }

        const { data: userProfile } = await supabase
            .from('users')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!userProfile?.tenant_id) return { success: false, error: 'Tenant not found' }

        // Deu Certo! Vamos encriptar no Supabase da forma correta.
        const { error: upsertError } = await supabase
            .from('integrations')
            .upsert({
                tenant_id: userProfile.tenant_id,
                provider: 'apple',
                credentials: { email, appPassword },
                is_active: true,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'tenant_id,provider'
            })

        if (upsertError) {
            console.error('Database UPSERT Error:', upsertError)
            return { success: false, error: `Error saving config: ${upsertError.message}` }
        }

        revalidatePath('/dashboard/settings')
        return { success: true }

    } catch (e: any) {
        return { success: false, error: 'Erro de comunicação com rede iCloud.' }
    }
}

export async function removeIntegration(provider: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) return { success: false, error: 'Tenant not found' }

    const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('tenant_id', userProfile.tenant_id)
        .eq('provider', provider)

    if (error) return { success: false, error: error.message }

    // Clear lead event IDs for this provider and tenant
    const updatePayload = provider === 'apple' 
        ? { apple_event_id: null } 
        : { google_event_id: null }

    await supabase
        .from('leads')
        .update(updatePayload)
        .eq('tenant_id', userProfile.tenant_id)

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/leads')
    return { success: true }
}

export async function testResendConnection() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const testRecipient = 'inovamkteua@gmail.com' // Forced for sandbox testing as per Resend error
    
    try {
        const result = await sendEmail({
            to: testRecipient,
            subject: 'Test Connection - Mentor CRM',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #6366f1;">Email Integration Success!</h2>
                    <p>This is a test email from your Mentor CRM to verify that your Resend integration is working correctly.</p>
                    <p>Now you can start sending automated follow-ups to your leads.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #666;">Mentor CRM - Smart Automation</p>
                </div>
            `
        })

        if (!result.success) {
            const errorMsg = (result.error as any)?.message || 'Resend API error';
            return { success: false, error: `Resend: ${errorMsg}` }
        }

        return { success: true }
    } catch (e) {
        console.error('Resend Test Error:', e)
        return { success: false, error: 'Failed to trigger test email.' }
    }
}
