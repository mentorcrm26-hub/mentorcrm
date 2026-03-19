import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetch() {
    console.log('--- TESTANDO CONECTIVIDADE COM EVOLUTION API ---');
    
    // 1. Get real credentials
    const { data: int } = await sb.from('integrations').select('*').eq('provider', 'whatsapp').limit(1).single();
    if (!int) { console.error('No integration found'); return; }
    
    const creds = int.credentials;
    const apiUrl = creds.apiUrl || creds.url;
    const apikey = creds.apikey || creds.token;
    const instance = creds.instanceName || creds.instance;
    
    console.log(`URL: ${apiUrl}`);
    console.log(`Instância: ${instance}`);
    
    // 2. Get a recent media message ID from DB
    const { data: msg } = await sb.from('messages').select('evolution_message_id, conversation_id')
        .not('media_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1).single();
        
    if (!msg) { console.error('No media message found in DB to test'); return; }
    console.log(`Testando Mensagem ID: ${msg.evolution_message_id}`);

    // 3. Call Evolution getBase64
    try {
        const res = await fetch(`${apiUrl}/chat/getBase64FromMediaMessage/${instance}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': apikey },
            body: JSON.stringify({ message: { key: { id: msg.evolution_message_id } } })
        });
        
        console.log(`Status Evolution: ${res.status}`);
        const result = await res.json();
        
        if (result.base64) {
            console.log('SUCESSO! Base64 recebido (tamanho: ' + result.base64.length + ')');
        } else {
            console.log('FALHA! Resposta sem base64:', JSON.stringify(result));
        }
    } catch (err) {
        console.error('ERRO DE CONEXÃO:', err.message);
    }
}

testFetch();
