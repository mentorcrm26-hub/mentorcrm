import fetch from 'node-fetch';

const LIVE_URL = 'http://localhost:3000/api/webhooks/evolution';

const mockPayload = {
  "event": "messages.upsert",
  "instance": "CRM",
  "data": {
    "key": {
      "remoteJid": "14077473001@s.whatsapp.net",
      "fromMe": false,
      "id": "LIVE_TEST_" + Date.now()
    },
    "message": {
      "conversation": "TESTE LIVE às " + new Date().toLocaleTimeString()
    },
    "messageType": "conversation"
  }
};

async function testLive() {
  console.log(`Sending mock payload to ${LIVE_URL}...`);
  try {
    const res = await fetch(LIVE_URL, {
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
    console.error('Test failed!', err.message);
  }
}

testLive();
