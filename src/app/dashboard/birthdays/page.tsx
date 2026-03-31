/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BirthdaysView } from './birthdays-view'

export default async function BirthdaysPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch user profile for role and tenant
    const { data: userProfile } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) {
        redirect('/login')
    }

    const userRole = userProfile.role || 'agent'
    const tenantId = userProfile.tenant_id

    // 2. Build Base Query for Leads with role-based filtering
    let query = supabase
        .from('leads')
        .select('*')
        .eq('tenant_id', tenantId)
        .not('birth_date', 'is', null)

    if (userRole === 'agent') {
        query = query.eq('assigned_to', user.id)
    }

    const { data: leadsWithBDay } = await query

    const today = new Date()
    const currentMonth = today.getMonth() + 1 // 1-12
    const currentDay = today.getDate()

    // 1. Filter birthdays in the current month
    const monthBirthdays = (leadsWithBDay || [])
        .filter(lead => {
            if (!lead.birth_date) return false
            const [, month] = lead.birth_date.split('-')
            return parseInt(month, 10) === currentMonth
        })
        .map(lead => {
            const [, month, day] = (lead.birth_date as string).split('-')
            return {
                ...lead,
                bMonth: parseInt(month, 10),
                bDay: parseInt(day, 10),
            }
        })
        .sort((a, b) => (a.bDay || 0) - (b.bDay || 0))

    const upcomingList = monthBirthdays.filter(lead => (lead.bDay || 0) >= currentDay && (lead.bDay || 0) <= currentDay + 7)

    return (
        <BirthdaysView
            monthBirthdays={monthBirthdays}
            upcomingList={upcomingList}
            currentDay={currentDay}
        />
    )
}
