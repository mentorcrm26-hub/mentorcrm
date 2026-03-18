import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = 'CRM'
// Using the production URL as found in .env.local
const WEBHOOK_URL = 'https://www.mentorcrm.site/api/webhooks/evolution'

async function updateWebhook() {
  console.log(`Updating webhook for ${INSTANCE} to ${WEBHOOK_URL}...`)
  
  const payload = {
    webhook: {
      enabled: true,
      url: WEBHOOK_URL,
      webhookByEvents: false,
      webhookBase64: true,
      events: ["MESSAGES_UPSERT"]
    }
  }

  const res = await fetch(`${API_URL}/webhook/set/${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': API_KEY
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    console.error(`FAILED: ${res.status}`)
    const text = await res.text()
    console.error(text)
    return
  }
  
  const data = await res.json()
  console.log('SUCCESS:', JSON.stringify(data, null, 2))
}

updateWebhook()
