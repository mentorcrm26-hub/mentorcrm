'use client'

/**
 * Universal auth callback handler.
 *
 * Handles both Supabase auth flows:
 *  - PKCE:     URL contains ?code=xxx  (server can read, but we handle here too)
 *  - Implicit: URL contains #access_token=xxx  (hash — only readable client-side)
 *
 * After a successful session, redirects to the `next` query param (default /dashboard).
 * On failure, redirects to /login?error=true.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthVerifyPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'verifying' | 'error'>('verifying')

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const params  = new URLSearchParams(window.location.search)
        const hash    = new URLSearchParams(window.location.hash.slice(1))
        const next    = params.get('next') || '/dashboard'
        const code    = params.get('code')
        const error   = params.get('error') || hash.get('error')

        if (error) {
            router.replace(`/login?error=true&msg=${encodeURIComponent(hash.get('error_description') || 'Link inválido ou expirado.')}`)
            return
        }

        if (code) {
            // PKCE flow
            supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
                if (err) {
                    router.replace('/login?error=true&msg=' + encodeURIComponent(err.message))
                } else {
                    router.replace(next)
                }
            })
            return
        }

        // Implicit flow — Supabase client picks up #access_token automatically
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                subscription.unsubscribe()
                router.replace(next)
            } else if (event === 'SIGNED_OUT') {
                setStatus('error')
                router.replace('/login?error=true&msg=' + encodeURIComponent('Não foi possível verificar o link.'))
            }
        })

        // Fallback: if no event fires in 5s, redirect to login
        const timeout = setTimeout(() => {
            subscription.unsubscribe()
            setStatus('error')
            router.replace('/login?error=true&msg=' + encodeURIComponent('Link expirado ou inválido.'))
        }, 5000)

        return () => {
            subscription.unsubscribe()
            clearTimeout(timeout)
        }
    }, [router])

    return (
        <div className="min-h-screen bg-[#000C24] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {status === 'verifying' ? 'Verificando...' : 'Redirecionando...'}
                </p>
            </div>
        </div>
    )
}
