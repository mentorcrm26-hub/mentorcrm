import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

async function checkLeads() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: users, error: userError } = await supabase.from('users').select('*')
    console.log('--- Users ---')
    console.log(users)

    const { data: leads, error: leadError } = await supabase.from('leads').select('*')
    console.log('\n--- All Leads ---')
    console.log(leads?.map(l => ({ id: l.id, status: l.status, tenant_id: l.tenant_id, user_id: l.user_id, name: l.name })))
    
    if (leads) {
        console.log(`\nTotal count: ${leads.length}`)
    }
}

checkLeads()
