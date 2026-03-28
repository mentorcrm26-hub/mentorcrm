/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Lead } from '@/types/leads'
import { DAVClient } from 'tsdav'
import { google } from 'googleapis'
import * as fs from 'fs'
import * as path from 'path'

export interface ExternalCalendarEvent {
    id: string
    title: string
    start: string
    end: string
    provider: 'apple' | 'google'
}

interface Integration {
    id: string
    provider: string
    credentials: {
        email: string
        appPassword?: string
        tokens?: any
        [key: string]: any
    }
}

const ICLOUD_URL = 'https://caldav.icloud.com'

function generateICal(lead: Lead, eventId: string) {
    const tzOffsetMs = new Date().getTimezoneOffset() * 60 * 1000
    // Simplify for now, set meeting to exactly 1 hour from meeting_at if it's a date string
    // Because iOS handles Zulu time well, we format neatly
    const dStart = new Date(lead.meeting_at!)
    const dEnd = new Date(dStart.getTime() + 60 * 60 * 1000)

    const formatCalDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Mentor CRM//EN
BEGIN:VEVENT
UID:${eventId}
DTSTAMP:${formatCalDate(new Date())}
DTSTART:${formatCalDate(dStart)}
DTEND:${formatCalDate(dEnd)}
SUMMARY:[CRM] 📞 Call with ${lead.name}
DESCRIPTION:Lead: ${lead.name}\\nEmail: ${lead.email || 'N/A'}\\nPhone: ${lead.phone || 'N/A'}\\nNotes: ${lead.notes || 'N/A'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}

export async function syncLeadMeeting(leadId: string, supabaseClient?: SupabaseClient) {
    const supabase = supabaseClient || await createClient()

    // Get lead
    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single()
    if (!lead) return

    // Get active integrations
    const { data: integrations } = await supabase.from('integrations').select('*') as { data: Integration[] | null }
    if (!integrations || integrations.length === 0) return

    const apple = integrations.find((i: Integration) => i.provider === 'apple')
    const googleIntegration = integrations.find((i: Integration) => i.provider === 'google')

    if (apple) {
        try {
            await syncToApple(lead, apple.credentials, supabase)
        } catch (error) {
            console.error('Apple Sync Error:', error)
        }
    }

    if (googleIntegration) {
        try {
            await syncToGoogle(lead, googleIntegration.credentials as { tokens: any }, supabase)
        } catch (error: any) {
            console.error('Google Sync Error:', error)
            throw new Error(`Google Calendar: ${error.message || 'Unknown error'}`)
        }
    }
}

export async function deleteExternalEvent(appleEventId: string) {
    // This is specifically for Apple (CalDAV)
    const supabase = await createClient()
    const { data: integrations } = await supabase.from('integrations').select('*')
    const apple = integrations?.find(i => i.provider === 'apple')

    if (apple && appleEventId) {
        try {
            const client = new DAVClient({
                serverUrl: ICLOUD_URL,
                credentials: {
                    username: apple.credentials.email,
                    password: apple.credentials.appPassword
                },
                authMethod: 'Basic',
                defaultAccountType: 'caldav'
            })
            await client.login()
            const calendars = await client.fetchCalendars()
            const cal = calendars.find(c => c.url.includes('caldav.icloud.com')) || calendars[0]
            if (cal) {
                const filename = `${appleEventId}.ics`
                await client.deleteObject({ url: `${cal.url}${filename}` })
            }
        } catch (error) {
            console.error('Error deleting Apple event:', error)
        }
    }
}

export async function deleteGoogleEvent(googleEventId: string) {
    const supabase = await createClient()
    const { data: integrations } = await supabase.from('integrations').select('*')
    const googleIntegration = integrations?.find(i => i.provider === 'google')

    if (googleIntegration && googleEventId) {
        try {
            const auth = await getGoogleAuth(googleIntegration.credentials, supabase)
            const calendar = google.calendar({ version: 'v3', auth })
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: googleEventId,
            })
        } catch (error: any) {
            console.error('Error deleting Google event:', error.message)
        }
    }
}

async function syncToApple(lead: Lead, credentials: Integration['credentials'], supabase: SupabaseClient) {
    const client = new DAVClient({
        serverUrl: ICLOUD_URL,
        credentials: {
            username: credentials.email,
            password: credentials.appPassword
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav'
    })

    await client.login()
    const calendars = await client.fetchCalendars()

    // Better calendar picker
    // 1. Try to find the one that is definitely CalDAV and NOT read-only names
    // 2. Avoid 'birthdays' or any common read-only calendar names
    let cal = (calendars as any[]).find(c => {
        const url = c.url.toLowerCase()
        const name = (c.displayName || '').toLowerCase()
        return !url.includes('birthday') && !name.includes('aniversário') && !name.includes('holiday')
    })

    // Fallback if none found
    if (!cal) cal = calendars[0]

    if (!cal) return

    // Ensure calendar URL has trailing slash for object URL joining
    const calUrl = cal.url.endsWith('/') ? cal.url : `${cal.url}/`

    // Does lead have a meeting scheduled or not?
    if (lead.meeting_at) {
        // Upsert event
        const eventId = lead.apple_event_id || crypto.randomUUID().toUpperCase()
        const icalString = generateICal(lead, eventId)
        const filename = `${eventId}.ics`

        if (lead.apple_event_id) {
            // Update
            const objectUrl = `${calUrl}${filename}`
            await client.updateObject({
                url: objectUrl,
                data: icalString,
                headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
            })
            // Update lead timestamp anyway to refresh grace period
            await supabase.from('leads').update({ updated_at: new Date().toISOString() }).eq('id', lead.id)
        } else {
            // Create
            const objectUrl = `${calUrl}${filename}`
            await client.createObject({
                url: objectUrl,
                data: icalString,
                headers: { 'Content-Type': 'text/calendar; charset=utf-8' }
            })
            // Save ID back to lead
            await supabase.from('leads').update({ apple_event_id: eventId, updated_at: new Date().toISOString() }).eq('id', lead.id)
        }
    } else {
        // It was unscheduled (meeting canceled)
        if (lead.apple_event_id) {
            const filename = `${lead.apple_event_id}.ics`
            const objectUrl = `${calUrl}${filename}`
            await client.deleteObject({
                url: objectUrl
            })
            // Nullify ID
            await supabase.from('leads').update({ apple_event_id: null, updated_at: new Date().toISOString() }).eq('id', lead.id)
        }
    }
}

async function getGoogleAuth(credentials: { tokens: any }, supabase: SupabaseClient) {
    // Use environment variable but allow override if we could detect environment
    // For Server Actions, we rely on the env var being correct for the environment
    const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : (process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || '')

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${baseUrl}/api/auth/google/callback`
    )

    oauth2Client.setCredentials(credentials.tokens)

    // Handle token refresh automatically
    oauth2Client.on('tokens', async (tokens) => {
        const newCredentials = { 
            ...credentials, 
            tokens: { ...credentials.tokens, ...tokens } 
        }
        await supabase
            .from('integrations')
            .update({ credentials: newCredentials })
            .eq('provider', 'google')
            // Add tenant_id here if possible, but during auto-refresh we might not have it easily 
            // unless we store it or the refresh token refresh is fine with just provider.
            // Actually, we should probably add .eq('id', credentials.id) if we had the integration ID.
    })

    return oauth2Client
}

async function syncToGoogle(lead: Lead, credentials: { tokens: any }, supabase: SupabaseClient) {
    console.log(`[DEBUG] Syncing lead ${lead.name} (${lead.id}) to Google. meeting_at: ${lead.meeting_at}`)
    const auth = await getGoogleAuth(credentials, supabase)
    const calendar = google.calendar({ version: 'v3', auth })

    if (lead.meeting_at) {
        const dStart = new Date(lead.meeting_at)
        const dEnd = new Date(dStart.getTime() + 60 * 60 * 1000)

        const event = {
            summary: `[CRM] 📞 Call with ${lead.name}`,
            description: `Lead: ${lead.name}\nEmail: ${lead.email || 'N/A'}\nPhone: ${lead.phone || 'N/A'}\nNotes: ${lead.notes || 'N/A'}`,
            start: { 
                dateTime: dStart.toISOString(),
                timeZone: 'America/New_York' // Florida TZ
            },
            end: { 
                dateTime: dEnd.toISOString(),
                timeZone: 'America/New_York'
            },
        }

        if (lead.google_event_id) {
            try {
                await calendar.events.update({
                    calendarId: 'primary',
                    eventId: lead.google_event_id,
                    requestBody: event,
                })
                await supabase.from('leads').update({ updated_at: new Date().toISOString() }).eq('id', lead.id)
            } catch (e: any) {
                if (e.code === 404) {
                    const res = await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: event,
                    })
                    await supabase.from('leads').update({ google_event_id: res.data.id, updated_at: new Date().toISOString() }).eq('id', lead.id)
                } else {
                    console.error('[SYNC DEBUG] Google Update Failed:', e)
                    throw e
                }
            }
        } else {
            console.log(`[DEBUG] Inserting new event for ${lead.name}`)
            const res = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
            })
            console.log(`[DEBUG] Inserted event ID: ${res.data.id}`)
            await supabase.from('leads').update({ google_event_id: res.data.id, updated_at: new Date().toISOString() }).eq('id', lead.id)
        }
    } else if (lead.google_event_id) {
        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: lead.google_event_id,
            })
        } catch (e: any) {
            // If already deleted, ignore
            console.warn('[SYNC DEBUG] Google Delete Failed (maybe already gone):', e.message)
        }
        await supabase.from('leads').update({ google_event_id: null, updated_at: new Date().toISOString() }).eq('id', lead.id)
    }
}

export async function fetchExternalEvents(supabaseClient?: SupabaseClient): Promise<ExternalCalendarEvent[]> {
    const logPath = path.join(process.cwd(), 'tmp', 'apple-sync.log')
    const log = (msg: string) => {
        const entry = `[${new Date().toISOString()}] ${msg}\n`
        try { fs.appendFileSync(logPath, entry) } catch (e) {}
        console.log(msg)
    }

    const supabase = supabaseClient || await createClient()
    const { data: integrations, error: intError } = await supabase.from('integrations').select('*') as { data: Integration[] | null, error: any }

    if (intError) {
        log(`[External Fetch] DB Error: ${intError.message}`)
        return []
    }

    if (!integrations || integrations.length === 0) {
        log(`[External Fetch] No integrations found in DB for this tenant.`)
        return []
    }

    log(`[External Fetch] Found ${integrations.length} integrations: ${integrations.map(i => i.provider).join(', ')}`)

    const apple = integrations.find((i: Integration) => i.provider.toLowerCase() === 'apple')
    const googleIntegration = integrations.find((i: Integration) => i.provider.toLowerCase() === 'google')
    
    // Parallelize Apple and Google fetching
    const fetchPromises: Promise<ExternalCalendarEvent[]>[] = []
    
    if (apple) {
        log(`[External Fetch] Triggering Apple sync for ${apple.provider}...`)
        fetchPromises.push(fetchAppleEvents(apple.credentials).catch(e => { log(`Apple fetch error: ${e.message}`); return []; }))
    }
    
    if (googleIntegration) {
        log(`[External Fetch] Triggering Google sync for ${googleIntegration.provider}...`)
        fetchPromises.push(fetchGoogleEvents(googleIntegration.credentials, supabase).catch(e => { log(`Google fetch error: ${e.message}`); return []; }))
    }

    const results = await Promise.all(fetchPromises)
    const combined = results.flat()
    log(`[External Fetch] Total external events retrieved: ${combined.length}`)
    return combined
}

async function fetchAppleEvents(credentials: any): Promise<ExternalCalendarEvent[]> {
    const logPath = path.join(process.cwd(), 'tmp', 'apple-sync.log')
    const log = (msg: string) => {
        const entry = `[${new Date().toISOString()}] ${msg}\n`
        try { fs.appendFileSync(logPath, entry) } catch (e) {}
        console.log(msg)
    }

    try {
        log(`[Apple Sync] Starting for ${credentials.email}`)
        const client = new DAVClient({
            serverUrl: ICLOUD_URL,
            credentials: {
                username: credentials.email,
                password: credentials.appPassword
            },
            authMethod: 'Basic',
            defaultAccountType: 'caldav'
        })

        await client.login().catch(e => {
            log(`[Apple Sync] Login failed: ${e.message}`)
            throw e
        })

        const calendars = await client.fetchCalendars().catch(e => {
            log(`[Apple Sync] Fetch calendars failed: ${e.message}`)
            return []
        })

        log(`[Apple Sync] Raw calendars found: ${calendars.length}`)
        
        // Log calendar details for debugging
        calendars.forEach((c: any) => {
            log(`[Apple Sync] - Calendar: ${c.displayName || 'Unnamed'} | URL: ${c.url}`)
        })
        
        const targetCalendars = (calendars as any[]).filter((c: any) => {
            const name = (c.displayName || '').toLowerCase()
            const url = (c.url || '').toLowerCase()
            return !url.includes('birthday') && 
                   !name.includes('birthday') && 
                   !name.includes('aniversário') && 
                   !name.includes('holiday') && 
                   !name.includes('feriado') &&
                   !name.includes('subscription')
        })

        const calendarsToFetch = targetCalendars.length > 0 ? targetCalendars : calendars

        const calendarFetchResults = await Promise.all(calendarsToFetch.map(async (cal) => {
            try {
                log(`[Apple Sync] Fetching ALL objects from: ${cal.displayName || cal.url}`)
                
                const objects = await client.fetchCalendarObjects({ 
                    calendar: cal
                })
                
                if (!objects || !Array.isArray(objects)) {
                    log(`[Apple Sync] Objects is null or not array for: ${cal.displayName}`)
                    return []
                }
                
                log(`[Apple Sync] Found ${objects.length} Raw objects in ${cal.displayName}`)
                
                const calendarEvents: ExternalCalendarEvent[] = []
                for (const obj of objects) {
                    if (obj.data) {
                        const parsed = parseIcsEvents(obj.data, obj.url)
                        if (parsed.length > 0) {
                            calendarEvents.push(...parsed)
                        }
                    }
                }
                return calendarEvents
            } catch (e: any) {
                log(`[Apple Sync] Error fetching objects from ${cal.displayName}: ${e.message}`)
                return []
            }
        }))

        const flatResults = calendarFetchResults.flat()
        log(`[Apple Sync] Process FINISHED. Total events to show: ${flatResults.length}`)
        return flatResults
    } catch (error: any) {
        log(`[Apple Sync] CRITICAL FAILURE: ${error.message}`)
        return []
    }
}

async function fetchGoogleEvents(credentials: any, supabase: any): Promise<ExternalCalendarEvent[]> {
    const auth = await getGoogleAuth(credentials, supabase)
    const calendar = google.calendar({ version: 'v3', auth })

    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfToday,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
    })

    return (res.data.items || []).map(item => ({
        id: item.id!,
        title: item.summary || 'No Title',
        start: item.start?.dateTime || item.start?.date || '',
        end: item.end?.dateTime || item.end?.date || '',
        provider: 'google'
    }))
}

function parseIcsEvents(icsData: string, url: string): ExternalCalendarEvent[] {
    const events: ExternalCalendarEvent[] = []
    try {
        // Unfold multiline ICS data
        const unfolded = icsData.replace(/\r?\n\s/g, '')

        // Find all VEVENT blocks
        const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/gi
        let match

        while ((match = veventRegex.exec(unfolded)) !== null) {
            const veventContent = match[1]

            // Extract fields
            const summaryMatch = veventContent.match(/SUMMARY(?::|;[^:]*:)(.*)/i)
            const dtStartMatch = veventContent.match(/DTSTART(?::|;[^:]*:)(.*)/i)
            const dtEndMatch = veventContent.match(/DTEND(?::|;[^:]*:)(.*)/i)
            const uidMatch = veventContent.match(/UID(?::|;[^:]*:)(.*)/i)

            if (!dtStartMatch) continue

            const formatIcsDate = (icsDate: string) => {
                let cleanDate = icsDate.trim().replace(/['"]/g, '')
                
                // If it's just a date like 20260314
                if (/^\d{8}$/.test(cleanDate)) {
                    return `${cleanDate.substring(0, 4)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(6, 8)}`
                }
                
                // If it's 20260314T120000Z or similar
                if (/^\d{8}T\d{6}Z?$/.test(cleanDate) || cleanDate.includes('T')) {
                    const parts = cleanDate.split('T')
                    const datePart = parts[0]
                    const timePart = parts[1] || '000000'
                    
                    const y = datePart.substring(0, 4)
                    const m = datePart.substring(4, 6)
                    const d = datePart.substring(6, 8)
                    const h = timePart.substring(0, 2)
                    const min = timePart.substring(2, 4)
                    const s = timePart.substring(4, 6) || '00'
                    
                    return `${y}-${m}-${d}T${h}:${min}:${s}Z`
                }
                
                return cleanDate
            }

            const startStr = dtStartMatch[1].trim()
            const endStr = dtEndMatch ? dtEndMatch[1].trim() : startStr

            events.push({
                id: uidMatch ? uidMatch[1].trim() : `${url}-${events.length}`,
                title: summaryMatch ? summaryMatch[1].trim() : 'Meeting',
                start: formatIcsDate(startStr),
                end: formatIcsDate(endStr),
                provider: 'apple'
            })
        }
    } catch (e) {
        console.warn('Failed to parse Apple ICS data:', e)
    }
    return events
}

export async function reconcileExternalChanges(supabaseClient?: SupabaseClient, preFetchedEvents?: ExternalCalendarEvent[]): Promise<boolean> {
    const supabase = supabaseClient || await createClient()
    const { data: integrations } = await supabase.from('integrations').select('*') as { data: Integration[] | null }
    
    console.log(`[DEBUG Sync] Available integrations: ${integrations?.map(i => i.provider).join(', ') || 'None'}`)
    if (!integrations || integrations.length === 0) return false

    try {
        // Use pre-fetched events if available to avoid redundant network calls
        const externalEvents = preFetchedEvents || await fetchExternalEvents(supabase)
        
        const updatePromises: Promise<any>[] = []

        // 1. Apple Reconcile
        const apple = integrations.find((i: Integration) => i.provider.toLowerCase() === 'apple')
        if (apple) {
            const { data: leads } = await supabase
                .from('leads')
                .select('id, name, meeting_at, apple_event_id, updated_at')
                .not('apple_event_id', 'is', null)

            if (leads) {
                for (const lead of leads) {
                    const extEvent = externalEvents.find(e => e.id === lead.apple_event_id)

                    if (extEvent) {
                        const appleStartTime = extEvent.start
                        const crmTime = lead.meeting_at ? new Date(lead.meeting_at).toISOString() : null
                        const appleTime = new Date(appleStartTime).toISOString()

                        if (crmTime !== appleTime) {
                            console.log(`Reconciling lead ${lead.name} (Apple): ${appleTime} vs CRM ${crmTime}`)
                            updatePromises.push(
                                (async () => {
                                    await supabase
                                        .from('leads')
                                        .update({
                                            meeting_at: appleStartTime,
                                            status: 'Scheduled',
                                            meeting_notified: {},
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', lead.id)
                                })()
                            )
                        }
                    } else {
                        const startOfToday = new Date()
                        startOfToday.setHours(0,0,0,0)

                        if (lead.meeting_at && new Date(lead.meeting_at) < startOfToday) {
                            continue
                        }

                        const updatedAt = new Date(lead.updated_at).getTime()
                        if (Date.now() - updatedAt < 10 * 1000) continue

                        console.log(`Lead ${lead.name} event missing in Apple, clearing sync link.`)
                        updatePromises.push(
                            (async () => {
                                await supabase.from('leads').update({ 
                                    apple_event_id: null, 
                                    meeting_at: null,
                                    status: 'In Conversation',
                                    meeting_notified: {}, 
                                    updated_at: new Date().toISOString() 
                                }).eq('id', lead.id)
                            })()
                        )
                        // Add auto note
                        updatePromises.push(
                            (async () => {
                                await supabase.from('lead_notes').insert({
                                    lead_id: lead.id,
                                    content: `📅 [Sync Apple] Evento removido do calendário externo. Lead retornado para coluna de Conversa.`
                                })
                            })()
                        )
                    }
                }
            }
        }

        // 2. Google Reconcile
        const googleIntegration = integrations.find((i: Integration) => i.provider.toLowerCase() === 'google')
        console.log(`[DEBUG Sync] Google Integration search for 'google' (case-insensitive) found: ${!!googleIntegration}`)
        if (googleIntegration) {
            const { data: googleLeads } = await supabase
                .from('leads')
                .select('id, name, meeting_at, google_event_id, updated_at')
                .not('google_event_id', 'is', null)
            
            console.log(`[DEBUG Sync] Found ${googleLeads?.length || 0} leads with Google Event IDs`)

            if (googleLeads) {
                const googleExternalEvents = externalEvents.filter(e => e.provider === 'google')
                console.log(`[DEBUG Sync] Total Google External Events fetched: ${googleExternalEvents.length}`)

                for (const lead of googleLeads) {
                    const extEvent = googleExternalEvents.find(e => e.id === lead.google_event_id)
                    console.log(`[DEBUG Sync] Lead: ${lead.name} | GID: ${lead.google_event_id} | Found Externally: ${!!extEvent}`)

                    if (extEvent) {
                        const googleStartTime = extEvent.start
                        const crmTime = lead.meeting_at ? new Date(lead.meeting_at).toISOString() : null
                        const googleTime = new Date(googleStartTime).toISOString()

                        if (crmTime !== googleTime) {
                            console.log(`Reconciling lead ${lead.name} (Google): ${googleTime} vs CRM ${crmTime}`)
                            updatePromises.push(
                                (async () => {
                                    await supabase
                                        .from('leads')
                                        .update({
                                            meeting_at: googleStartTime,
                                            status: 'Scheduled',
                                            meeting_notified: {},
                                            updated_at: new Date().toISOString()
                                        })
                                        .eq('id', lead.id)
                                })()
                            )
                        }
                    } else {
                        const startOfToday = new Date()
                        startOfToday.setHours(0,0,0,0)

                        if (lead.meeting_at && new Date(lead.meeting_at) < startOfToday) {
                            continue
                        }

                        const updatedAt = new Date(lead.updated_at).getTime()
                        if (Date.now() - updatedAt < 10 * 1000) continue

                        console.log(`Lead ${lead.name} event missing in Google, clearing sync link.`)
                        updatePromises.push(
                            (async () => {
                                await supabase.from('leads').update({ 
                                    google_event_id: null, 
                                    meeting_at: null,
                                    status: 'In Conversation',
                                    updated_at: new Date().toISOString() 
                                }).eq('id', lead.id)
                            })()
                        )
                        // Add auto note
                        updatePromises.push(
                            (async () => {
                                await supabase.from('lead_notes').insert({
                                    lead_id: lead.id,
                                    content: `📅 [Sync Google] Evento removido do calendário externo. Lead retornado para coluna de Conversa.`
                                })
                            })()
                        )
                    }
                }
            }
        }
        
        if (updatePromises.length > 0) {
            await Promise.all(updatePromises)
            return true
        }
    } catch (error) {
        console.error('Reconciliation Error:', error)
    }
    return false
}
