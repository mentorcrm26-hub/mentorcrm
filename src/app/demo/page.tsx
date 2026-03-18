'use client'

import { OverviewCharts } from '@/components/dashboard/overview-charts'
import { useDemo } from '@/components/demo/demo-provider'
import { PipelineMiniCards } from '@/components/dashboard/pipeline-mini-cards'
import { Sparkles, Clock, Zap, CheckCircle2, Mail } from 'lucide-react'

export default function DemoDashboardPage() {
    // Generate some fake data indicating an active demo user
    const { leads } = useDemo()

    const baseTotal = leads.length
    const wonCount = leads.filter(l => l.status === 'Won').length
    const newCount = leads.filter(l => l.status === 'New Lead').length
    const conversionRate = baseTotal > 0 ? ((wonCount / baseTotal) * 100).toFixed(1) : "0.0"

    return (
        <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between pb-8">
                <div>
                    <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">Metrics</h1>
                    <p className="text-base text-zinc-500 dark:text-zinc-400">
                        Workspace · <span className="font-medium text-zinc-800 dark:text-zinc-200">Demo CRM Guest</span>
                    </p>
                </div>
            </header>

            <main className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-12 lg:col-span-5 bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8 relative z-10">Total Contacts Volume</h3>
                        <div className="relative z-10">
                            <p className="text-6xl font-light tracking-tight text-zinc-900 dark:text-white leading-none">{baseTotal}</p>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-3">Active demonstration records</p>
                        </div>
                    </div>

                    <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen transition-all group-hover:bg-blue-500/20"></div>
                            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 relative z-10">Action Required</h3>
                            <div className="relative z-10">
                                <p className="text-5xl font-light text-zinc-900 dark:text-white leading-none">{newCount}</p>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">New leads imported today</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                            <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-8 relative z-10">Actual Conversion Rate</h3>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <p className="text-5xl font-light text-zinc-900 dark:text-white leading-none tracking-tight">{conversionRate}</p>
                                    <span className="text-xl font-medium text-emerald-500">%</span>
                                </div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">{wonCount} contacts closed in Funnel</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pipeline Stages Mini Cards */}
                <PipelineMiniCards leads={leads} />

                {/* AI Insights & Activity Feed Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Insights */}
                    <div className="lg:col-span-8 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-2xl border border-indigo-500/20 dark:border-indigo-400/20 rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden shadow-sm group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-60 z-0"></div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg text-white">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                    AI Mentor Insights
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider">Premium Feature</span>
                                </h3>
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
                                    You have <strong className="text-amber-600 dark:text-amber-400">{leads.filter(l => l.status === 'Contacting').length} leads</strong> stalled in "Contacting" for too long. Research shows that sending a follow-up SMS right now increases conversion by 34%. Would you like to generate an AI message?
                                </p>
                                <button disabled className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-60 cursor-not-allowed">
                                    Generate Message <span className="ml-1">→</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <div className="lg:col-span-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-zinc-800 rounded-3xl p-6 relative shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock className="w-5 h-5 text-zinc-400" />
                            <h3 className="font-semibold text-zinc-900 dark:text-white">Live Activity</h3>
                        </div>
                        <div className="space-y-4 flex-1 overflow-hidden relative">
                            {/* Fade out mask at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/60 dark:from-zinc-900/60 to-transparent z-10"></div>

                            <div className="flex gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="pt-1">
                                    <p className="text-zinc-900 dark:text-zinc-100"><span className="font-semibold">Landing Page</span> captured a new lead.</p>
                                    <span className="text-xs text-zinc-500">Just now</span>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="pt-1">
                                    <p className="text-zinc-900 dark:text-zinc-100">Deal won with <span className="font-semibold">Carlos Santos</span>.</p>
                                    <span className="text-xs text-zinc-500">5 mins ago</span>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm opacity-60">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 text-indigo-600 dark:text-indigo-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="pt-1">
                                    <p className="text-zinc-900 dark:text-zinc-100">Automated welcome email sent.</p>
                                    <span className="text-xs text-zinc-500">2 hours ago</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <OverviewCharts leads={leads} />
            </main>
        </div>
    )
}
