/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BirthdaysView } from './birthdays-view'
import { Lead } from '@/types/leads'


export default async function BirthdaysPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch leads that have a birth date
    const { data: leadsWithBDay } = await supabase
        .from('leads')
        .select('*')
        .not('birth_date', 'is', null)

    const today = new Date()
    const currentMonth = today.getMonth() + 1 // 1-12
    const currentDay = today.getDate()

    // 1. Filter birthdays in the current month
    // 2. Sort by day of the month
    const monthBirthdays = (leadsWithBDay || [] as Lead[])
        .filter(lead => {
            if (!lead.birth_date) return false
            // Database stores format YYYY-MM-DD
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
        .sort((a, b) => (a.bDay || 0) - (b.bDay || 0)) // ascending order of days

    // Upcoming logic (Next 7 days, even crossing month boundaries)
    // For simplicity, we highlight if their birthday is today, or in the next 7 days of THIS month
    const upcomingList = monthBirthdays.filter(lead => (lead.bDay || 0) >= currentDay && (lead.bDay || 0) <= currentDay + 7)

    const todayList = monthBirthdays.filter(lead => lead.bDay === currentDay)

    return (
        <BirthdaysView
            monthBirthdays={monthBirthdays}
            upcomingList={upcomingList}
            currentDay={currentDay}
        />
    )
}
