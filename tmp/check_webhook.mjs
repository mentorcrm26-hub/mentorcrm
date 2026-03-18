import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const API_URL = process.env.EVOLUTION_API_URL
const API_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = 'CRM'

async function checkWebhook() {
  console.log(`Checking webhook for instance: ${INSTANCE}`)
  const res = await fetch(`${API_URL}/webhook/find/${INSTANCE}`, {
    method: 'GET',
    headers: {
      'apikey': API_KEY
    }
  })
  
  if (!res.ok) {
    console.error(`Failed to fetch webhook info: ${res.status}`)
    const text = await res.text()
    console.error(text)
    return
  }
  
  const data = await res.json()
  console.log('Webhook Config:', JSON.stringify(data, null, 2))
}

checkWebhook()
