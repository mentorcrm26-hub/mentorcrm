import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendarView } from '@/components/calendar/calendar-view'
import { getFloridaDate } from '@/lib/timezone'
import { fetchExternalEvents, reconcileExternalChanges } from '@/lib/integrations/calendar/sync-engine'

export default async function CalendarPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Parallelize all data fetching for zero-wait UI
    const [leadsRes, externalEvents] = await Promise.all([
        supabase.from('leads').select('*').eq('is_archived', false).order('name', { ascending: true }),
        fetchExternalEvents(supabase)
    ])

    const allLeads = leadsRes.data || []

    // Run reconciliation in parallel with the render if possible, 
    // or just ensure it uses pre-fetched events. 
    // Since this is a server component, we wait here, but it's now parallel.
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
                <CalendarView initialLeads={allLeads || []} externalEvents={externalEvents} />
            </main>
        </div>
    )
}
