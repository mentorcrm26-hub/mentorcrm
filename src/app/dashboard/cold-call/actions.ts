'use server'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { startOfWeek, endOfWeek, format, addDays, getISOWeek, getYear } from 'date-fns'

export async function getColdCallData(weekStartDate: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'User profile not found' }

    const tenantId = profile.tenant_id
    const start = new Date(weekStartDate)
    const end = addDays(start, 6)
    const monthStart = new Date(start.getFullYear(), start.getMonth(), 1)
    const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 0)

    // 1. Fetch Daily Stats for the week
    const { data: dailyStats } = await supabase
        .from('cold_call_daily_stats')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'))

    // 2. Fetch Weekly Targets
    // Using ISO weeks for consistency (standard in modern business)
    const weekNumber = getISOWeek(start)
    const year = getYear(start)

    const { data: targets } = await supabase
        .from('cold_call_targets')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('year', year)
        .eq('week_number', weekNumber)
        .single()

    // 3. Fetch Monthly Stats (for the cards)
    const { data: monthlyStats } = await supabase
        .from('cold_call_daily_stats')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))

    return { 
        success: true, 
        data: { 
            dailyStats: dailyStats || [], 
            targets: targets || null,
            monthlyStats: monthlyStats || []
        } 
    }
}

export async function updateDailyStat(date: string, field: string, value: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'User profile not found' }

    // Fetch existing first to ensure we don't wipe other fields
    const { data: existing } = await supabase
        .from('cold_call_daily_stats')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('date', date)
        .single()

    const { error } = await supabase
        .from('cold_call_daily_stats')
        .upsert({
            ...(existing || {}),
            tenant_id: profile.tenant_id,
            date,
            [field]: value
        }, { onConflict: 'tenant_id,date' })

    if (error) {
        console.error('Error updating daily stat:', error)
        return { success: false, error: error.message }
    }
    
    revalidatePath('/dashboard/cold-call')
    return { success: true }
}

export async function updateWeeklyTarget(year: number, weekNumber: number, field: string, value: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: 'User profile not found' }

    const { data: existing } = await supabase
        .from('cold_call_targets')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .eq('year', year)
        .eq('week_number', weekNumber)
        .single()

    const { error } = await supabase
        .from('cold_call_targets')
        .upsert({
            ...(existing || {}),
            tenant_id: profile.tenant_id,
            year,
            week_number: weekNumber,
            [field]: value
        }, { onConflict: 'tenant_id,year,week_number' })

    if (error) {
        console.error('Error updating weekly target:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/cold-call')
    return { success: true }
}
