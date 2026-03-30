/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CheckCircle2, AlertCircle, Zap, Users, Clock } from 'lucide-react'
import { BillingCheckoutButtons } from './billing-checkout-buttons'
import { SyncSubscriptionButton } from './sync-subscription-button'

export default async function BillingPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; canceled?: string }>
}) {
    const p = await searchParams
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch actual tenant status from DB using admin client to ensure we get the data
    const { data: userProfile } = await adminSupabase
        .from('users')
        .select(`
            role, 
            tenant_id,
            tenants (
                plan, 
                is_vip, 
                subscription_status
            )
        `)
        .eq('id', user?.id)
        .single()

    const tenantData = (userProfile?.tenants as any)
    const tenant = Array.isArray(tenantData) ? tenantData[0] : tenantData
    const isVip = tenant?.is_vip === true
    const dbPlan = tenant?.plan || user?.user_metadata?.plan || 'sandbox'
    const subStatus = tenant?.subscription_status || user?.user_metadata?.subscription_status

    const isActive = subStatus === 'active' || subStatus === 'trialing' || isVip
    const isPastDue = subStatus === 'past_due' && !isVip
    const paymentJustCompleted = p?.success === 'true' && !isActive

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 italic tracking-tight">Billing & Subscription</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Manage your subscription, activate your account, and view payment history.
                </p>
            </div>

            {/* Status Banner */}
            {isVip ? (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-6 flex gap-4 items-center shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-700">
                        <CheckCircle2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h4 className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                            Status VIP Ativo — Acesso Cortesia
                        </h4>
                        <p className="text-sm text-amber-800 dark:text-amber-400 mt-1 leading-relaxed">
                            Você possui acesso ilimitado a todas as funcionalidades do **Mentor CRM** como convidado especial. Não há cobranças pendentes.
                        </p>
                    </div>
                </div>
            ) : paymentJustCompleted ? (
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10 p-5 flex gap-3 items-start">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 animate-spin" />
                    <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-300">Payment received — activating your account</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Your payment was confirmed. Your account will be fully activated in a few seconds. <a href="/dashboard/settings/billing" className="underline font-bold">Refresh this page</a> to see your updated plan.
                        </p>
                    </div>
                </div>
            ) : isActive ? (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">
                            Active Subscription — {dbPlan === 'team' ? 'Team Agency ($99/mo)' : 'Agent Solo ($49/mo)'}
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                            Your workspace is fully active. All features are unlocked.
                        </p>
                    </div>
                </div>
            ) : isPastDue ? (
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-5 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-300">Payment Failed</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Your last payment could not be processed. Please update your payment method below.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-5 flex flex-col sm:flex-row gap-4 justify-between items-start">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-300">Account Pending Activation</h4>
                            <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                                Your workspace is currently operating without a registered payment method. Choose a plan below to activate full access.
                            </p>
                        </div>
                    </div>
                    <SyncSubscriptionButton />
                </div>
            )}

            {p?.canceled === 'true' && !isVip && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-5 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Checkout was canceled. No charge was made. Choose a plan below whenever you&apos;re ready.</p>
                </div>
            )}

            {/* Plan Cards - Simplified visibility logic */}
            {(!isActive || dbPlan === 'agent') && !isVip && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Agent Solo - Only show if NO active subscription */}
                    {!isActive && (
                        <div className="bg-white dark:bg-zinc-950/50 border-2 border-indigo-500 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/5 relative">
                             <div className="absolute top-0 right-0 p-3">
                                <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">Recommended</span>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xl text-zinc-900 dark:text-white mt-1">Agent Solo</h4>
                                        <p className="text-xs text-zinc-500 font-medium">For individual agents</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-zinc-900 dark:text-white">$49</span>
                                        <span className="text-lg font-medium text-zinc-500">/mo</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 font-bold">or $490/year (save $98)</p>
                                </div>
                                <ul className="space-y-3 mb-8 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                    {['Unlimited Leads', 'Email & SMS Automation', 'Advanced Analytics', 'Automations'].map(f => (
                                        <li key={f} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <BillingCheckoutButtons
                                    monthlyKey="agent_monthly"
                                    annualKey="agent_annual"
                                />
                            </div>
                        </div>
                    )}

                    {/* Team Agency - Show if NO active sub OR if Solo (to allow upgrade) */}
                    {(dbPlan === 'agent' || !isActive) && (
                        <div className={`bg-white dark:bg-zinc-950/50 rounded-2xl overflow-hidden shadow-sm relative border ${dbPlan === 'agent' ? 'border-2 border-purple-500 shadow-purple-500/5' : 'border-zinc-200 dark:border-white/10'}`}>
                            {dbPlan === 'agent' && (
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="bg-purple-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">Upgrade Available</span>
                                </div>
                            )}
                            <div className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xl text-zinc-900 dark:text-white mt-1">Team Agency</h4>
                                        <p className="text-xs text-zinc-500 font-medium font-bold">3 agents included</p>
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-zinc-900 dark:text-white">$99</span>
                                        <span className="text-lg font-medium text-zinc-500">/mo</span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">&nbsp;</p>
                                </div>
                                <ul className="space-y-3 mb-8 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                                    {['3 WhatsApp Connections', 'Automations', 'Ranking & Stats', 'Lead Distribution', 'Email & SMS Automation'].map(f => (
                                        <li key={f} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <BillingCheckoutButtons
                                    monthlyKey="team_monthly"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 text-center flex items-center justify-center gap-2 pt-6">
                Secured by <span className="text-zinc-500">Stripe</span> — 256-bit encryption
            </p>
        </div>
    )
}
