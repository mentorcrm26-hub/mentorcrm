/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/calendar/calendar-view'
import { fetchExternalEvents, reconcileExternalChanges } from '@/lib/integrations/calendar/sync-engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CalendarPage() {
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

    // 2. Fetch all non-archived leads in the tenant
    // Per USER REQUEST: Agents must see all relevant scheduling to avoid overlapping and check availability.
    const [leadsRes, externalEvents] = await Promise.all([
        supabase
            .from('leads')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('is_archived', false)
            .order('name', { ascending: true }),
        fetchExternalEvents(supabase)
    ])

    const allLeads = leadsRes.data || []

    // 3. Sync external changes in the background (server-side)
    await reconcileExternalChanges(supabase, externalEvents)

    return (
        <div className="flex flex-col gap-6 h-full animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
                        Calendar & Appointments
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium italic">
                        All times are synchronized with Florida (EST/EDT) automatically.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-tighter">
                        Florida Time Active
                    </span>
                </div>
            </header>

            <main className="flex-1 min-h-0 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <CalendarView 
                    initialLeads={allLeads} 
                    externalEvents={externalEvents} 
                    userRole={userRole} 
                />
            </main>
        </div>
    )
}
