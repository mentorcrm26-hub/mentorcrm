import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data, error } = await sb
        .from('integrations')
        .select('credentials')
        .eq('provider', 'whatsapp')
        .limit(1);

    if (error) {
        console.error('Erro:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('--- CREDENCIAIS ENCONTRADAS ---');
        console.log(JSON.stringify(data[0].credentials, null, 2));
    } else {
        console.log('Nenhuma integração WhatsApp encontrada.');
    }
}

main();
