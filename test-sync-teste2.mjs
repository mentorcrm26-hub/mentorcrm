import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { google } from 'googleapis'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function syncTeste2() {
  const { data: lead } = await supabase.from('leads').select('*').eq('name', 'Teste 2').single()
  if (!lead) {
      console.log('Lead Teste 2 NOT found.')
      return
  }

  const { data: integrations } = await supabase.from('system_integrations').select('*')
  const googleIntegration = integrations?.find(i => i.provider === 'google')

  if (!googleIntegration) {
      console.log('Google integration NOT found.')
      return
  }

  console.log('Syncing Teste 2...')
  
  const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  )

  oauth2Client.setCredentials(googleIntegration.credentials.tokens)
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const dStart = new Date(lead.meeting_at)
  const dEnd = new Date(dStart.getTime() + 60 * 60 * 1000)

  const event = {
      summary: `Call with ${lead.name}`,
      description: `Test sync.`,
      start: { dateTime: dStart.toISOString() },
      end: { dateTime: dEnd.toISOString() },
  }

  try {
      const res = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
      })
      console.log('SUCCESS! Event ID:', res.data.id)
      await supabase.from('leads').update({ google_event_id: res.data.id }).eq('id', lead.id)
      console.log('Updated DB with google_event_id.')
  } catch (err) {
      console.error('FAILURE!', err.message)
  }
}

syncTeste2()
