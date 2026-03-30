import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkLiviaAuth() {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    const livia = users.find(u => u.user_metadata?.full_name === 'Livia Maria')
    console.log('Livia Auth Metadata:', livia?.user_metadata)
    console.log('Livia Email:', livia?.email)
}

checkLiviaAuth()
