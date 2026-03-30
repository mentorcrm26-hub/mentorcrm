import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugLivia() {
    const tenantId = 'f64a6ed7-0a6b-43f6-ab16-c2f26280c637'
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('tenant_id', tenantId)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Users for Livia Workspace:', users)
    }
}

debugLivia()
