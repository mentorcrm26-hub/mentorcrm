import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())))

async function checkSchema() {
    const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'users' })
    
    if (colError) {
        // Fallback: try to select one row
        const { data: user, error: userError } = await supabase.from('users').select('*').limit(1).single()
        if (user) {
            console.log('--- User Object Keys ---')
            console.log(Object.keys(user))
        } else {
            console.error('Error fetching user for schema:', userError)
        }
    } else {
        console.log('--- Users Table Columns ---')
        console.log(cols)
    }
}

checkSchema()
