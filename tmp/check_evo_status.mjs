import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    const url = `https://inovamkt-evolution-api.b4jfas.easypanel.host/instance/connectionState/CRM`;
    console.log('Checking status...');
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'apikey': '429683C4C977415CAAFCCE10F7D57E11'
        }
    });
    
    const data = await res.json();
    console.log('Instance Status:', data);
}
test();
