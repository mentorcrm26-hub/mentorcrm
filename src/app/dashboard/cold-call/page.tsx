/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { startOfWeek, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { getColdCallData } from './actions'
import { ColdCallBoard, ColdCallData } from '@/components/dashboard/cold-call-board'

export const dynamic = 'force-dynamic'

const TIMEZONE = 'America/New_York' // Orlando, Florida (EST/EDT)

export default async function ColdCallPage({
    searchParams
}: {
    searchParams: Promise<{ week?: string }>
}) {
    const params = await searchParams
    // Use Orlando/Eastern timezone so the week boundary is correct
    // regardless of where the server is running (Vercel uses UTC)
    const nowInEastern = toZonedTime(new Date(), TIMEZONE)
    const defaultStart = startOfWeek(nowInEastern, { weekStartsOn: 1 })

    let baseDate: Date
    if (params.week) {
        // Parse yyyy-MM-dd as a local date to avoid UTC shift issues
        const [y, m, d] = params.week.split('-').map(Number)
        baseDate = new Date(y, m - 1, d)
    } else {
        baseDate = defaultStart
    }
    const weekStartDate = startOfWeek(baseDate, { weekStartsOn: 1 })

    const response = await getColdCallData(format(weekStartDate, 'yyyy-MM-dd')) as any
    
    if (!response.success || !response.data) {
        return <div className="p-8 text-red-500 font-bold">Error: {response.error || 'Failed to load data'}</div>
    }

    const data = response.data as ColdCallData

    return (
        <div className="flex flex-col gap-8 h-full">
            <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cold Call & Performance</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track your team&apos;s weekly targets and daily outreach metrics.</p>
                </div>
            </header>

            <main className="flex-1 pb-10">
                <ColdCallBoard 
                    initialData={data} 
                    currentWeekStart={format(weekStartDate, 'yyyy-MM-dd')}
                />
            </main>
        </div>
    )
}
