'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, subDays, isSameDay, getISOWeek, getYear } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { useRouter } from 'next/navigation'

const TIMEZONE = 'America/New_York' // Orlando, Florida (EST/EDT)
import { 
    PhoneCall, 
    Search, 
    UserPlus, 
    Calendar, 
    UserX, 
    DollarSign, 
    ChevronLeft, 
    ChevronRight, 
    Target,
    Save, 
    X, 
    TrendingUp,
    CheckCircle2
} from 'lucide-react'
import { updateDailyStat, updateWeeklyTarget } from '@/app/dashboard/cold-call/actions'
import { toast } from 'sonner'

export type ColdCallActivity = {
    date: string
    calls_made: number
    discovery_calls: number
    invites: number
    meetings: number
    no_shows: number
    sales: number
    [key: string]: string | number | boolean | null | undefined 
}

export type ColdCallTarget = {
    year: number
    week_number: number
    calls_target: number
    discovery_target: number
    invites_target: number
    meetings_target: number
    no_shows_target: number
    sales_target: number
    [key: string]: any
}

export type ColdCallData = {
    dailyStats: ColdCallActivity[]
    targets: ColdCallTarget | null
    monthlyStats: ColdCallActivity[]
}

const ACTIVITIES = [
    { id: 'calls_made', label: 'Calls Made', icon: PhoneCall, color: 'text-emerald-500', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { id: 'discovery_calls', label: 'Discovery / Cold Call', icon: Search, color: 'text-blue-500', bg: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-950/30' },
    { id: 'invites', label: 'Invite', icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { id: 'meetings', label: 'Meet / Meeting', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500', lightBg: 'bg-purple-50 dark:bg-purple-950/30' },
    { id: 'no_shows', label: 'Scheduled - No Show', icon: UserX, color: 'text-red-500', bg: 'bg-red-500', lightBg: 'bg-red-50 dark:bg-red-950/30' },
    { id: 'sales', label: 'Sales Closed', icon: DollarSign, color: 'text-orange-500', bg: 'bg-orange-500', lightBg: 'bg-orange-50 dark:bg-orange-950/30' },
]

export function ColdCallBoard({
    initialData,
    currentWeekStart
}: {
    initialData: ColdCallData
    currentWeekStart: string
}) {
    const router = useRouter()
    const [_yr, _mo, _dy] = currentWeekStart.split('-').map(Number)
    const startDate = new Date(_yr, _mo - 1, _dy)
    const [editingCell, setEditingCell] = useState<{ day: string, activityId: string, value: number, isTarget: boolean } | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    // Local data state for optimistic updates (target and daily values update instantly after save)
    const [data, setData] = useState<ColdCallData>(initialData)

    // Sync local state when the server re-renders with new props (router.refresh)
    useEffect(() => {
        setData(initialData)
    }, [initialData])

    // Helper functions
    const getDaysOfWeek = () => {
        // Return only Monday through Friday (5 days)
        return Array.from({ length: 5 }, (_, i) => addDays(startDate, i))
    }

    const days = getDaysOfWeek()
    const weekNumber = getISOWeek(startDate)
    const year = getYear(startDate)
    const monthName = format(startDate, 'MMMM')

    const getStat = (date: Date, activityId: string): number => {
        const dateStr = format(date, 'yyyy-MM-dd')
        return (data.dailyStats.find(s => s.date === dateStr)?.[activityId] as number) || 0
    }

    const getWeeklyTotal = (activityId: string) => {
        return data.dailyStats.reduce((sum, s) => sum + (s[activityId] as number || 0), 0)
    }

    const getMonthlyTotal = (activityId: string) => {
        return data.monthlyStats.reduce((sum, s) => sum + (s[activityId] as number || 0), 0)
    }

    const getTargetColumn = (activityId: string) => {
        if (activityId === 'calls_made') return 'calls_target'
        if (activityId === 'discovery_calls') return 'discovery_target'
        return `${activityId}_target`
    }

    const getTarget = (activityId: string): number => {
        return (data.targets?.[getTargetColumn(activityId)] as number) || 0
    }

    const aggregateMonthlyTotal = () => {
        return ACTIVITIES.reduce((sum, act) => sum + getMonthlyTotal(act.id), 0)
    }

    const navigateWeek = (direction: 'prev' | 'next' | 'today') => {
        let newDate;
        if (direction === 'today') {
            newDate = startOfWeek(toZonedTime(new Date(), TIMEZONE), { weekStartsOn: 1 })
        } else {
            newDate = direction === 'prev' ? subDays(startDate, 7) : addDays(startDate, 7)
        }
        const normalizedDate = startOfWeek(newDate, { weekStartsOn: 1 })
        router.push(`/dashboard/cold-call?week=${format(normalizedDate, 'yyyy-MM-dd')}`)
    }

    const handleSave = async (activityId: string, day: string, value: number, isTarget: boolean) => {
        setIsSaving(true)
        try {
            if (isTarget) {
                const column = getTargetColumn(activityId)
                const res = await updateWeeklyTarget(year, weekNumber, column, value)
                if (!res.success) throw new Error(res.error)
                // Optimistic update: show new target value immediately
                setData(prev => ({
                    ...prev,
                    targets: {
                        ...(prev.targets ?? {}),
                        year,
                        week_number: weekNumber,
                        [column]: value,
                    } as ColdCallData['targets']
                }))
            } else {
                const res = await updateDailyStat(day, activityId, value)
                if (!res.success) throw new Error(res.error)
                // Optimistic update: show new daily value immediately
                setData(prev => {
                    const existing = prev.dailyStats.find(s => s.date === day)
                    const updatedStats = existing
                        ? prev.dailyStats.map(s => s.date === day ? { ...s, [activityId]: value } : s)
                        : [...prev.dailyStats, { date: day, calls_made: 0, discovery_calls: 0, invites: 0, meetings: 0, no_shows: 0, sales: 0, [activityId]: value }]
                    return { ...prev, dailyStats: updatedStats }
                })
            }
            toast.success('Updated successfully')
            setEditingCell(null)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* 1. WEEKLY METRICS SUMMARY */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">Week {weekNumber} Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {ACTIVITIES.map((activity) => {
                        const actual = getWeeklyTotal(activity.id)
                        const target = getTarget(activity.id)
                        const percentage = target > 0 ? Math.round((actual / target) * 100) : 0
                        return (
                            <div key={activity.id} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className={`absolute top-0 left-0 w-1 h-full ${activity.bg}`} />
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-xl ${activity.lightBg} ${activity.color}`}>
                                        <activity.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase truncate" title={activity.label}>{activity.label}</span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-zinc-900 dark:text-white">{actual}</span>
                                    <span className="text-xs font-bold text-zinc-400">/ {target}</span>
                                </div>
                                <div className="mt-3 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-1 overflow-hidden">
                                    <div 
                                        className={`h-full ${activity.bg} transition-all duration-1000`} 
                                        style={{ width: `${Math.min(percentage, 100)}%` }} 
                                    />
                                </div>
                                <div className="mt-1 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-zinc-400">S{weekNumber}</span>
                                    {percentage >= 100 && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 2. MONTHLY METRICS SUMMARY */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">{monthName} Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                    {ACTIVITIES.map((activity) => (
                        <div key={`month-${activity.id}`} className="bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900">
                             <div className="flex flex-col items-center text-center gap-2">
                                <div className={`p-2 rounded-xl ${activity.lightBg} ${activity.color}`}>
                                    <activity.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-zinc-900 dark:text-white">{getMonthlyTotal(activity.id)}</div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase truncate">{activity.label}</div>
                                </div>
                             </div>
                        </div>
                    ))}
                    {/* TOTAL CARD */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl border-none shadow-lg text-white col-span-2 lg:col-span-1">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="p-2 rounded-xl bg-white/20 text-white">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">{aggregateMonthlyTotal()}</div>
                                <div className="text-[10px] font-bold uppercase opacity-80">Monthly Total</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. WEEKLY PLANNER TABLE */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Weekly Performance Planner</h2>
                            <p className="text-xs text-zinc-500">Week {weekNumber} of {year} ({format(days[0], 'dd/MM')} - {format(days[4], 'dd/MM')})</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
                        <button onClick={() => navigateWeek('prev')} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-all">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigateWeek('today')} className="px-4 py-1.5 text-xs font-bold hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all">
                            Today
                        </button>
                        <button onClick={() => navigateWeek('next')} className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-400 transition-all">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">Activity</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Target className="w-3.5 h-3.5 text-indigo-500" />
                                        Target
                                    </div>
                                </th>
                                {days.map((day, idx) => (
                                    <th key={idx} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 text-center ${isSameDay(day, toZonedTime(new Date(), TIMEZONE)) ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}`}>
                                        <div className="flex flex-col">
                                            <span>{format(day, 'EEEE')}</span>
                                            <span className="text-[10px] opacity-60 font-normal">{format(day, 'dd/MM')}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {ACTIVITIES.map((activity) => (
                                <tr key={activity.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${activity.lightBg} ${activity.color} group-hover:scale-110 transition-transform`}>
                                                <activity.icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{activity.label}</span>
                                        </div>
                                    </td>
                                    
                                    {/* TARGET CELL */}
                                    <td className="px-2 py-4">
                                        <div className="flex justify-center">
                                            <Cell
                                                value={getTarget(activity.id)}
                                                isTarget={true}
                                                isEditing={editingCell !== null && editingCell.activityId === activity.id && editingCell.isTarget === true}
                                                onEdit={() => setEditingCell({ activityId: activity.id, day: '', value: getTarget(activity.id), isTarget: true })}
                                                onSave={(v: number) => handleSave(activity.id, '', v, true)}
                                                onCancel={() => setEditingCell(null)}
                                                isLoading={isSaving}
                                            />
                                        </div>
                                    </td>

                                    {/* DAILY CELLS */}
                                    {days.map((day, idx) => {
                                        const dayStr = format(day, 'yyyy-MM-dd')
                                        const val = getStat(day, activity.id)
                                        return (
                                            <td key={idx} className="px-2 py-4">
                                                <div className="flex justify-center">
                                                    <Cell
                                                        value={val}
                                                        isTarget={false}
                                                        isToday={isSameDay(day, toZonedTime(new Date(), TIMEZONE))}
                                                        isEditing={editingCell !== null && editingCell.activityId === activity.id && editingCell.day === dayStr && editingCell.isTarget === false}
                                                        onEdit={() => setEditingCell({ activityId: activity.id, day: dayStr, value: val, isTarget: false })}
                                                        onSave={(v: number) => handleSave(activity.id, dayStr, v, false)}
                                                        onCancel={() => setEditingCell(null)}
                                                        isLoading={isSaving}
                                                    />
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

interface CellProps {
    value: number
    isTarget: boolean
    isEditing: boolean
    onEdit: () => void
    onSave: (value: number) => void
    onCancel: () => void
    isLoading: boolean
    isToday?: boolean
}

function Cell({ value, isTarget, isEditing, onEdit, onSave, onCancel, isLoading, isToday }: CellProps) {
    const [tempValue, setTempValue] = useState(value.toString())

    useEffect(() => {
        if (isEditing) {
            setTempValue(value.toString())
        }
    }, [isEditing, value])

    if (isEditing) {
        return (
            <div className="relative z-10 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center gap-2 p-2 bg-white dark:bg-zinc-900 border border-indigo-500 rounded-xl shadow-2xl min-w-[100px]">
                    <input 
                        type="text" 
                        inputMode="numeric"
                        autoFocus
                        value={tempValue} 
                        onChange={(e) => {
                            // Only allow numbers
                            const val = e.target.value.replace(/\D/g, '')
                            setTempValue(val)
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSave(parseInt(tempValue) || 0)
                            if (e.key === 'Escape') onCancel()
                        }}
                        className="w-full p-2 text-center text-sm font-bold bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick={() => onSave(parseInt(tempValue) || 0)} 
                            disabled={isLoading}
                            className="flex-1 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex justify-center disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-3.5 h-3.5" />
                            )}
                        </button>
                        <button 
                            onClick={onCancel} 
                            disabled={isLoading}
                            className="flex-1 p-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex justify-center disabled:opacity-50 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button 
            onClick={onEdit}
            className={`
                group/cell min-w-[60px] p-2.5 rounded-xl transition-all border cursor-pointer
                ${isTarget ? 'bg-indigo-50/30 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30' : 'bg-transparent border-transparent'}
                ${isToday ? 'ring-2 ring-indigo-500/20' : ''}
                hover:border-indigo-500/30 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 hover:scale-105
            `}
        >
            <div className={`text-sm font-black ${isTarget ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-400 group-hover/cell:text-indigo-600 dark:group-hover/cell:text-indigo-400'}`}>
                {value || <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-700 uppercase tracking-tighter transition-opacity group-hover/cell:opacity-100 opacity-40">Add</span>}
            </div>
        </button>
    )
}
