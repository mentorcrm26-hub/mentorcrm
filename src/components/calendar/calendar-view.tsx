'use client'

import { useState, useMemo } from 'react'
import { format, addMonths, subMonths, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, parseISO, isAfter, isBefore, startOfDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, User, Gift, Info, Plus, Cloud } from 'lucide-react'
import { getFloridaDate, formatFlorida } from '@/lib/timezone'
import { LeadDetailsModal } from '@/components/leads/lead-details-modal'
import { NewLeadModal } from '@/components/leads/new-lead-modal'
import { type ExternalCalendarEvent } from '@/lib/integrations/calendar/sync-engine'

interface Lead {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    birth_date: string | null
    meeting_at: string | null
    status: string
    apple_event_id?: string | null
    google_event_id?: string | null
}

interface ExternalEvent {
    id: string
    title: string
    start: string
    end: string
    provider: 'apple' | 'google'
}

export function CalendarView({
    initialLeads,
    externalEvents = []
}: {
    initialLeads: Lead[],
    externalEvents?: ExternalCalendarEvent[]
}) {
    const [currentDate, setCurrentDate] = useState(getFloridaDate())
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

    // State for new appointment
    const [newAppointmentOpen, setNewAppointmentOpen] = useState(false)
    const [targetDate, setTargetDate] = useState<string | null>(null)

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
        start: calendarStart,
        end: calendarEnd,
    })

    // Deduplicate leads by ID just in case the fetch returned duplicates
    const uniqueLeads = useMemo(() => {
        const seen = new Set()
        return initialLeads.filter(lead => {
            if (!lead.id || seen.has(lead.id)) return false
            seen.add(lead.id)
            return true
        })
    }, [initialLeads])

    // Group events by date with type info
    const eventsByDate = useMemo(() => {
        const groups: Record<string, { lead?: Lead, type: 'meeting' | 'birthday' | 'external', external?: ExternalEvent }[]> = {}

        // Create a set of IDs that are already synced to leads to avoid duplicates
        const syncedExternalIds = new Set<string>()

        uniqueLeads.forEach(lead => {
            if (lead.apple_event_id) syncedExternalIds.add(lead.apple_event_id)
            if (lead.google_event_id) syncedExternalIds.add(lead.google_event_id)

            if (lead.meeting_at) {
                // Determine day purely from Florida's string representation
                const dateKey = formatFlorida(lead.meeting_at, 'yyyy-MM-dd')
                if (!groups[dateKey]) groups[dateKey] = []
                groups[dateKey].push({ lead, type: 'meeting' })
            }

            if (lead.birth_date) {
                const bday = parseISO(lead.birth_date)
                const dateKey = format(new Date(currentDate.getFullYear(), bday.getMonth(), bday.getDate()), 'yyyy-MM-dd')
                if (!groups[dateKey]) groups[dateKey] = []
                groups[dateKey].push({ lead, type: 'birthday' })
            }
        })

        // Add external events (Apple/Google) ONLY if they aren't duplicates of a lead meeting
        externalEvents.forEach(event => {
            if (syncedExternalIds.has(event.id)) return

            // Very basic day mapping from ISO string
            const dateKey = event.start.split('T')[0]
            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push({ external: event, type: 'external' })
        })

        return groups
    }, [uniqueLeads, currentDate, externalEvents])

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const handleDayClick = (day: Date) => {
        const isoString = format(day, "yyyy-MM-dd'T'12:00") // Default to noon
        setTargetDate(isoString)
        setNewAppointmentOpen(true)
    }

    return (
        <div className="flex h-full w-full flex-col md:flex-row relative">
            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={() => { setTargetDate(null); setNewAppointmentOpen(true); }}
                            className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95"
                        >
                            <Plus className="w-3.5 h-3.5" /> Schedule
                        </button>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">
                        <button onClick={prevMonth} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-600 dark:text-zinc-400">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentDate(getFloridaDate())} className="px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 transition-colors">
                            Today
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors text-zinc-600 dark:text-zinc-400">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="py-2 text-center text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-zinc-950">
                    <div className="grid grid-cols-7 auto-rows-fr h-full divide-x divide-y divide-zinc-100 dark:divide-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        {days.map((day, i) => {
                            const dateKey = format(day, 'yyyy-MM-dd')
                            const dayEvents = eventsByDate[dateKey] || []
                            const isCurrentMonth = day.getMonth() === monthStart.getMonth()
                            const today = startOfDay(getFloridaDate())
                            const isPast = isBefore(startOfDay(day), today)

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => !isPast && handleDayClick(day)}
                                    className={`group relative min-h-[120px] p-2 flex flex-col gap-1 transition-all ${isPast
                                        ? 'bg-zinc-100/80 dark:bg-zinc-900/40 cursor-not-allowed opacity-60'
                                        : 'cursor-pointer hover:z-10 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'
                                        } ${!isCurrentMonth && !isPast ? 'bg-zinc-50/30 dark:bg-zinc-950/20' : isPast ? '' : 'bg-white dark:bg-zinc-950'
                                        } border-zinc-200/50 dark:border-zinc-800/40`}
                                >
                                    {/* Subtle plus icon on hover - only for future or today */}
                                    {!isPast && (
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pointer-events-none">
                                        <span className={`text-xs font-bold ${isToday(day)
                                            ? 'bg-indigo-600 text-white h-6 w-6 rounded-full flex items-center justify-center p-0 shadow-md ring-2 ring-indigo-500/20'
                                            : isCurrentMonth ? (isPast ? 'text-zinc-400 dark:text-zinc-600' : 'text-zinc-900 dark:text-zinc-100') : 'text-zinc-400/50 dark:text-zinc-700'
                                            }`}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>

                                    <div className="flex-1 flex flex-col gap-1 overflow-hidden mt-1">
                                        {dayEvents.slice(0, 4).map((event, idx) => {
                                            const { lead, type, external } = event
                                            const isMeeting = type === 'meeting'
                                            const isExternal = type === 'external'

                                            if (isExternal && external) {
                                                return (
                                                    <div
                                                        key={`external-${external.id}-${idx}`}
                                                        className="z-20 p-1.5 rounded-md text-[11px] font-medium border truncate transition-all flex items-center gap-1.5 shadow-sm bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 opacity-80"
                                                        title={`${external.title} (${external.provider})`}
                                                    >
                                                        <Cloud className="w-3 h-3 shrink-0" />
                                                        <span className="truncate">{external.title}</span>
                                                    </div>
                                                )
                                            }

                                            if (!lead) return null

                                            return (
                                                <div
                                                    key={`${lead.id}-${type}-${idx}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setSelectedLead(lead)
                                                    }}
                                                    className={`z-20 p-1.5 rounded-md text-[11px] font-medium border truncate transition-all flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-95 ${isMeeting
                                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200 border-indigo-200 dark:border-indigo-500/40'
                                                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border-rose-200 dark:border-rose-500/40'
                                                        }`}
                                                >
                                                    {isMeeting ? <Clock className="w-3 h-3 shrink-0" /> : <Gift className="w-3 h-3 shrink-0" />}
                                                    <span className="truncate">
                                                        {isMeeting ? '' : 'Bday: '}{lead.name}
                                                    </span>
                                                    {isMeeting && (
                                                        <div className="ml-auto flex items-center gap-1 shrink-0">
                                                            {lead.google_event_id && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" title="Synced with Google" />}
                                                            {lead.apple_event_id && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]" title="Synced with Apple" />}
                                                            <span className="opacity-90 text-[11px] tabular-nums font-bold">
                                                                {formatFlorida(lead.meeting_at!, 'HH:mm')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                        {dayEvents.length > 4 && (
                                            <div className="text-[10px] font-bold text-zinc-400 pl-2">
                                                + {dayEvents.length - 4} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Side Summary / Upcoming */}
            <aside className="w-full md:w-80 p-6 space-y-8 bg-zinc-50/50 dark:bg-zinc-900/20 md:max-h-full md:overflow-y-auto shrink-0">
                <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-500" /> Agenda Advisor
                    </h3>
                    <div className="p-4 rounded-2xl bg-indigo-600/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-sm text-indigo-900 dark:text-indigo-400 font-bold leading-relaxed">
                            Pro Tip: Click any empty cell in the calendar grid to quickly schedule a session.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Upcoming Schedule</h3>
                    <div className="space-y-3">
                        {/* Merge leads and external events for upcoming list */}
                        {[
                            ...uniqueLeads
                                .filter(l => l.meeting_at && isAfter(parseISO(l.meeting_at), subMonths(getFloridaDate(), 0)))
                                .map(l => ({
                                    id: l.id,
                                    name: l.name,
                                    time: l.meeting_at!,
                                    type: 'lead' as const,
                                    lead: l
                                })),
                            ...externalEvents
                                .filter(e => isAfter(parseISO(e.start), subMonths(getFloridaDate(), 0)))
                                .map(e => ({
                                    id: e.id,
                                    name: e.title,
                                    time: e.start,
                                    type: 'external' as const,
                                    provider: e.provider
                                }))
                        ]
                            .sort((a, b) => parseISO(a.time).getTime() - parseISO(b.time).getTime())
                            .slice(0, 15)
                            .map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => item.type === 'lead' && setSelectedLead(item.lead)}
                                    className={`p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all shadow-sm group hover:shadow-md ${item.type === 'lead' ? 'hover:border-indigo-500 cursor-pointer' : 'opacity-80 border-dashed hover:border-zinc-400'}`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${item.type === 'lead'
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                                            : 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800'
                                            }`}>
                                            {formatFlorida(item.time, 'MMM d, EEE')}
                                        </span>
                                        <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" /> {formatFlorida(item.time, 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.type === 'lead' ? (
                                            <User className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                                        ) : (
                                            <Cloud className="w-3.5 h-3.5 text-zinc-400" />
                                        )}
                                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</span>
                                        {item.type === 'external' && (
                                            <span className="text-[10px] text-zinc-400 ml-auto uppercase font-bold tracking-tighter">
                                                {item.provider}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}

                        {initialLeads.filter(l => l.meeting_at).length === 0 && externalEvents.length === 0 && (
                            <div className="py-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                                    Your calendar is clear.<br />Start scheduling!
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </aside>

            {/* Modals */}
            <LeadDetailsModal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
            />

            <NewLeadModal
                isOpen={newAppointmentOpen}
                onToggle={setNewAppointmentOpen}
                initialMeetingAt={targetDate || undefined}
                showTrigger={false}
                availableLeads={uniqueLeads}
                mode="appointment"
            />
        </div>
    )
}
