import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Manually parse .env because dotenv.config() might fail in some environments if not in root
const env = fs.readFileSync('.env.local', 'utf8')
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())))

async function checkLeads() {
    const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

    const { data: leads, error: leadError } = await supabase.from('leads').select('name, status, is_archived')
    
    if (leadError) {
        console.error(leadError)
        return
    }

    console.log('\n--- Leads Analysis ---')
    leads.forEach(l => {
        console.log(`Name: ${l.name}, Status: ${l.status}, Archived: ${l.is_archived}`)
    })
    
    const active = leads.filter(l => !l.is_archived).length
    const archived = leads.filter(l => l.is_archived).length
    
    console.log(`\nActive: ${active}`)
    console.log(`Archived: ${archived}`)
    console.log(`Total: ${leads.length}`)
}

checkLeads()
