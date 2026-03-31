'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'

export async function getAnalyticsMetricsAction() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userProfile } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) return null
    const tenantId = userProfile.tenant_id
    const userRole = userProfile.role || 'agent'

    // 1. Build Base Query for Leads
    // Admins see everything for the tenant; Agents only see their assigned leads.
    let leadsQuery = supabase
        .from('leads')
        .select('status, created_at')
        .eq('tenant_id', tenantId)
        .eq('is_archived', false)

    if (userRole === 'agent') {
        leadsQuery = leadsQuery.eq('assigned_to', user.id)
    }

    const { data: leads } = await leadsQuery

    // 2. Map data for Funnel (Leads por Status)
    const funnelData = [
        { name: 'New Lead', value: 0 },
        { name: 'Attempting Contact', value: 0 },
        { name: 'In Conversation', value: 0 },
        { name: 'Scheduled', value: 0 },
        { name: 'Proposal/Analysis', value: 0 },
        { name: 'Won', value: 0 },
        { name: 'Lost', value: 0 }
    ]

    leads?.forEach(l => {
        const item = funnelData.find(f => f.name === l.status)
        if (item) item.value++
    })

    // 3. Leads por dia (Últimos 7 dias)
    // Re-use same filtered leads since we have the data already, or query gte if list is huge.
    // For CRM scale, usually list is manageable for client-side processing of 7 days, 
    // but let's be efficient and filter the already fetched leads.
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyLeads = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
        
        const count = leads?.filter(l => {
            const leadDate = new Date(l.created_at)
            return leadDate.toDateString() === d.toDateString() && leadDate >= sevenDaysAgo
        }).length || 0
        
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
    // Total includes all leads in funnel
    const total = data.reduce((acc, curr) => acc + curr.value, 0)
    // Won is the success state
    const won = data.find(d => d.name === 'Won')?.value || 0
    return total > 0 ? ((won / total) * 100).toFixed(1) : '0'
}
