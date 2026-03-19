import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf8')
const envVars = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.split('=').map(s => s.trim())))

async function applyMigration() {
    const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY)

    console.log('Applying profile fields migration...')
    
    // We try to add columns one by one using a simple query if we can, 
    // but better yet, let's explain how to do it in the dashboard if this fails.
    // However, I'll try to use a RPC if available or just inform the user.
    console.log('Please run the following SQL in your Supabase SQL Editor:')
    console.log(`
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS google_meet_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS other_meet_link TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
    `)
}

applyMigration()
