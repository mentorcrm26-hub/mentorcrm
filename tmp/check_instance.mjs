import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function check() {
  const url = `${process.env.EVOLUTION_API_URL}/instance/connectionState/CRM`
  console.log('Checking:', url)
  const res = await fetch(url, { headers: { apikey: process.env.EVOLUTION_API_KEY } })
  const data = await res.json()
  console.log('STATUS:', JSON.stringify(data, null, 2))
}

check()
