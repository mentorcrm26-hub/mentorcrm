/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Settings, Gift, Calendar as CalendarIcon, Variable, Zap, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react'
import { differenceInDays } from 'date-fns'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { NavLinks } from '@/components/dashboard/nav-links'
import { PlanBanner } from '@/components/dashboard/plan-banner'

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

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    // Impersonation logic for Super Admins
    const { cookies: getCookies, headers: getHeaders } = await import('next/headers')
    const cookieStore = await getCookies()
    const headerStore = await getHeaders()
    const impersonatedTenantId = headerStore.get('x-impersonated-tenant-id') || cookieStore.get('impersonated_tenant_id')?.value
    
    // Determine which profile to fetch
    const targetUserId = (isSuperAdmin && impersonatedTenantId) 
        ? null // We will fetch by tenant_id directly if impersonating
        : user.id

    let userProfile = null
    let tenant = null

    if (targetUserId) {
        // Normal Flow: Fetch by User ID
        const { data } = await supabase
            .from('users')
            .select(`
                role, 
                tenant_id,
                tenants (
                    id,
                    name, 
                    plan,
                    status, 
                    created_at,
                    is_vip
                )
            `)
            .eq('id', targetUserId)
            .single()
        userProfile = { ...data, is_impersonating: false }
        tenant = (data?.tenants as any)
    } else if (isSuperAdmin && impersonatedTenantId) {
        // Impersonation Flow: Use admin client to bypass RLS
        const supabaseAdmin = await createAdminClient()
        const { data } = await supabaseAdmin
            .from('tenants')
            .select('*')
            .eq('id', impersonatedTenantId)
            .single()
        tenant = data
        userProfile = { role: 'admin', tenant_id: impersonatedTenantId, is_impersonating: true }
    }

    const isVip = tenant?.is_vip === true
    const currentPlan = tenant?.plan || user.user_metadata?.plan || 'sandbox'

    // Only redirect to demo if NOT Super Admin, NOT VIP and plan is sandbox
    if (!isSuperAdmin && !isVip && currentPlan === 'sandbox') {
        redirect('/demo')
    }

    // Note: Trial logic was removed as part of the pivot to Admin-led onboarding.
    // Clients receive credentials after their initial payment.

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-950 dark:text-zinc-50 flex">
            {/* Sidebar Desktop */}
            <aside className="w-64 border-r border-zinc-200 dark:border-white/10 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/10">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Mentor CRM</span>
                </div>

                {isSuperAdmin && (
                    <div className="px-4 py-4 border-b border-zinc-200 dark:border-white/10">
                        <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-orange-500 rounded-xl hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all active:scale-95 group">
                            <div className="p-1 bg-white/20 rounded-md group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            PAINEL MASTER
                        </Link>
                    </div>
                )}

                <NavLinks role={userProfile?.role || null} tenantId={userProfile?.tenant_id || null} />

                <div className="p-4 border-t border-zinc-200 dark:border-white/10">
                    <div className="flex flex-col mb-4">
                        <div className="flex items-center gap-2 mb-1">
                             <span className={`text-sm font-bold truncate ${userProfile?.is_impersonating ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                                {tenant?.name || 'Your Workspace'}
                             </span>
                             {userProfile?.is_impersonating && (
                                <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[8px] font-black rounded uppercase border border-rose-200 dark:border-rose-800">
                                    IMP
                                </span>
                             )}
                        </div>
                        <span className="text-xs text-zinc-500">{userProfile?.role === 'admin' ? 'Account Owner' : 'Agent'}</span>
                        {isVip && <span className="text-[10px] font-black uppercase text-amber-500 mt-1">Status VIP Ativo</span>}
                        {userProfile?.is_impersonating && <span className="text-[10px] font-bold text-rose-500 mt-1 uppercase italic underline">Visualização Master</span>}
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
                    <MobileNav role={userProfile?.role || null} tenantName={tenant?.name || null} tenantId={userProfile?.tenant_id || null} isSuperAdmin={isSuperAdmin} />
                </header>

                {!isVip && (
                    <PlanBanner
                        plan={user.user_metadata?.plan ?? null}
                        trialEndsAt={user.user_metadata?.trial_ends_at ?? null}
                        onboardingStatus={user.user_metadata?.onboarding_status ?? null}
                    />
                )}

                <div className="flex-1 overflow-auto p-4 md:p-8 relative z-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
