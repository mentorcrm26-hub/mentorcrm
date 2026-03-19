import { useState, useEffect } from 'react'
import { X, Send, MessageSquareText, Mail, Loader2, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parseTemplate } from '@/lib/integrations/message-parser'
import { manualSendMessage } from '@/app/dashboard/leads/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

// Keep synced with Kanban
type Lead = {
    id: string
    name: string
    email: string | null
    phone: string | null
    tenant_id?: string
}

export function SendMessageModal({
    isOpen,
    onClose,
    lead,
    type
}: {
    isOpen: boolean
    onClose: () => void
    lead: Lead | null
    type: 'whatsapp' | 'sms' | 'email' | null
}) {
    const router = useRouter()
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [templates, setTemplates] = useState<any[]>([])
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)
    const [sender, setSender] = useState<any>(null)

    useEffect(() => {
        if (isOpen) {
            fetchSender()
            if (type) fetchTemplates()
        }
    }, [isOpen, type])

    const fetchSender = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
            setSender(data)
        }
    }

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('message_templates')
            .select('*')
            .eq('type', type === 'email' ? 'email' : 'whatsapp')
            .order('name')
        
        setTemplates(data || [])
        setIsLoadingTemplates(false)
    }

    if (!isOpen || !lead || !type) return null

    const typeConfig = {
        whatsapp: {
            title: 'Send WhatsApp',
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
            buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            border: 'border-emerald-200 dark:border-emerald-800',
            placeholder: 'Type your WhatsApp message here...',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                </svg>
            )
        },
        sms: {
            title: 'Send SMS',
            color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
            buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
            border: 'border-blue-200 dark:border-blue-800',
            placeholder: 'Type your SMS message here...',
            icon: <MessageSquareText className="w-5 h-5" />
        },
        email: {
            title: 'Send Email',
            color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
            buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
            border: 'border-indigo-200 dark:border-indigo-800',
            placeholder: 'Subject: \n\nType your email content here...',
            icon: <Mail className="w-5 h-5" />
        }
    }

    const config = typeConfig[type]

    const handleSend = async () => {
        setIsLoading(true)
        try {
            const res = await manualSendMessage('custom', { ...lead, content: message, type }); 
            
            if (res.success) {
                setIsLoading(false)
                setIsSuccess(true)
                setTimeout(() => {
                    setIsSuccess(false)
                    setMessage('')
                    onClose()
                    // Redirecionar para o chat se for WhatsApp
                    if (type === 'whatsapp') {
                        router.push(`/dashboard/chat?leadId=${lead.id}`)
                    }
                }, 1500)
            } else {
                // Garantir que a mensagem seja uma string para não quebrar o React
                const errorMsg = typeof res.error === 'string' 
                    ? res.error 
                    : (res.error as any)?.message || 'Failed to send message.'
                
                toast.error(errorMsg)
                setIsLoading(false)
            }
        } catch (err: any) {
            toast.error(err?.message || 'An unexpected error occurred.')
            setIsLoading(false)
        }
    }

    const selectTemplate = (t: any) => {
        const parsed = parseTemplate(t.content, lead, sender)
        if (t.type === 'email' && t.subject) {
            const parsedSubject = parseTemplate(t.subject, lead, sender)
            setMessage(`Subject: ${parsedSubject}\n\n${parsed}`)
        } else {
            setMessage(parsed)
        }
    }

    const isMissingContact = (type === 'whatsapp' || type === 'sms') && !lead.phone
        || type === 'email' && !lead.email

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${config.border} animate-in zoom-in-95 duration-200`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.color}`}>
                            {config.icon}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {config.title}
                            </h2>
                            <p className="text-sm text-zinc-500 font-medium">
                                To: {lead.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {isMissingContact ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-center border border-red-100 dark:border-red-900/50">
                            <p className="font-medium">Missing Contact Information</p>
                            <p className="text-sm mt-1">This lead does not have a {type === 'email' ? 'valid email address' : 'valid phone number'} registered.</p>
                        </div>
                    ) : isSuccess ? (
                        <div className="py-8 text-center animate-in fade-in zoom-in">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Message Sent!</h3>
                            <p className="text-zinc-500 mt-1">The {type} was delivered successfully.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm flex justify-between items-center">
                                <div>
                                    <span className="font-medium text-zinc-700 dark:text-zinc-300">Destination:</span>{' '}
                                    <span className="text-zinc-500">{type === 'email' ? lead.email : lead.phone}</span>
                                </div>
                                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                            </div>

                            {/* Templates Selection */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Quick Templates</label>
                                <div className="flex flex-wrap gap-2">
                                    {isLoadingTemplates ? (
                                        <div className="flex items-center gap-2 text-xs text-zinc-400 py-1">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Loading templates...
                                        </div>
                                    ) : templates.length > 0 ? (
                                        templates.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => selectTemplate(t)}
                                                className="px-3 py-1.5 text-xs font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:border-indigo-500 hover:text-indigo-500 transition-all active:scale-95"
                                            >
                                                {t.name}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-zinc-400">No templates found for this channel.</p>
                                    )}
                                </div>
                            </div>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={config.placeholder}
                                rows={6}
                                className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-zinc-900 dark:text-white resize-none font-sans"
                            />
                        </div>
                    )}
                </div>

                {!isMissingContact && !isSuccess && (
                    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !message.trim()}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${config.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-500/10`}
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
