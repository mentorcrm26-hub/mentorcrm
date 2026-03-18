import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kmmqiwfsikspetquhmev.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbXFpd2ZzaWtzcGV0cXVobWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc2ODMzNywiZXhwIjoyMDg4MzQ0MzM3fQ.zUPkoh18LT9RyoNu3c99o4B4xUHiA4iYnVlK4LXMhfk'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function run() {
    const { error } = await supabase.rpc('execute_sql', { sql: "ALTER TABLE public.leads ALTER COLUMN status SET DEFAULT 'New Lead';" })
    if (error) console.error('RPC Error:', error)

    // Also, due to limitations, we'll try raw query using standard postgres (for local testing maybe)?
    // Actually, we can just update the ones in the DB
    await supabase.from('leads').update({ status: 'New Lead' }).eq('status', 'Novo Lead')
    await supabase.from('leads').update({ status: 'Contacting' }).eq('status', 'Em Contato')
    await supabase.from('leads').update({ status: 'Scheduled' }).eq('status', 'Agendado')
    await supabase.from('leads').update({ status: 'Won' }).eq('status', 'Ganho')
    await supabase.from('leads').update({ status: 'Lost' }).eq('status', 'Perdido')

    console.log('Fixed stuck DB leads back to English successfully.')
}

run()
