import fetch from 'node-fetch'
import 'dotenv/config'

const testWebhook = async () => {
    // Endereço local onde o CRM está rodando
    const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/webhooks/evolution'
    
    const payload = {
        event: 'messages.upsert',
        instance: 'CRM', // Nome do seu instance (presumo ser CRM)
        data: {
            key: {
                remoteJid: '5511999999999@s.whatsapp.net',
                fromMe: false,
                id: 'TEST_MSG_' + Date.now()
            },
            message: {
                conversation: 'Teste de mensagem inbound (Lead para CRM) ' + new Date().toLocaleTimeString()
            }
        }
    }

    console.log('--- TESTANDO WEBHOOK LOCAL ---')
    try {
        const res = await fetch(LOCAL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        const data = await res.json()
        console.log('Status:', res.status)
        console.log('Resposta:', data)
        console.log('--- TESTE CONCLUÍDO ---')
    } catch (err) {
        console.error('Erro ao testar webhook local:', err.message)
    }
}

testWebhook()
