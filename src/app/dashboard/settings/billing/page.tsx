/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default async function BillingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Billing & Subscription</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Manage your subscription, activate your account, and view payment history.
                </p>
            </div>

            {/* Simulated Free Trial Banner if inactive */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-300">Account Pending Activation</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-400 mt-1">
                            Your workspace is currently operating without a registered payment method. Add your credit card to activate the full CRM.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 flex items-center justify-center flex-col text-center min-h-[300px]">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Subscribe to Full Access</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                        Enter your payment details securely via Stripe to activate all features, integrations, and automated lead capture.
                    </p>
                    <button className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg h-10 px-6 py-2 shrink-0">
                        Add Payment Method
                    </button>
                    <p className="text-xs text-zinc-400 mt-4 flex items-center gap-1">
                        Secured by <span className="font-bold text-zinc-500">stripe</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
