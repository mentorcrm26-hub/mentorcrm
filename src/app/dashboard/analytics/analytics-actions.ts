'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsMetricsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) return null
    const tenantId = userProfile.tenant_id

    // 1. Total de Leads por Status (Funil)
    const { data: statusCounts } = await supabase
        .from('leads')
        .select('status, count')
        .eq('tenant_id', tenantId)

    // Agrupar por status manualmente se o Supabase não retornar o agrupamento desejado
    const funnelData = [
        { name: 'New Lead', value: 0 },
        { name: 'Attempting Contact', value: 0 },
        { name: 'In Conversation', value: 0 },
        { name: 'Scheduled', value: 0 },
        { name: 'Proposal/Analysis', value: 0 },
        { name: 'Won', value: 0 },
        { name: 'Lost', value: 0 }
    ]

    const { data: leads } = await supabase
        .from('leads')
        .select('status')
        .eq('tenant_id', tenantId)

    leads?.forEach(l => {
        const item = funnelData.find(f => f.name === l.status)
        if (item) item.value++
    })

    // 2. Leads por dia (Últimos 7 dias)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: leadsHistory } = await supabase
        .from('leads')
        .select('created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', sevenDaysAgo.toISOString())

    const dailyLeads = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        const count = leadsHistory?.filter(l => 
            new Date(l.created_at).toDateString() === d.toDateString()
        ).length || 0
        return { name: dateStr, count }
    })

    return {
        funnelData,
        dailyLeads,
        totalLeads: leads?.length || 0,
        conversionRate: calculateConversion(funnelData)
    }
}

function calculateConversion(data: any[]) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0)
    const won = data.find(d => d.name === 'Won')?.value || 0
    return total > 0 ? ((won / total) * 100).toFixed(1) : '0'
}
