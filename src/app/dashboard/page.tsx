/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { OverviewCharts } from '@/components/dashboard/overview-charts'
import { PipelineMiniCards } from '@/components/dashboard/pipeline-mini-cards'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch everything in parallel
    const [userProfileRes, allLeadsRes] = await Promise.all([
        supabase.from('users').select('role, tenants (name, status)').eq('id', user.id).single(),
        supabase.from('leads').select('id, status, created_at').eq('is_archived', false)
    ])

    const userProfile = userProfileRes.data
    const allLeads = allLeadsRes.data
    const tenant = (userProfile?.tenants as any)

    const leads = allLeads || []
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
                        Workspace · <span className="font-medium text-zinc-800 dark:text-zinc-200">{userProfile?.role === 'admin' ? 'Dono da Conta' : 'Agente'}</span>
                    </p>
                </div>
            </header>

            <main className="flex flex-col gap-6">
                {/* Modern Liquid Glass Core Stats Group */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Stat 1: Dominant Total */}
                    <div className="md:col-span-12 lg:col-span-5 bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 relative flex flex-col justify-between overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-8 relative z-10">Total Contacts Volume</h3>
                        <div className="relative z-10">
                            <p className="text-6xl font-light tracking-tight text-zinc-900 dark:text-white leading-none">{baseTotal}</p>
                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-3">Active records in database</p>
                        </div>
                    </div>

                    <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Stat 2: New Leads Alert */}
                        <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen transition-all group-hover:bg-blue-500/20"></div>
                            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-8 relative z-10">Action Required</h3>
                            <div className="relative z-10">
                                <p className="text-5xl font-light text-zinc-900 dark:text-white leading-none">{newCount}</p>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">New uncontacted leads</p>
                            </div>
                            {newCount > 0 && (
                                <Link href="/dashboard/leads" className="mt-6 relative z-10 inline-flex items-center justify-center text-sm bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 font-medium py-2.5 rounded-full transition-colors backdrop-blur-md border border-blue-600/10 dark:border-blue-400/10">
                                    Process Now
                                </Link>
                            )}
                        </div>

                        {/* Stat 3: Conversion Rate */}
                        <div className="bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl mix-blend-multiply dark:mix-blend-screen"></div>
                            <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-8 relative z-10">Conversion Hit Rate</h3>
                            <div className="relative z-10">
                                <div className="flex items-baseline gap-1">
                                    <p className="text-5xl font-light text-zinc-900 dark:text-white leading-none tracking-tight">{conversionRate}</p>
                                    <span className="text-xl font-medium text-emerald-500">%</span>
                                </div>
                                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-2">{wonCount} successfully closed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pipeline Stages Mini Cards */}
                <PipelineMiniCards leads={leads} />

                {/* Sub-components charts injection */}
                <OverviewCharts leads={leads} />

            </main>
        </div>
    )
}
