/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, Gift, Calendar as CalendarIcon, Variable, Zap, MessageSquare, TrendingUp } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { NavLinks } from '@/components/dashboard/nav-links'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch the user details to get tenant
    const { data: userProfile } = await supabase
        .from('users')
        .select(`
            role, 
            tenant_id,
            tenants (
                name, 
                status, 
                created_at
            )
        `)
        .eq('id', user.id)
        .single()

    const tenant = (userProfile?.tenants as any)

    // Note: Trial logic was removed as part of the pivot to Admin-led onboarding.
    // Clients receive credentials after their initial payment.

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-950 dark:text-zinc-50 flex">
            {/* Sidebar Desktop */}
            <aside className="w-64 border-r border-zinc-200 dark:border-white/10 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/10">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Mentor CRM</span>
                </div>

                <NavLinks role={userProfile?.role || null} tenantId={userProfile?.tenant_id || null} />

                <div className="p-4 border-t border-zinc-200 dark:border-white/10">
                    <div className="flex flex-col mb-4">
                        <span className="text-sm font-medium truncate">{tenant?.name || 'Your Workspace'}</span>
                        <span className="text-xs text-zinc-500">{userProfile?.role === 'admin' ? 'Account Owner' : 'Agent'}</span>
                    </div>

                    <form action="/auth/signout" method="post">
                        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-all hover:translate-x-1 group cursor-pointer">
                             <span className="p-1 rounded-md group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                             </span>
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header Mobile */}
                <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Mentor CRM</span>
                    <MobileNav role={userProfile?.role || null} tenantName={tenant?.name || null} tenantId={userProfile?.tenant_id || null} />
                </header>

                {/* Top banner space specifically for system-wide alerts, like missing payment methods (will be implemented later) */}

                <div className="flex-1 overflow-auto p-4 md:p-8 relative z-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
