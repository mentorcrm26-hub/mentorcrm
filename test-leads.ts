import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { getFloridaDate, formatFlorida } from './src/lib/timezone'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function test() {
    const now = getFloridaDate()
    console.log('Now (Florida):', formatFlorida(now))

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .ilike('name', '%Daian%')
    
    console.log('--- LEADS FOUND ---')
    leads?.forEach(l => {
        const meetingAt = l.meeting_at ? getFloridaDate(l.meeting_at) : null
        const diff = meetingAt ? Math.round((meetingAt.getTime() - now.getTime()) / (60 * 1000)) : null
        
        console.log({
            id: l.id,
            name: l.name,
            phone: l.phone,
            status: l.status,
            meeting_at: l.meeting_at,
            meeting_notified: l.meeting_notified,
            diff_minutes: diff
        })
    })
}

test()
