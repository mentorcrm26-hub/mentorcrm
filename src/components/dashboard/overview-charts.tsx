'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Lead = {
    id: string
    status: string
    created_at: string
}

const COLORS = {
    'New Lead': '#3b82f6', // blue
    'Contacting': '#eab308', // yellow
    'Scheduled': '#a855f7', // purple
    'Won': '#10b981', // green
    'Lost': '#ef4444' // red
}

export function OverviewCharts({ leads }: { leads: Lead[] }) {
    // 1. Chart Data: Leads by Status
    const statusCounts = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const funnelData = [
        { name: 'New Lead', count: statusCounts['New Lead'] || 0, color: COLORS['New Lead'] },
        { name: 'Contacting', count: statusCounts['Contacting'] || 0, color: COLORS['Contacting'] },
        { name: 'Scheduled', count: statusCounts['Scheduled'] || 0, color: COLORS['Scheduled'] },
        { name: 'Won', count: statusCounts['Won'] || 0, color: COLORS['Won'] },
        { name: 'Lost', count: statusCounts['Lost'] || 0, color: COLORS['Lost'] },
    ]

    // 2. Chart Data: Activity over last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(new Date(), 6 - i)
        return format(d, 'yyyy-MM-dd')
    })

    const activityData = last7Days.map(date => {
        const dayLeads = leads.filter(l => l.created_at.startsWith(date))
        return {
            date: format(parseISO(date), 'dd/MM', { locale: ptBR }),
            newLeads: dayLeads.length
        }
    })

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            <div className="lg:col-span-8 bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 z-0"></div>
                <div className="relative z-10 flex flex-col h-full">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-8">Leads Ingestion (Last 7 Days)</h2>
                    <div className="h-64 mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.15} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#888', opacity: 0.05 }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', color: '#18181b', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="newLeads" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden">
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl z-0"></div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-8 relative z-10">Funnel Distribution</h2>
                <div className="flex flex-col gap-6 relative z-10">
                    {funnelData.map((item, i) => (
                        <div key={item.name} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{item.name}</span>
                                <span className="text-xl font-semibold text-zinc-900 dark:text-white mt-0.5">{item.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
