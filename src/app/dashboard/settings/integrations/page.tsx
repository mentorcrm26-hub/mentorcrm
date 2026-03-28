/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { WhatsAppIntegrationCard } from './whatsapp-integration-card'
import { CalendarIntegrationsClient } from './calendar-integrations-client'
import { ApiKeyManagement } from './api-key-management'
import { createClient } from '@/lib/supabase/server'

export default async function IntegrationsPage() {
    const supabase = await createClient()

    // Retrieve active integrations status
    const { data: integrations } = await supabase
        .from('integrations')
        .select('provider, credentials')

    const hasApple = integrations?.some(i => i.provider === 'apple') || false
    const hasGoogle = integrations?.some(i => i.provider === 'google') || false
    const whatsappData = integrations?.find(i => i.provider === 'whatsapp')

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
                <WhatsAppIntegrationCard initialData={whatsappData} />
                
                {/* Outras integrações futuras podem ir aqui */}
            </div>

            <ApiKeyManagement />

            <CalendarIntegrationsClient
                initialApple={hasApple}
                initialGoogle={hasGoogle}
            />
        </div>
    )
}
