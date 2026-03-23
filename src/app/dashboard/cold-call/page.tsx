import { startOfWeek, format } from 'date-fns'
import { getColdCallData } from './actions'
import { ColdCallBoard } from '@/components/dashboard/cold-call-board'

export const dynamic = 'force-dynamic'

export default async function ColdCallPage({
    searchParams
}: {
    searchParams: { week?: string }
}) {
    // Determine the start of the week for display
    // Default to current week's Monday (or Sunday depending on setup, but image shows Monday)
    const now = new Date()
    // Force Monday start regardless of how the date is passed
    const defaultStart = startOfWeek(now, { weekStartsOn: 1 })
    const baseDate = searchParams.week ? new Date(searchParams.week) : defaultStart
    const weekStartDate = startOfWeek(baseDate, { weekStartsOn: 1 })

    const response = await getColdCallData(format(weekStartDate, 'yyyy-MM-dd'))
    
    if (!response.success) {
        return <div className="p-8 text-red-500 font-bold">Error: {response.error}</div>
    }

    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cold Call & Performance</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your team's weekly targets and daily outreach metrics.</p>
                </div>
            </header>

            <main className="flex-1 pb-10">
                <ColdCallBoard 
                    initialData={response.data} 
                    currentWeekStart={format(weekStartDate, 'yyyy-MM-dd')}
                />
            </main>
        </div>
    )
}
