/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { TemplatesManagementClient } from './templates-management-client';

export default async function TemplatesPage() {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    const { data: { user } } = await supabase.auth.getUser()

    // Retrieve tenant info with admin credentials
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

    // WhatsApp features are locked unless on Team plan OR the user is VIP
    const whatsappLocked = !isVip && plan !== 'team'

    const { data: templates } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight">
                    Message Templates
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Create and manage templates for Email and WhatsApp notifications.
                </p>
            </div>

            <TemplatesManagementClient initialTemplates={templates || []} whatsappLocked={whatsappLocked} />
        </div>
    );
}
