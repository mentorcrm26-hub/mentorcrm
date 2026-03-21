import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerAutomation } from '@/lib/integrations/automation-engine'
import { getFloridaDate, formatFlorida } from '@/lib/timezone'

export const dynamic = 'force-dynamic'

/**
 * 🔒 CORE SYSTEM LOCK - DO NOT MODIFY 🔒
 * 
 * Este arquivo foi VALIDADO EM PRODUÇÃO no dia 20/03/2026.
 * O disparador de aniversariantes funciona com base no fuso da Flórida
 * e garante que as mensagens sejam enviadas apenas na janela do Meio-Dia (12:00 PM).
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const supabase = createAdminClient()
        const nowFlorida = getFloridaDate()
        const currentHour = parseInt(formatFlorida(nowFlorida, 'HH'), 10)
        
        // 1. Verificar Janela de Horário (Meio-dia na Flórida)
        // Permitimos uma pequena margem (11h às 13h) para garantir que o cron não perca o minuto exato
        if (currentHour < 11 || currentHour > 13) {
            return NextResponse.json({ 
                success: false, 
                message: `Pular: Horário na Flórida é ${formatFlorida(nowFlorida, 'HH:mm')}. Disparos de aniversário ocorrem às 12:00 PM.` 
            })
        }

        const monthDay = formatFlorida(nowFlorida, 'MM-DD')
        console.log(`[BIRTHDAY CRON] Verificando aniversariantes para: ${monthDay}`)

        // 2. Buscar leads que fazem aniversário hoje (ignorando o ano)
        // O formato no banco é YYYY-MM-DD
        const { data: leads, error } = await supabase
            .from('leads')
            .select('*')
            .like('birth_date', `%-${monthDay}`)

        if (error) throw error

        const results = { sent: 0, total: leads?.length || 0 }
        
        // 3. Processar automações de 'lead_birthday' para cada aniversariante
        for (const lead of leads || []) {
            try {
                // triggerAutomation busca as automações ativas do tenant e envia
                await triggerAutomation('lead_birthday', lead, supabase)
                results.sent++
            } catch (automationErr) {
                console.error(`[BIRTHDAY ERROR] Erro no lead ${lead.id}:`, automationErr)
            }
        }

        return NextResponse.json({
            success: true,
            florida_time: formatFlorida(nowFlorida),
            target_date: monthDay,
            stats: results
        })

    } catch (err: any) {
        console.error('[BIRTHDAY CRON FATAL ERROR]', err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
