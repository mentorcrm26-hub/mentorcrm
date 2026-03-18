import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
import { google } from 'googleapis'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSync() {
  const { data: lead } = await supabase.from('leads').select('*').not('meeting_at', 'is', null).limit(1).single()
  if (!lead) {
      console.log('No lead with meeting_at found to test.')
      return
  }

  const { data: integrations } = await supabase.from('system_integrations').select('*')
  const googleIntegration = integrations?.find(i => i.provider === 'google')

  if (!googleIntegration) {
      console.log('Google integration NOT found in DB.')
      return
  }

  console.log('Testing sync for lead:', lead.name, 'with date:', lead.meeting_at)
  
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
      summary: `CRM Sync Test: ${lead.name}`,
      description: `Test event.`,
      start: { dateTime: dStart.toISOString() },
      end: { dateTime: dEnd.toISOString() },
  }

  try {
      console.log('Inserting event...')
      const res = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
      })
      console.log('SUCCESS! Event ID:', res.data.id)
  } catch (err) {
      console.error('FAILURE!')
      if (err.response) {
          console.error('Status:', err.response.status)
          console.error('Data:', JSON.stringify(err.response.data, null, 2))
      } else {
          console.error(err)
      }
  }
}

testSync()
