'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { AreaChart, Area, ResponsiveContainer } from 'recharts'

type Lead = {
    id: string
    status: string
    created_at: string
}

const STAGES = [
    { id: 'New Lead', title: 'New Lead', color: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', stroke: '#3b82f6' },
    { id: 'Attempting Contact', title: 'Attempting Contact', color: 'bg-yellow-400', text: 'text-yellow-600 dark:text-yellow-400', stroke: '#facc15' },
    { id: 'In Conversation', title: 'In Conversation', color: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', stroke: '#34d399' },
    { id: 'Scheduled', title: 'Scheduled', color: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400', stroke: '#6366f1' },
    { id: 'Proposal/Analysis', title: 'Proposal/Analysis', color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', stroke: '#f97316' },
    { id: 'Won', title: 'Won', color: 'bg-emerald-600', text: 'text-emerald-600 dark:text-emerald-400', stroke: '#059669' },
    { id: 'Lost', title: 'Lost', color: 'bg-red-500', text: 'text-red-600 dark:text-red-400', stroke: '#ef4444' },
]

export function PipelineMiniCards({ leads }: { leads: Lead[] }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
            {STAGES.map((stage) => {
                const count = leads.filter(l => l.status === stage.id).length;

                // Determinist curve data to prevent hydration errors but still look alive
                // It fakes a growth/drop chart ending exactly at the current count
                const data = [
                    { val: count === 0 ? 0 : count * 0.2 + 1 },
                    { val: count === 0 ? 0 : count * 0.6 + 1 },
                    { val: count === 0 ? 0 : count * 0.3 + 2 },
                    { val: count === 0 ? 0 : count * 0.8 + 1 },
                    { val: count }
                ]

                return (
                    <div key={stage.id} className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-800 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between overflow-hidden relative group transition-all hover:-translate-y-1">
                        <div className="relative z-10 flex items-center gap-2 mb-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></div>
                            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{stage.title}</h4>
                        </div>
                        <p className={`relative z-10 text-3xl font-light ${stage.text}`}>{count}</p>

                        {/* Sparkline overlay at the bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id={`gradient-${stage.id}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={stage.stroke} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={stage.stroke} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="val"
                                        stroke={stage.stroke}
                                        fill={`url(#gradient-${stage.id})`}
                                        strokeWidth={2}
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
