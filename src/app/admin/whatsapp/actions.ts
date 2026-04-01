'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as evolution from '@/lib/integrations/evolution-api'

const SETTING_KEY = 'admin_whatsapp_instance'

async function assertSuperAdmin() {
    const supabase = await createClient()
    const { data: isAdmin } = await supabase.rpc('is_super_admin')
    if (!isAdmin) throw new Error('Acesso Restrito')
    return supabase
}

export async function getAdminWhatsAppInstance() {
    try {
        await assertSuperAdmin()
        const supabaseAdmin = await createAdminClient()
        const { data } = await supabaseAdmin
            .from('admin_settings')
            .select('key_value')
            .eq('key_name', SETTING_KEY)
            .single()

        if (!data?.key_value) return { success: true, data: null }
        return { success: true, data: JSON.parse(data.key_value) }
    } catch (err: any) {
        return { success: false, error: err.message, data: null }
    }
}

export async function createAdminWhatsAppInstance(name: string, number: string, notifyNumber: string) {
    try {
        await assertSuperAdmin()
        const supabaseAdmin = await createAdminClient()

        const res = await evolution.createInstance(name, number)
        if (!res || (!res.instance && !res.account)) {
            return { success: false, error: res?.message || 'Erro ao criar conexão.' }
        }

        const instanceData = res.account || res.instance

        const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://www.mentorcrm.site'
        await evolution.configureWebhook(instanceData.instanceName, `${appUrl}/api/webhooks/evolution`)

        const credentials = {
            instanceName: instanceData.instanceName,
            instanceId: instanceData.instanceId,
            number,
            notifyNumber: notifyNumber.replace(/\D/g, ''), // número que receberá as notificações
            status: 'disconnected',
        }

        // id = SETTING_KEY para garantir upsert correto (PK da tabela é `id text`)
        const { error: upsertErr } = await supabaseAdmin
            .from('admin_settings')
            .upsert({ id: SETTING_KEY, key_name: SETTING_KEY, key_value: JSON.stringify(credentials) }, { onConflict: 'id' })

        if (upsertErr) {
            console.error('[ADMIN-WA] Upsert error:', upsertErr)
            return { success: false, error: 'Erro ao salvar configuração no banco.' }
        }

        revalidatePath('/admin/whatsapp')
        return { success: true, data: credentials }
    } catch (err: any) {
        console.error('[ADMIN-WA] Create error:', err)
        return { success: false, error: err.message || 'Erro ao conectar WhatsApp' }
    }
}

export async function getAdminWhatsAppQRCode(instanceName: string) {
    try {
        await assertSuperAdmin()
        const res = await evolution.getQRCode(instanceName)
        if (res.base64) return { success: true, qrcode: res.base64 }
        return { success: false, error: 'QR Code ainda não disponível' }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function checkAdminWhatsAppStatus(instanceName: string) {
    try {
        await assertSuperAdmin()
        const supabaseAdmin = await createAdminClient()
        const res = await evolution.getInstanceStatus(instanceName)
        const isConnected = res.instance?.state === 'open'

        if (isConnected) {
            const { data: row } = await supabaseAdmin
                .from('admin_settings')
                .select('key_value')
                .eq('key_name', SETTING_KEY)
                .single()

            if (row?.key_value) {
                const current = JSON.parse(row.key_value)
                await supabaseAdmin
                    .from('admin_settings')
                    .update({ key_value: JSON.stringify({ ...current, status: 'connected' }) })
                    .eq('key_name', SETTING_KEY)
            }
        }

        return { success: true, state: res.instance?.state }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function disconnectAdminWhatsApp(instanceName: string) {
    try {
        await assertSuperAdmin()
        const supabaseAdmin = await createAdminClient()

        try { await evolution.logoutInstance(instanceName) } catch {}
        try { await evolution.deleteInstance(instanceName) } catch {}

        await supabaseAdmin
            .from('admin_settings')
            .delete()
            .eq('key_name', SETTING_KEY)

        revalidatePath('/admin/whatsapp')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}
