import fetch from 'node-fetch';

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/evolution';

const mockPayload = {
  "event": "messages.upsert",
  "instance": "CRM",
  "data": {
    "messages": [
      {
        "key": {
          "remoteJid": "5511999999999@s.whatsapp.net",
          "fromMe": false,
          "id": "TEST_MSG_" + Date.now()
        },
        "message": {
          "conversation": "Teste de mensagem inbound LOCAL " + new Date().toLocaleTimeString()
        }
      }
    ]
  }
};

async function testWebhook() {
  console.log(`Sending mock payload to ${WEBHOOK_URL}...`);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockPayload)
    });

    console.log(`Response Status: ${res.status}`);
    const data = await res.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Connection failed! Make sure the server is running on port 3000.', err.message);
  }
}

testWebhook();
