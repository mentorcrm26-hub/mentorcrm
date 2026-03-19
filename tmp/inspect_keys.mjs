import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data } = await sb.from('integrations').select('credentials').eq('provider', 'whatsapp').limit(1);
    const creds = data[0].credentials;
    console.log('--- KEYS ---');
    console.log(Object.keys(creds));
    console.log('--- VALUES (Redacted) ---');
    for (const key in creds) {
        console.log(`${key}: ${typeof creds[key]} (length: ${String(creds[key]).length})`);
    }
}

main();
