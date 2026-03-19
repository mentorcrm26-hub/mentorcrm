import fetch from 'node-fetch';

async function testSimulated() {
    const payload = {
        event: "messages.upsert",
        instance: "CRM",
        data: {
            key: {
                remoteJid: "5511999999999@s.whatsapp.net",
                fromMe: false,
                id: "SIMULATED_999_" + Date.now()
            },
            pushName: "Test Lead",
            message: {
                extendedTextMessage: {
                    text: "BUG-TESTE-999 (Simulado)"
                }
            },
            messageTimestamp: Math.floor(Date.now() / 1000)
        }
    };

    console.log('--- ENVIANDO SIMULAÇÃO DE WEBHOOK PARA PRODUÇÃO ---');
    try {
        const res = await fetch('https://www.mentorcrm.site/api/webhooks/evolution', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('Resposta do Servidor (Prod):', data);
    } catch (e) {
        console.error('Erro ao conectar no servidor de produção:', e.message);
    }
}

testSimulated();
