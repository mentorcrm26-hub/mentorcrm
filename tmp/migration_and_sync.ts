import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setupAndSync() {
    console.log('--- STARTING SYNC ---')

    // 1. Add plan column (if missing)
    // We try to update a non-existent column, if it fails with specific "column does not exist" error, 
    // it's harder in SDK. But I'll just try to select and catch error.
    const { data: testData, error: testErr } = await supabaseAdmin
        .from('tenants')
        .select('plan')
        .limit(1)

    if (testErr && testErr.code === '42703') {
        console.log('Column "plan" is missing. Please add it via Supabase SQL Editor:')
        console.log('ALTER TABLE public.tenants ADD COLUMN plan text DEFAULT \'sandbox\';')
        // return
    } else {
        console.log('Column "plan" exists.')
    }

    // 2. Sync plans from Auth metadata
    const { data: { users }, error: userErr } = await supabaseAdmin.auth.admin.listUsers()
    if (userErr) {
        console.error('Error listing users:', userErr)
    } else {
        console.log(`Found ${users.length} users in Auth.`)
        for (const authUser of users) {
             const plan = authUser.user_metadata?.plan || 'sandbox'
             
             // Buscar o tenant_id do usuário no banco público
             const { data: dbUser } = await supabaseAdmin
                 .from('users')
                 .select('tenant_id')
                 .eq('id', authUser.id)
                 .single()
             
             if (dbUser?.tenant_id) {
                 console.log(`Updating tenant ${dbUser.tenant_id} to plan: ${plan}`)
                 await supabaseAdmin
                     .from('tenants')
                     .update({ plan })
                     .eq('id', dbUser.tenant_id)
             }
        }
    }

    console.log('--- SYNC COMPLETED ---')
}

setupAndSync()
