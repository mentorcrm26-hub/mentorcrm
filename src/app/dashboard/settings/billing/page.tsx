/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, AlertCircle, Zap, Users } from 'lucide-react'
import { BillingCheckoutButtons } from './billing-checkout-buttons'

export default async function BillingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const plan               = user?.user_metadata?.plan as string | undefined
    const subscriptionStatus = user?.user_metadata?.subscription_status as string | undefined
    const trialEndsAt        = user?.user_metadata?.trial_ends_at as string | undefined
    const isActive           = subscriptionStatus === 'active' || subscriptionStatus === 'trialing'
    const isPastDue          = subscriptionStatus === 'past_due'

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Billing & Subscription</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Manage your subscription, activate your account, and view payment history.
                </p>
            </div>

            {/* Status Banner */}
            {isActive && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-5 flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-300">
                            Active Subscription — {plan === 'team' ? 'Team Agency ($99/mo)' : 'Agent Solo ($49/mo)'}
                        </h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                            Your workspace is fully active. All features are unlocked.
                        </p>
                    </div>
                </div>
            )}

            {isPastDue && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-5 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-300">Payment Failed</h4>
                        <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Your last payment could not be processed. Please update your payment method below.
                        </p>
                    </div>
                </div>
            )}

            {!isActive && !isPastDue && (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-5 flex gap-3 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-300">Account Pending Activation</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                            Your workspace is currently operating without a registered payment method. Choose a plan below to activate full access.
                        </p>
                    </div>
                </div>
            )}

            {/* Plan Cards */}
            {!isActive && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Agent Solo */}
                    <div className="bg-white dark:bg-zinc-950/50 border-2 border-brand-500 rounded-xl overflow-hidden shadow-md">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white">Agent Solo</h4>
                                    <p className="text-xs text-zinc-500">For individual agents</p>
                                </div>
                            </div>
                            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1">$49<span className="text-base font-normal text-zinc-500">/mo</span></p>
                            <p className="text-xs text-zinc-400 mb-5">or $490/year (save $98)</p>
                            <ul className="space-y-2 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                                {['Unlimited Leads', 'Email & SMS Automation', 'Advanced Analytics', 'Automations'].map(f => (
                                    <li key={f} className="flex items-center gap-2">
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

                    {/* Team Agency */}
                    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white">Team Agency</h4>
                                    <p className="text-xs text-zinc-500">3 agents included</p>
                                </div>
                            </div>
                            <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-1">$99<span className="text-base font-normal text-zinc-500">/mo</span></p>
                            <p className="text-xs text-zinc-400 mb-5">&nbsp;</p>
                            <ul className="space-y-2 mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                                {['3 WhatsApp Connections', 'Automations', 'Ranking & Stats', 'Lead Distribution', 'Email & SMS Automation'].map(f => (
                                    <li key={f} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <BillingCheckoutButtons
                                monthlyKey="team_monthly"
                            />
                        </div>
                    </div>
                </div>
            )}

            <p className="text-xs text-zinc-400 text-center flex items-center justify-center gap-1">
                Secured by <span className="font-bold text-zinc-500">Stripe</span> — 256-bit encryption
            </p>
        </div>
    )
}
