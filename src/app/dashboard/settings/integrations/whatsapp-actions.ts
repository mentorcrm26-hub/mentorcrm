
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import * as evolution from '@/lib/integrations/evolution-api'

export async function createWhatsAppInstance(name: string, number: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Get tenant
  const { data: userProfile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!userProfile?.tenant_id) return { success: false, error: 'Tenant not found' }

  try {
    // 1. Create instance in Evolution API
    const res = await evolution.createInstance(name, number)
    console.log('[WA-ACTION] Create response:', JSON.stringify(res))
    
    if (!res || (!res.instance && !res.account)) {
      return { success: false, error: res?.message || 'Erro ao criar conexão. Verifique se a URL e a API Key estão corretas.' }
    }

    const instanceData = res.account || res.instance;

    // 2. Automate Webhook Setup
    // Fallback to prod URL if env variable is not set
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://www.mentorcrm.site';
    await evolution.configureWebhook(instanceData.instanceName, `${appUrl}/api/webhooks/evolution`);

    // 3. Save in DB
    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        tenant_id: userProfile.tenant_id,
        provider: 'whatsapp',
        credentials: { 
          instanceName: instanceData.instanceName,
          instanceId: instanceData.instanceId,
          number: number,
          status: 'disconnected'
        },
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'tenant_id,provider'
      })

    if (upsertError) throw upsertError

    revalidatePath('/dashboard/settings/integrations')
    return { success: true, data: instanceData }
  } catch (err: any) {
    console.error('WhatsApp Create Error:', err)
    return { success: false, error: err.message || 'Erro ao conectar ao serviço de WhatsApp' }
  }
}

export async function getWhatsAppQRCode(instanceName: string) {
  try {
    const res = await evolution.getQRCode(instanceName)
    if (res.base64) {
      return { success: true, qrcode: res.base64 }
    }
    return { success: false, error: 'QR Code not available yet' }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function checkWhatsAppStatus(instanceName: string) {
  const supabase = await createClient()
  
  try {
    const res = await evolution.getInstanceStatus(instanceName)
    const status = res.instance?.state === 'open' ? 'connected' : 'disconnected'
    
    // Update status in DB if changed
    if (status === 'connected') {
       const { data: { user } } = await supabase.auth.getUser()
       if (user) {
         const { data: userProfile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
         if (userProfile) {
           // Get current credentials to merge
           const { data: integration } = await supabase.from('integrations').select('credentials').eq('tenant_id', userProfile.tenant_id).eq('provider', 'whatsapp').single()
           
           if (integration) {
             await supabase.from('integrations').update({
               credentials: { ...integration.credentials, status: 'connected' }
             }).eq('tenant_id', userProfile.tenant_id).eq('provider', 'whatsapp')
           }
         }
       }
    }

    return { success: true, state: res.instance?.state }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function disconnectWhatsApp(instanceName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: userProfile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
  if (!userProfile) return { success: false, error: 'Tenant error' }

  try {
    await evolution.logoutInstance(instanceName)
    await evolution.deleteInstance(instanceName)
    
    await supabase.from('integrations').delete().eq('tenant_id', userProfile.tenant_id).eq('provider', 'whatsapp')
    
    revalidatePath('/dashboard/settings/integrations')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
