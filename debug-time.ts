import { getFloridaDate, formatFlorida } from './src/lib/timezone'
import { subMinutes, addMinutes } from 'date-fns'

async function debugCron() {
    const now = getFloridaDate()
    console.log('--- DEBUG CRON ---')
    console.log('Now (Florida):', formatFlorida(now))
    console.log('Now (ISO):', now.toISOString())

    // Simulando o lead do usuário: 7:14 (AM ou PM?)
    // O usuário disse "7h e 14 minutos" as 18:17 local. 
    // Provavelmente ele fala de 19:14 (7:14 PM).
    
    // Se agora são 18:17 e a reunião é 19:14:
    // diff = 19:14 - 18:17 = 57 minutos.
    // Isso deve entrar no range: diffMinutes <= 65 && diffMinutes >= 55.

    const meetingAtStr = '2026-03-16T23:14:00.000Z' // Exemplo de 19:14 Florida
    const meetingAt = getFloridaDate(meetingAtStr)
    
    console.log('Meeting At (Florida):', formatFlorida(meetingAt))
    
    const diffMinutes = Math.round((meetingAt.getTime() - now.getTime()) / (60 * 1000))
    console.log('Diff Minutes:', diffMinutes)

    if (diffMinutes <= 65 && diffMinutes >= 55) {
        console.log('MATCH: 1h Reminder triggered!')
    } else {
        console.log('NO MATCH for 1h Reminder.')
    }
}

debugCron()
