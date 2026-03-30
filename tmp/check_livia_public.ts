import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkLiviaPublic() {
    const { data: users, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('full_name', '%Livia%')

    if (error) console.error(error)
    else console.log('Livia in public.users:', users)
}

checkLiviaPublic()
