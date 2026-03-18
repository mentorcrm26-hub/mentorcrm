const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLeads() {
    console.log('--- LEADS SCHEDULED ---')
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, name, status, apple_event_id, meeting_at, updated_at')
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log(JSON.stringify(leads, null, 2))
}

checkLeads()
