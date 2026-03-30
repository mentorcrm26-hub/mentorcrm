/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { WhatsAppIntegrationCard } from './whatsapp-integration-card'
import { TwilioIntegrationCard } from './twilio-integration-card'
import { CalendarIntegrationsClient } from './calendar-integrations-client'
import { ApiKeyManagement } from './api-key-management'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export default async function IntegrationsPage() {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Retrieve tenant info using admin client
    const { data: userProfile } = await adminSupabase
        .from('users')
        .select(`
            role, 
            tenant_id,
            tenants (
                plan, 
                is_vip
            )
        `)
        .eq('id', user?.id)
        .single()

    const tenantData = (userProfile?.tenants as any)
    const tenant = Array.isArray(tenantData) ? tenantData[0] : tenantData
    const isVip = tenant?.is_vip === true
    const plan = tenant?.plan || user?.user_metadata?.plan || 'sandbox'

    // WhatsApp is only available on Team plan. Agent/Sandbox are locked, unless the user is VIP.
    const whatsappLocked = !isVip && plan !== 'team'

    // Retrieve active integrations status
    const { data: integrations } = await supabase
        .from('integrations')
        .select('provider, credentials')

    const hasApple = integrations?.some(i => i.provider === 'apple') || false
    const hasGoogle = integrations?.some(i => i.provider === 'google') || false
    const whatsappData = integrations?.find(i => i.provider === 'whatsapp')
    const twilioData = integrations?.find(i => i.provider === 'twilio')

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Integrations</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Connect third-party services like WhatsApp and Calendar to automate your CRM.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WhatsApp Automation */}
                <WhatsAppIntegrationCard initialData={whatsappData} locked={whatsappLocked} />
                
                {/* Twilio SMS */}
                <TwilioIntegrationCard initialData={twilioData} />
            </div>

            <CalendarIntegrationsClient
                initialApple={hasApple}
                initialGoogle={hasGoogle}
            />

            <ApiKeyManagement />
        </div>
    )
}
