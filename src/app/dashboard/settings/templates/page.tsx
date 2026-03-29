/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server';
import { TemplatesManagementClient } from './templates-management-client';

export default async function TemplatesPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser()
    const plan = user?.user_metadata?.plan as string | undefined
    const whatsappLocked = plan != null && plan !== 'team'

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
