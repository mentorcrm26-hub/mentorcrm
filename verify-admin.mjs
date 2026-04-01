
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

function getEnv(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim() : null
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function diagnostic(email) {
  const info = { email, date: new Date().toISOString() }
  
  // 1. Auth Users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    info.auth_error = authError
  } else {
    const user = users.find(u => u.email === email)
    if (!user) {
      info.auth_user = 'NOT FOUND'
    } else {
      info.auth_user = {
        id: user.id,
        metadata: user.user_metadata,
        raw_metadata: user.raw_user_meta_data
      }

      // 2. public.users
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('*, tenants(*)')
        .eq('id', user.id)
        .single()
      
      if (dbError) {
        info.public_user_error = dbError.message
      } else {
        info.public_user = dbUser
      }

      // 3. system_admins
      const { data: sa, error: saError } = await supabase
        .from('system_admins')
        .select('*')
        .eq('id', user.id)
      
      if (saError) {
        info.system_admin_error = saError.message
      } else {
        info.in_system_admins = sa.length > 0
      }
    }
  }

  // 4. All system admins
  const { data: allSa } = await supabase.from('system_admins').select('*')
  info.total_system_admins = allSa?.length || 0
  info.all_system_admins = allSa

  // 5. Test RPC if possible (using supabase.rpc)
  // Note: we're using a service role client, the RPC might behave differently if it uses auth.uid()
  // RPC with auth.uid() will only return true if matched with id of current user.
  // Service role doesn't have a user id context unless we impersonate.
  
  fs.writeFileSync('diagnostic_output.json', JSON.stringify(info, null, 2))
}

diagnostic('mentorcrm26@gmail.com')
