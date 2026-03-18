const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkIntegrations() {
    console.log('--- INTEGRATIONS ---')
    const { data: integrations, error } = await supabase
        .from('system_integrations')
        .select('*')

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log(JSON.stringify(integrations, null, 2))
}

checkIntegrations()
