
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

async function promoteUser(email) {
  console.log(`Promoting user: ${email}`)
  
  // 1. Get user ID
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) throw authError
  
  const user = users.find(u => u.email === email)
  if (!user) {
    console.error('User not found')
    return
  }

  // 2. Update role in public.users
  const { error: updateError } = await supabase
    .from('users')
    .update({ role: 'super_admin' })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating public.users:', updateError)
  } else {
    console.log('Successfully updated role to super_admin in public.users table')
  }

  // 3. Ensure they are in system_admins (already checked, but let's be sure)
  const { data: sa } = await supabase.from('system_admins').select('*').eq('id', user.id)
  if (sa.length === 0) {
    const { error: saError } = await supabase.from('system_admins').insert({ id: user.id })
    if (saError) {
      console.error('Error inserting into system_admins:', saError)
    } else {
      console.log('Added user to system_admins table')
    }
  } else {
    console.log('User already in system_admins table')
  }
}

promoteUser('mentorcrm26@gmail.com')
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
