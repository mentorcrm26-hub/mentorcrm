'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState } from 'react'
import { X, Send, MessageSquareText, Mail, Loader2, Megaphone, AlertCircle, ShieldAlert, Clock, Plus } from 'lucide-react'
import { Lead } from '@/types/leads'
import { manualSendMessage } from '@/app/dashboard/leads/actions'
import { toast } from 'sonner'


export function BroadcastModal({
    isOpen,
    onClose,
    columnTitle,
    leads,
    colorClass
}: {
    isOpen: boolean
    onClose: () => void
    columnTitle: string | null
    leads: Lead[]
    colorClass: string | null
}) {
    const [message, setMessage] = useState('')
    const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp')
    const [delaySeconds, setDelaySeconds] = useState<number>(15)
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [currentSendIndex, setCurrentSendIndex] = useState<number>(-1)

    if (!isOpen || !columnTitle) return null

    // Compute how many valid leads we have for the chosen channel
    const validLeads = leads.filter(lead =>
        (channel === 'whatsapp' || channel === 'sms') ? !!lead.phone : !!lead.email
    )

    const invalidCount = leads.length - validLeads.length

    const handleSend = async () => {
        if (!message.trim()) return
        setIsLoading(true)

        try {
            // Process each lead sequentially with the specified delay
            for (let i = 0; i < validLeads.length; i++) {
                const lead = validLeads[i]
                setCurrentSendIndex(i)
                
                console.log(`[BROADCAST] Sending to ${lead.name} (${i + 1}/${validLeads.length}). Channel: ${channel}`)
                
                // Call server action for each lead
                const res = await manualSendMessage('custom', {
                    ...lead,
                    type: channel,
                    content: message
                })

                if (!res.success) {
                    console.error(`Failed to send to ${lead.name}:`, res.error)
                    toast.error(`Error sending to ${lead.name}`)
                }

                // Wait if not the last one
                if (i < validLeads.length - 1) {
                    const waitTime = delaySeconds * 1000
                    console.log(`[BROADCAST] Waiting ${delaySeconds}s before next message...`)
                    await new Promise(resolve => setTimeout(resolve, waitTime))
                }
            }

            setCurrentSendIndex(-1)
            setIsSuccess(true)
            toast.success(`Broadcast sent successfully to ${validLeads.length} leads!`)
            
            setTimeout(() => {
                setIsSuccess(false)
                setMessage('')
                onClose()
            }, 3000)
        } catch (error: any) {
            console.error('Broadcast failed:', error)
            toast.error('Failed to send broadcast: ' + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-zinc-200 dark:border-zinc-800`}>

                {/* Decorative top border matching the column color */}
                <div className={`h-1.5 w-full ${colorClass || 'bg-zinc-500'}`} />

                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Column Broadcast
                            </h2>
                            <p className="text-sm text-zinc-500 font-medium">
                                To: {columnTitle} ({leads.length} leads)
                            </p>
                        </div>
                    </div>
                    {!isLoading && (
                        <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {isSuccess ? (
                        <div className="py-8 text-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Broadcast Sent!</h3>
                            <p className="text-zinc-500 mt-1">Messages delivered to {validLeads.length} valid contacts.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Channel Selector */}
                            <div>
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 block">
                                    Delivery Channel
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setChannel('whatsapp')}
                                        disabled={isLoading}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${channel === 'whatsapp' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'} disabled:opacity-50`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mb-1" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                                            <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                                        </svg>
                                        <span className="text-xs font-semibold">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={() => setChannel('sms')}
                                        disabled={isLoading}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${channel === 'sms' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'} disabled:opacity-50`}
                                    >
                                        <MessageSquareText className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-semibold">SMS</span>
                                    </button>
                                    <button
                                        onClick={() => setChannel('email')}
                                        disabled={isLoading}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${channel === 'email' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:border-zinc-200 dark:hover:border-zinc-700'} disabled:opacity-50`}
                                    >
                                        <Mail className="w-5 h-5 mb-1" />
                                        <span className="text-xs font-semibold">Email</span>
                                    </button>
                                </div>
                            </div>

                            {/* Delivery Delay Config */}
                            {(channel === 'whatsapp' || channel === 'sms') && (
                                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex gap-3">
                                        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Anti-Ban Protection</h4>
                                            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-1 leading-relaxed">
                                                Sending too many messages too quickly may cause Meta or Carrier networks to block your number. We strongly recommend keeping a secure delay between messages.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                            <Clock className="w-4 h-4 text-zinc-400" />
                                            Delay Between Messages:
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="5"
                                                max="120"
                                                disabled={isLoading}
                                                value={delaySeconds}
                                                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                                                className="w-16 p-1 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm font-semibold shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:opacity-50"
                                            />
                                            <span className="text-sm text-zinc-500 font-medium">sec</span>
                                        </div>
                                    </div>

                                    {delaySeconds < 10 && (
                                        <p className="text-xs text-red-500 font-medium px-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" /> Delay under 10 seconds is highly risky!
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Eligibility Alert */}
                            <div className="flex gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm">
                                <AlertCircle className="w-5 h-5 text-zinc-500 shrink-0" />
                                <div className="text-zinc-600 dark:text-zinc-400">
                                    Message will be sent to <strong className="text-zinc-900 dark:text-zinc-100">{validLeads.length} valid leads</strong>.
                                    {invalidCount > 0 && ` (${invalidCount} omitted due to missing contact info).`}
                                </div>
                            </div>

                            {/* Message Area */}
                            <div>
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2 flex justify-between items-center">
                                    Message Composition
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Dynamic tags:</span>
                                        <button 
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => setMessage(prev => prev + '{name}')}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-[10px] font-bold disabled:opacity-50"
                                        >
                                            <Plus className="w-2.5 h-2.5" />
                                            {'{name}'}
                                        </button>
                                    </div>
                                </label>
                                <textarea
                                    value={message}
                                    disabled={isLoading}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={`Hi {name},\n\nWe noticed you are interested in...`}
                                    rows={5}
                                    className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-white resize-none disabled:opacity-75"
                                />

                                <div className="flex gap-2 mt-2">
                                    <button
                                        disabled={isLoading}
                                        onClick={() => setMessage(`Hello {name},\n\nJust a quick broadcast message to say hi!`)}
                                        className="px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                                    >
                                        Use Standard Greeting
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {!isSuccess && (
                    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                        {isLoading ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-zinc-500">
                                    <span>Sending Progress</span>
                                    <span>{currentSendIndex + 1} / {validLeads.length}</span>
                                </div>
                                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                                        style={{ width: `${((currentSendIndex + 1) / validLeads.length) * 100}%` }}
                                    />
                                </div>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 animate-pulse text-center font-medium">
                                    Sending to <span className="text-zinc-900 dark:text-white font-bold">{validLeads[currentSendIndex]?.name}</span>...
                                </p>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading || !message.trim() || validLeads.length === 0}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    <Megaphone className="w-4 h-4" />
                                    Broadcast to {validLeads.length} leads
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
