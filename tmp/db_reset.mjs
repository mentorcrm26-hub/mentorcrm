import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function reset() {
  console.log('--- STARTING DATABASE RESET ---')

  const tables = [
    'messages',
    'conversations',
    'lead_notes',
    'automations',
    'message_templates', // Based on the approved plan
    'leads'
  ]

  for (const table of tables) {
    console.log(`Clearing table: ${table}...`)
    try {
      const { error } = await sb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000') // Deleta tudo
      if (error) {
        console.error(`Error clearing ${table}:`, error.message)
      } else {
        console.log(`Table ${table} cleared.`)
      }
    } catch (err) {
      console.error(`Exception clearing ${table}:`, err.message)
    }
  }

  console.log('--- RESET COMPLETE ---')
}

reset()
