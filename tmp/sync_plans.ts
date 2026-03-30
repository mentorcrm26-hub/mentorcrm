import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function syncPlans() {
    console.log('--- SYNCING PLANS FROM AUTH METADATA TO TENANTS TABLE ---')
    
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: { users }, error: userErr } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userErr) {
        console.error('Error listing users:', userErr)
        return
    }

    console.log(`Found ${users.length} users in Auth.`)

    for (const authUser of users) {
        const plan = authUser.user_metadata?.plan || 'sandbox'
        
        // Find the tenant for this user
        const { data: dbUser } = await supabaseAdmin
            .from('users')
            .select('tenant_id')
            .eq('id', authUser.id)
            .single()
        
        if (dbUser?.tenant_id) {
            console.log(`Updating tenant ${dbUser.tenant_id} to plan: ${plan}`)
            const { error: updateErr } = await supabaseAdmin
                .from('tenants')
                .update({ plan })
                .eq('id', dbUser.tenant_id)
            
            if (updateErr) {
                console.error(`Error updating tenant ${dbUser.tenant_id}:`, updateErr)
            }
        }
    }

    console.log('--- SYNC COMPLETED ---')
}

syncPlans()
