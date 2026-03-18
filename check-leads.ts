import { createClient } from './src/lib/supabase/server'

async function checkLead() {
    const supabase = await createClient()
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, name, status, meeting_at, meeting_notified, tenant_id')
        .eq('status', 'Scheduled')
        .order('meeting_at', { ascending: false })
        .limit(5)

    if (error) {
        console.error('ERROR:', error.message)
        return
    }

    console.log('--- LEADS AGENDADOS ---')
    leads.forEach(l => {
        console.log(`Lead: ${l.name} | Status: ${l.status} | MeetingAt: ${l.meeting_at} | Notified: ${JSON.stringify(l.meeting_notified)}`)
    })
}

checkLead()
