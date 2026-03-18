'use client'

import { useState, useEffect } from 'react'
import { Calendar, Cloud, Info, KeyRound, CheckCircle2, X, Lock, ArrowRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveAppleCalendarCredentials, removeIntegration } from './actions'

export function CalendarIntegrationsClient({
    initialApple,
    initialGoogle
}: {
    initialApple: boolean
    initialGoogle: boolean
}) {
    const [isAppleConfigured, setIsAppleConfigured] = useState(initialApple)
    const [isGoogleConfigured, setIsGoogleConfigured] = useState(initialGoogle)

    // Modal states
    const [isAppleModalOpen, setIsAppleModalOpen] = useState(false)
    const [isAppleTipsOpen, setIsAppleTipsOpen] = useState(false)
    const [appleStep, setAppleStep] = useState(1)

    // Form states
    const [appleEmail, setAppleEmail] = useState('')
    const [applePassword, setApplePassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [confirmDisconnect, setConfirmDisconnect] = useState<{
        isOpen: boolean;
        provider: 'apple' | 'google' | null;
    }>({ isOpen: false, provider: null })

    // Listen for Google Auth callback from popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
                toast.success('Google Calendar connected!')
                setIsGoogleConfigured(true)
                setIsLoading(false)
                // Optionally refresh server data
                window.location.reload()
            }
            if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
                toast.error(`Failed to connect Google: ${event.data.error}`)
                setIsLoading(false)
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    const handleGoogleConnect = () => {
        setIsLoading(true)
        
        // Open Google Auth in a separate popup window
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
            '/api/auth/google',
            'google_auth',
            `width=${width},height=${height},left=${left},top=${top}`
        )
    }

    const handleAppleConnect = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Calling server action which will test CalDAV credentials
        const res = await saveAppleCalendarCredentials(appleEmail, applePassword)

        setIsLoading(false)

        if (res.success) {
            toast.success('Apple iCloud connected successfully!')
            setIsAppleConfigured(true)
            setIsAppleModalOpen(false)
            setAppleEmail('')
            setApplePassword('')
        } else {
            toast.error(res.error || 'Failed to connect. Please review your credentials.')
        }
    }

    const handleDisconnect = async () => {
        if (!confirmDisconnect.provider) return
        
        setIsLoading(true)
        const res = await removeIntegration(confirmDisconnect.provider)
        setIsLoading(false)
        
        if (res.success) {
            toast.success(`${confirmDisconnect.provider === 'apple' ? 'Apple' : 'Google'} Calendar disconnected.`)
            if (confirmDisconnect.provider === 'apple') setIsAppleConfigured(false)
            if (confirmDisconnect.provider === 'google') setIsGoogleConfigured(false)
            setConfirmDisconnect({ isOpen: false, provider: null })
        } else {
            toast.error(res.error || 'Failed to disconnect.')
        }
    }

    return (
        <div className="mt-10">
            <div>
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" /> Master Calendar Integrations
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
                    Connect your primary calendar to enable 2-way sync. Leads will automatically be scheduled and external conflicts will be blocked.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Calendar */}
                <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm group hover:border-blue-500/30 transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-sm border border-blue-100 dark:border-blue-800/50">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        {isGoogleConfigured ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                Off
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="mb-6">
                            <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">Google Calendar</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Sincronização direta com Google Workspace ou Gmail pessoal.
                            </p>
                        </div>
                        <div className="mt-auto">
                            {isGoogleConfigured ? (
                                <button
                                    onClick={() => setConfirmDisconnect({ isOpen: true, provider: 'google' })}
                                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-900/50 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 h-10 px-4 py-2 gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Desconectar
                                </button>
                            ) : (
                                <button
                                    onClick={handleGoogleConnect}
                                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-blue-200 dark:border-blue-900/50 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 h-10 px-4 py-2 cursor-pointer"
                                >
                                    Conectar Google
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Apple iCloud Calendar */}
                <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm group hover:border-zinc-400/50 dark:hover:border-zinc-600/50 transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shrink-0 shadow-sm border border-zinc-200 dark:border-zinc-700">
                            <Cloud className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsAppleTipsOpen(true)}
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:scale-110 transition-all"
                                title="Sync Tips"
                            >
                                <Info className="w-4 h-4" />
                            </button>
                            {isAppleConfigured ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                                    <CheckCircle2 className="w-3 h-3" /> Active
                                </span>
                            ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                    Off
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="mb-6">
                            <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">Apple Calendar</h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Integração via iCloud CalDAV com senha de aplicativo.
                            </p>
                        </div>

                        <div className="mt-auto">
                            {isAppleConfigured ? (
                                <button
                                    onClick={() => setConfirmDisconnect({ isOpen: true, provider: 'apple' })}
                                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-900/50 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 h-10 px-4 py-2 gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Desconectar
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setIsAppleModalOpen(true); setAppleStep(1); }}
                                    className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 h-10 px-4 py-2 shrink-0 cursor-pointer"
                                >
                                    Conectar Apple
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Apple iCloud Connection Modal with Tutorial */}
            {isAppleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-zinc-900 dark:text-white">
                                    <Cloud className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Connect iCloud Calendar</h2>
                                    <p className="text-xs text-zinc-500 font-medium">Step {appleStep} of 2</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAppleModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {appleStep === 1 ? (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-900 dark:text-indigo-200 flex gap-3">
                                        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                        <p className="leading-relaxed">
                                            Because Apple is highly secure, you shouldn't use your main Apple ID password. Instead, you need to generate a special password just for Mentor CRM.
                                        </p>
                                    </div>
                                    <div className="space-y-4 relative pl-3 border-l-2 border-zinc-200 dark:border-zinc-800">
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950" />
                                            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">1. Go to Apple ID website</h4>
                                            <p className="text-sm text-zinc-500 mt-1">Visit <a href="https://appleid.apple.com" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">appleid.apple.com</a> and sign in.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950" />
                                            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">2. Find "App-Specific Passwords"</h4>
                                            <p className="text-sm text-zinc-500 mt-1">Navigate to <strong>Sign-In and Security</strong> and select <strong>App-Specific Passwords</strong>.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 border-4 border-white dark:border-zinc-950" />
                                            <h4 className="font-semibold text-zinc-900 dark:text-white text-sm">3. Generate Password</h4>
                                            <p className="text-sm text-zinc-500 mt-1">Click the + button, name it "Mentor CRM", and copy the code (e.g., aaaa-bbbb-cccc-dddd).</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white dark:border-zinc-950 shadow-sm shadow-emerald-500/50" />
                                            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">4. Important: Check your iPhone</h4>
                                            <p className="text-[13px] text-zinc-500 mt-1">
                                                Ensure <strong>Calendars</strong> is toggled ON in <i>Settings &gt; [Your Name] &gt; iCloud</i>. If events don't show, pull down to refresh in your iPhone Calendar App.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setAppleStep(2)}
                                        className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                                    >
                                        I have my password <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleAppleConnect} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            Apple ID Email
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={appleEmail}
                                            onChange={(e) => setAppleEmail(e.target.value)}
                                            placeholder="youremail@icloud.com"
                                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <KeyRound className="w-4 h-4 text-zinc-400" /> App-Specific Password
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={applePassword}
                                            onChange={(e) => setApplePassword(e.target.value)}
                                            placeholder="aaaa-bbbb-cccc-dddd"
                                            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setAppleStep(1)}
                                            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-medium transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isLoading || !appleEmail || !applePassword}
                                            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50"
                                        >
                                            <Lock className="w-4 h-4" /> {isLoading ? 'Connecting...' : 'Secure Connect'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Apple Sync Help Modal */}
            {isAppleTipsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="p-6 text-center space-y-4">
                            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto transform rotate-6 scale-110">
                                <Info className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Apple Sync Pro Tips</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Apple covers your data with multiple security layers. Follow these tips for a perfect integration.
                            </p>
                        </div>
                        
                        <div className="px-6 pb-8 space-y-4">
                            <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg h-fit">
                                    <KeyRound className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">App-Specific Password</h4>
                                    <p className="text-xs text-zinc-500 mt-1">You MUST generate a specific password at appleid.apple.com to allow CalDAV access.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg h-fit">
                                    <Cloud className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">iCloud Settings</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Ensure <strong>Calendars</strong> is enabled in <i>Settings &gt; [Name] &gt; iCloud</i> on your iPhone.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg h-fit">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Force Refresh</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Open iPhone Calendar App &gt; click Calendars &gt; <strong>Pull down</strong> to force a server sync.</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsAppleTipsOpen(false)}
                                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl py-3 text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors mt-2"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Disconnect Confirmation Modal */}
            {confirmDisconnect.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden text-center p-6 space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                             <Trash2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Disconnect {confirmDisconnect.provider === 'apple' ? 'Apple' : 'Google'}?</h3>
                            <p className="text-sm text-zinc-500 mt-1">
                                Sincronização de eventos será interrompida imediatamente.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setConfirmDisconnect({ isOpen: false, provider: null })}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Removing...' : 'Disconnect'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
