import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function run() {
    console.log('🚀 Setting up chat media...')
    
    // Create storage bucket
    const { data: bucket, error: bucketErr } = await sb.storage.createBucket('chat-media', { public: true })
    if (bucketErr && !bucketErr.message.includes('already exists')) {
        console.error('❌ Bucket error:', bucketErr.message)
    } else {
        console.log('✅ Bucket "chat-media" ready')
    }

    // Run SQL via a raw query using the admin client
    const { error: colErr } = await sb.from('messages').select('media_url').limit(1)
    if (colErr && colErr.message.includes('does not exist')) {
        console.log('⚠️  media_url column missing - apply migration manually in Supabase dashboard')
    } else {
        console.log('✅ media_url column already exists in messages table')
    }

    console.log('\n📋 Action required if columns missing:')
    console.log('   Run this SQL in the Supabase dashboard > SQL Editor:')
    console.log('   ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;')
    console.log('   ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_type TEXT;')
}

run().catch(console.error)
