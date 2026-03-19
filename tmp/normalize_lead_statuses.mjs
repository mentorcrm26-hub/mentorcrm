import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())))

async function normalizeLeads() {
    const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

    const mappings = {
        'Novo Lead': 'New Lead',
        'Em Contato': 'Contacting',
        'Contatando': 'Contacting',
        'Agendado': 'Scheduled',
        'Ganho': 'Won',
        'Perdido': 'Lost'
    }

    console.log('--- Current Leads ---')
    const { data: leads } = await supabase.from('leads').select('id, name, status')
    
    for (const lead of leads || []) {
        const newStatus = mappings[lead.status]
        if (newStatus) {
            console.log(`Updating ${lead.name}: ${lead.status} -> ${newStatus}`)
            await supabase.from('leads').update({ status: newStatus }).eq('id', lead.id)
        } else {
            console.log(`Skipping ${lead.name}: ${lead.status} (No mapping or already correct)`)
        }
    }
    
    console.log('\nNormalization complete.')
}

normalizeLeads()
