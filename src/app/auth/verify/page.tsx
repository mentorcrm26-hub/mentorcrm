'use client'

/**
 * Universal auth callback handler.
 *
 * Handles all Supabase auth token flows:
 *  - PKCE:       ?code=xxx
 *  - Token hash: ?token_hash=xxx&type=invite
 *  - Implicit:   #access_token=xxx&refresh_token=yyy  (hash — only readable client-side)
 *  - Error:      #error=access_denied&error_description=...
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthVerifyPage() {
    const router = useRouter()
    const [message, setMessage] = useState('Verificando...')

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        async function handleAuth() {
            const searchParams  = new URLSearchParams(window.location.search)
            const hashParams    = new URLSearchParams(window.location.hash.replace(/^#/, ''))
            const next          = searchParams.get('next') || '/dashboard'

            // ── 1. Error in hash or query ─────────────────────────────────────
            const errorDesc = hashParams.get('error_description') || searchParams.get('error_description')
            if (hashParams.get('error') || searchParams.get('error')) {
                router.replace(`/login?error=true&msg=${encodeURIComponent(errorDesc || 'Link inválido ou expirado.')}`)
                return
            }

            // ── 2. PKCE flow: ?code=xxx ───────────────────────────────────────
            const code = searchParams.get('code')
            if (code) {
                const { error } = await supabase.auth.exchangeCodeForSession(code)
                if (error) {
                    router.replace(`/login?error=true&msg=${encodeURIComponent(error.message)}`)
                } else {
                    router.replace(next)
                }
                return
            }

            // ── 3. Token hash flow: ?token_hash=xxx&type=invite ───────────────
            const tokenHash = searchParams.get('token_hash')
            const type      = searchParams.get('type') as any
            if (tokenHash && type) {
                const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
                if (error) {
                    router.replace(`/login?error=true&msg=${encodeURIComponent(error.message)}`)
                } else {
                    router.replace(next)
                }
                return
            }

            // ── 4. Implicit flow: #access_token=xxx&refresh_token=yyy ─────────
            const accessToken  = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')
            if (accessToken && refreshToken) {
                setMessage('Autenticando...')
                const { error } = await supabase.auth.setSession({
                    access_token:  accessToken,
                    refresh_token: refreshToken,
                })
                if (error) {
                    router.replace(`/login?error=true&msg=${encodeURIComponent(error.message)}`)
                } else {
                    router.replace(next)
                }
                return
            }

            // ── 5. Already have a valid session (e.g. page refresh) ───────────
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.replace(next)
                return
            }

            // ── 6. Nothing matched ────────────────────────────────────────────
            router.replace('/login?error=true&msg=' + encodeURIComponent('Link inválido ou expirado.'))
        }

        handleAuth()
    }, [router])

    return (
        <div className="min-h-screen bg-[#000C24] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {message}
                </p>
            </div>
        </div>
    )
}
