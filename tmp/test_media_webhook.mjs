import fetch from 'node-fetch';

async function testMedia() {
    console.log('--- TESTANDO WEBHOOK DE MÍDIA LOCAL ---');
    
    // Simulating the payload for a media message
    const payload = {
        event: "messages.upsert",
        instance: "CRM",
        data: {
          key: {
            remoteJid: "5511999999999@s.whatsapp.net",
            fromMe: false,
            id: "MOCK_MEDIA_ID_" + Date.now()
          },
          pushName: "Test Media User",
          message: {
            imageMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7118-24/mock.enc",
              mimetype: "image/jpeg",
              caption: "Teste de Mídia Local"
            }
          }
        }
    };

    try {
        const res = await fetch('http://localhost:3000/api/webhooks/evolution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const text = await res.text();
        console.log('Status Resposta:', res.status);
        console.log('Resposta:', text);
    } catch (err) {
        console.error('Erro na simulação:', err.message);
    }
}

testMedia();
