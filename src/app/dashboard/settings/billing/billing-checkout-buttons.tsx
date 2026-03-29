'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Props {
    monthlyKey: string
    annualKey?: string
}

export function BillingCheckoutButtons({ monthlyKey, annualKey }: Props) {
    const [loading, setLoading] = useState<string | null>(null)

    const handleCheckout = async (priceKey: string) => {
        setLoading(priceKey)
        try {
            const res = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceKey }),
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch {
            setLoading(null)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={() => handleCheckout(monthlyKey)}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
                {loading === monthlyKey ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Subscribe Monthly
            </button>

            {annualKey && (
                <button
                    onClick={() => handleCheckout(annualKey)}
                    disabled={loading !== null}
                    className="w-full flex items-center justify-center gap-2 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                    {loading === annualKey ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Subscribe Annually — Save $98
                </button>
            )}
        </div>
    )
}
