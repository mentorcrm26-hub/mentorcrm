import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkColumns() {
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching users:', error)
    } else {
        console.log('Columns in users:', Object.keys(users[0] || {}))
    }
}

checkColumns()
