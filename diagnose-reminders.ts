import { createAdminClient } from './src/lib/supabase/server';
import { getFloridaDate, formatFlorida } from './src/lib/timezone';
import { subMinutes, addMinutes } from 'date-fns';

async function diagnose() {
    const supabase = await createAdminClient();
    const now = getFloridaDate();
    
    console.log('--- DIAGNOSTIC START ---');
    console.log('Now (Florida):', formatFlorida(now));
    
    // 1. Fetch leads in the window
    const { data: leads, error: leadError } = await supabase
        .from('leads')
        .select('*, tenant:tenants(id, name)')
        .not('meeting_at', 'is', null)
        .eq('status', 'Scheduled');

    if (leadError) console.error('Lead Error:', leadError);
    
    console.log('Total Scheduled Leads Found:', leads?.length || 0);

    for (const lead of leads || []) {
        const meetingAt = getFloridaDate(lead.meeting_at);
        const diffMinutes = Math.round((meetingAt.getTime() - now.getTime()) / (60 * 1000));
        
        console.log(`\nLead: ${lead.name}`);
        console.log(`Meeting At: ${lead.meeting_at} (Florida: ${formatFlorida(meetingAt)})`);
        console.log(`Diff Minutes: ${diffMinutes}`);
        console.log(`Notified:`, lead.meeting_notified);
        console.log(`Status: ${lead.status}`);
        console.log(`Tenant ID: ${lead.tenant_id}`);

        // 2. Fetch Settings
        const { data: config, error: configError } = await supabase
            .from('appointment_settings')
            .select('*, reminder_1h:reminder_1h_template_id(content), reminder_30m:reminder_30m_template_id(content)')
            .eq('tenant_id', lead.tenant_id)
            .single();

        if (configError) console.log('Config Error:', configError.message);
        else {
            console.log('Config Found:', !!config);
            console.log('Template 1h Found:', !!config?.reminder_1h);
        }
    }
    console.log('\n--- DIAGNOSTIC END ---');
}

diagnose();
