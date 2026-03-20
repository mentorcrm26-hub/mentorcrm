import fetch from 'node-fetch';

async function test() {
    const url = 'https://inovamkt-evolution-api.b4jfas.easypanel.host/message/sendText/Daian';
    const body = {
        number: '14077473001',
        options: { delay: 1200, presence: 'composing' },
        textMessage: { text: "Test Cron Message from NodeJS" }
    };
    
    console.log('Sending to', url);
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': '429683C4C977415CAAFCCE10F7D57E11'
        },
        body: JSON.stringify(body)
    });
    
    const data = await res.json();
    console.log('Evolution response:', data);
}
test();
