/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

'use client'

import { useState } from 'react'
import { MessageSquareText, CheckCircle2, Trash2, X, Plus, RefreshCw, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { saveTwilioCredentials, disconnectTwilio } from './twilio-actions'

export function TwilioIntegrationCard({ 
    initialData 
}: { 
    initialData?: any 
}) {
    const [integration, setIntegration] = useState(initialData)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isConfirmDisconnectOpen, setIsConfirmDisconnectOpen] = useState(false)

    // Form inputs
    const [accountSid, setAccountSid] = useState(initialData?.credentials?.accountSid || '')
    const [authToken, setAuthToken] = useState(initialData?.credentials?.authToken || '')
    const [phoneNumber, setPhoneNumber] = useState(initialData?.credentials?.phoneNumber || '')

    const isConnected = integration?.credentials?.status === 'connected'

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const res = await saveTwilioCredentials(accountSid, authToken, phoneNumber)
        setIsLoading(false)

        if (res.success) {
            setIntegration({ credentials: res.data })
            setIsCreateModalOpen(false)
            toast.success('Twilio connected successfully!')
        } else {
            toast.error(res.error || 'Erro ao salvar credenciais')
        }
    }

    const handleDisconnect = async () => {
        setIsConfirmDisconnectOpen(false)
        setIsLoading(true)
        const res = await disconnectTwilio()
        setIsLoading(false)

        if (res.success) {
            setIntegration(null)
            setAccountSid('')
            setAuthToken('')
            setPhoneNumber('')
            toast.success('Twilio disconnected')
        } else {
            toast.error(res.error || 'Failed to disconnect')
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm group hover:border-rose-500/30 transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-sm border border-rose-100 dark:border-rose-800/50">
                        <MessageSquareText className="w-5 h-5" />
                    </div>
                    {isConnected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            Disconnected
                        </span>
                    )}
                </div>
                <div className="flex flex-col flex-1">
                    <div className="mb-6">
                        <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">Twilio SMS Integration</h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {isConnected 
                                ? `Connected to number ${integration?.credentials?.phoneNumber}`
                                : 'Connect your Twilio account to send automated SMS.'}
                        </p>
                    </div>

                    <div className="mt-auto space-y-2">
                        {isConnected ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    disabled={isLoading}
                                    className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 h-10 px-4 py-2 gap-2 cursor-pointer"
                                >
                                    Edit Credentials
                                </button>
                                <button
                                    onClick={() => setIsConfirmDisconnectOpen(true)}
                                    disabled={isLoading}
                                    title="Disconnect Twilio"
                                    className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-900/50 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 h-10 w-10 px-0 py-0 flex-col cursor-pointer"
                                >
                                    <Trash2 className="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-rose-200 dark:border-rose-900/50 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 h-10 px-4 py-2 gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Connect Twilio
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Create/Edit Instance Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Twilio API Settings</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Account SID</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:ring-rose-500/20 transition-colors"
                                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                        value={accountSid}
                                        onChange={e => setAccountSid(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Auth Token</label>
                                    <input 
                                        type="password"
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:ring-rose-500/20 transition-colors"
                                        placeholder="••••••••••••••••••••••••••••••••"
                                        value={authToken}
                                        onChange={e => setAuthToken(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-900 dark:text-white">Phone Number</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:border-rose-500 focus:ring-rose-500/20 transition-colors"
                                        placeholder="+1234567890"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-zinc-500">Include the country code. Ex: +14075551234.</p>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2.5 text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save API Credentials'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirm Disconnect Modal */}
            {isConfirmDisconnectOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-sm border border-red-200 dark:border-red-800">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Disconnect Twilio?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Are you sure you want to disable Twilio integration? Your SMS capabilities will stop immediately.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Yes, Disconnect'}
                            </button>
                            <button 
                                onClick={() => setIsConfirmDisconnectOpen(false)}
                                disabled={isLoading}
                                className="w-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-bold py-3 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
