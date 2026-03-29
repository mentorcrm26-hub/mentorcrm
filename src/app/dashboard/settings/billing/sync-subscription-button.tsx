'use client'

import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function SyncSubscriptionButton({ subscriptionId }: { subscriptionId?: string }) {
    const [loading, setLoading] = useState(false)

    const handleSync = async () => {
        const id = subscriptionId || window.prompt('Paste your Stripe Subscription ID (sub_xxx):')
        if (!id) return

        setLoading(true)
        try {
            const res = await fetch('/api/stripe/sync-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionId: id }),
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Plan activated: ${data.plan}. Reloading...`)
                setTimeout(() => window.location.href = '/dashboard/settings/billing', 1500)
            } else {
                toast.error(data.error || 'Failed to sync subscription.')
            }
        } catch {
            toast.error('Connection error.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 cursor-pointer"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Already paid? Sync subscription manually
        </button>
    )
}
