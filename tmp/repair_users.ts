import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function repairUsers() {
    console.log('--- REPAIRING USERS (Syncing email/phone from Auth) ---')
    
    // 1. List all auth users
    const { data: { users: authUsers }, error: authErr } = await supabaseAdmin.auth.admin.listUsers()
    if (authErr) {
        console.error('Auth error:', authErr)
        return
    }

    console.log(`Checking ${authUsers.length} users...`)

    for (const authUser of authUsers) {
        const email = authUser.email
        const phone = authUser.user_metadata?.phone || null
        const fullName = authUser.user_metadata?.full_name || null

        console.log(`User: ${email} | Phone: ${phone} | Name: ${fullName}`)

        const updateData: any = {}
        if (email) updateData.email = email
        if (phone) updateData.phone = phone
        if (fullName) updateData.full_name = fullName

        const { error: updateErr } = await supabaseAdmin
            .from('users')
            .update(updateData)
            .eq('id', authUser.id)
        
        if (updateErr) {
            console.error(`Error updating ${authUser.id}:`, updateErr)
        } else {
            console.log(`Updated ${authUser.id} successfully.`)
        }
    }

    console.log('--- REPAIR COMPLETED ---')
}

repairUsers()
