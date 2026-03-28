/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server';
import { AutomationsManagementClient } from './automations-management-client';

export default async function AutomationsPage() {
    const supabase = await createClient();

    const { data: automations } = await supabase
        .from('automations')
        .select('*, template:message_templates(name, type)')
        .order('created_at', { ascending: false });

    const { data: templates } = await supabase
        .from('message_templates')
        .select('id, name, type')
        .order('name');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic tracking-tight">
                    Smart Automations
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Define when e-mails or WhatsApp messages should be sent automatically.
                </p>
            </div>

            <AutomationsManagementClient 
                initialAutomations={automations || []} 
                templates={templates || []}
            />
        </div>
    );
}
