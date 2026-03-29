'use client';

import Link from 'next/link';
import { differenceInDays, parseISO } from 'date-fns';
import { AlertTriangle, Info, Clock } from 'lucide-react';

interface PlanBannerProps {
    plan: string | null;
    trialEndsAt: string | null;
    onboardingStatus: string | null;
}

export function PlanBanner({ plan, trialEndsAt, onboardingStatus }: PlanBannerProps) {
    if (!plan) return null;

    // Sandbox banner
    if (plan === 'sandbox') {
        return (
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-brand-500/10 border-b border-brand-500/20 text-sm">
                <div className="flex items-center gap-2 text-brand-300">
                    <Info className="h-4 w-4 shrink-0" />
                    <span className="font-semibold text-xs">
                        You&apos;re exploring in <strong>Sandbox mode</strong> — all data is mocked and not saved.
                    </span>
                </div>
                <Link
                    href="/signup?plan=agent"
                    className="shrink-0 text-xs font-bold uppercase tracking-widest text-white bg-brand-500 hover:bg-brand-400 px-4 py-1.5 rounded-full transition-colors"
                >
                    Upgrade to Agent
                </Link>
            </div>
        );
    }

    // Agent trial banner
    if (plan === 'agent' && trialEndsAt) {
        const daysLeft = differenceInDays(parseISO(trialEndsAt), new Date());

        if (daysLeft < 0) {
            return (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-red-500/10 border-b border-red-500/20">
                    <div className="flex items-center gap-2 text-red-400">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span className="font-semibold text-xs">
                            Your trial has expired. Add a payment method to restore full access.
                        </span>
                    </div>
                    <Link
                        href="/dashboard/settings/billing"
                        className="shrink-0 text-xs font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-400 px-4 py-1.5 rounded-full transition-colors"
                    >
                        Add Payment
                    </Link>
                </div>
            );
        }

        if (daysLeft <= 3) {
            return (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20">
                    <div className="flex items-center gap-2 text-amber-400">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="font-semibold text-xs">
                            Your trial ends in <strong>{daysLeft === 0 ? 'less than 1 day' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}</strong>. Add a payment method to keep access.
                        </span>
                    </div>
                    <Link
                        href="/dashboard/settings/billing"
                        className="shrink-0 text-xs font-bold uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-400 px-4 py-1.5 rounded-full transition-colors"
                    >
                        Add Payment
                    </Link>
                </div>
            );
        }
    }

    // Team plan — pending onboarding
    if (plan === 'team' && onboardingStatus === 'pending') {
        return (
            <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20">
                <Info className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="font-semibold text-xs text-emerald-400">
                    Your workspace is being set up. Our team will contact you within 24h to complete your onboarding.
                </span>
            </div>
        );
    }

    return null;
}
