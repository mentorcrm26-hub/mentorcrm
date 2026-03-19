'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
    Send, 
    Phone, 
    User, 
    MessageSquareOff, 
    UserCircle2, 
    StickyNote, 
    MessageCircle,
    Search,
    MoreVertical,
    CheckCheck,
    Zap,
    Shield,
    Paperclip,
    File,
    Image as ImageIcon,
    Video,
    X,
    Smile
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { getMessages, sendMessage, markAsRead, sendInternalNote, getConversation, sendMediaMessage } from './chat-actions'
import { toast } from 'sonner'
import { format } from 'date-fns'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Lead {
    id: string
    name: string
    phone: string
    email: string | null
}

interface Conversation {
    id: string
    last_message_at: string
    last_message_content: string
    unread_count: number
    lead: Lead
}

interface Message {
    id: string
    direction: 'inbound' | 'outbound'
    content: string
    status: string
    created_at: string
    is_internal?: boolean
    media_url?: string
    media_type?: 'image' | 'video' | 'document' | 'audio'
}

export function ChatClient({ 
    initialConversations, 
    tenantId, 
    whatsappConnected,
    instanceName
}: { 
    initialConversations: Conversation[]
    tenantId: string
    whatsappConnected: boolean
    instanceName?: string
}) {
    const supabase = createClient()
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [messageMode, setMessageMode] = useState<'direct' | 'note'>('direct')
    const [isSending, setIsSending] = useState(false)
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const emojiPickerRef = useRef<HTMLDivElement>(null)

    const EMOJI_CATEGORIES = [
        { label: '😊 Frequentes', emojis: ['😊','😂','❤️','👍','🔥','✨','🎉','💯','🙏','😍','🤔','😢','😅','🤣','😘','💪','👏','🥰','😎','🤩','😆','😁','🥳','😜','🤗'] },
        { label: '😀 Rostos', emojis: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝'] },
        { label: '🎭 Gestos', emojis: ['👍','👎','👊','✊','🤛','🤜','👋','🤚','🖐️','✋','🤙','💪','🦾','🤝','👐','🙌','🤲','🙏','✌️','🤞','🤟','🤘','👌','🤌','🤏'] },
        { label: '❤️ Corações', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☯️','🔯'] },
        { label: '🎊 Celebração', emojis: ['🎉','🎊','🎈','🎁','🎀','🏆','🥇','🎖️','🏅','🎗️','🎟️','🎫','🎠','🎡','🎢','🎪','🎭','🎨','🖼️','🎬','🎤','🎵','🎶','🎸','🎯'] },
        { label: '🌟 Símbolos', emojis: ['⭐','🌟','✨','💫','⚡','🔥','🌈','☀️','🌙','❄️','💥','🎆','🎇','🌊','💨','🌸','🌺','🍀','🌴','🌿','🍃','🦋','🐝','🌻','🌷'] },
    ]

    // Close emoji picker on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
                setShowEmojiPicker(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const insertEmoji = (emoji: string) => {
        const ta = textareaRef.current
        if (!ta) { setNewMessage(prev => prev + emoji); return }
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const newVal = newMessage.slice(0, start) + emoji + newMessage.slice(end)
        setNewMessage(newVal)
        // Restore cursor position after emoji
        setTimeout(() => {
            ta.focus()
            ta.setSelectionRange(start + emoji.length, start + emoji.length)
        }, 0)
    }
    
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }

    const activeConversationRef = useRef<Conversation | null>(activeConversation)
    useEffect(() => {
        activeConversationRef.current = activeConversation
    }, [activeConversation])

    // Realtime Subscriptions
    useEffect(() => {
        const channel = supabase.channel('chat_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages', filter: `tenant_id=eq.${tenantId}` },
                (payload) => {
                    const newMsg = payload.new as Message
                    const currentActive = activeConversationRef.current
                    
                    // Always clear unread if we send a message
                    const msgConvId = (newMsg as any).conversation_id;
                    if (newMsg.direction === 'outbound' && currentActive && msgConvId === currentActive.id) {
                        setConversations(prev => prev.map(c => c.id === currentActive.id ? { ...c, unread_count: 0 } : c))
                    }

                    if (currentActive && (payload.new as any).conversation_id === currentActive.id) {
                        if (payload.eventType === 'INSERT') {
                            setMessages(prev => [...prev, newMsg])
                            if (newMsg.direction === 'inbound') {
                                markAsRead(currentActive.id)
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            setMessages(prev => {
                                const exists = prev.find(m => m.id === newMsg.id);
                                if (exists) {
                                    return prev.map(m => m.id === newMsg.id ? newMsg : m);
                                }
                                // If it doesn't exist (e.g. was just upserted/updated but not in state), add it!
                                return [...prev, newMsg];
                            });
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${tenantId}` },
                async (payload) => {
                    const conv = payload.new as Conversation
                    if (payload.eventType === 'INSERT') {
                        const res = await getConversation(conv.id)
                        if (res.success && res.data) {
                            setConversations(prev => [res.data as Conversation, ...prev.filter(c => c.id !== conv.id)])
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        setConversations(prev => {
                            const exists = prev.find(c => c.id === conv.id)
                            if (!exists) return prev;
                            
                            // If this updated conversation is our active one, force unread_count to remain 0
                            const currentActive = activeConversationRef.current
                            const finalUnreadCount = (currentActive?.id === conv.id) ? 0 : conv.unread_count;

                            const updatedConv = { 
                                ...exists, 
                                ...conv, 
                                unread_count: finalUnreadCount,
                                lead: exists.lead 
                            }
                            return [updatedConv, ...prev.filter(c => c.id !== conv.id)]
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, tenantId])

    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.id)
            if (activeConversation.unread_count > 0) {
                markAsRead(activeConversation.id).then(() => {
                    setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, unread_count: 0 } : c))
                })
            }
        }
    }, [activeConversation])
    
    // Auto-select conversation if leadId is in URL
    const searchParams = useSearchParams()
    useEffect(() => {
        const leadId = searchParams.get('leadId')
        if (leadId && !activeConversation && conversations.length > 0) {
            const conversation = conversations.find(c => c.lead.id === leadId)
            if (conversation) {
                setActiveConversation(conversation)
            }
        }
    }, [searchParams, conversations, activeConversation])

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth')
        }
    }, [messages])

    async function loadMessages(convId: string) {
        setIsLoadingMessages(true)
        const res = await getMessages(convId)
        if (res.success && res.data) {
            setMessages(res.data)
        }
        setIsLoadingMessages(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File size must be less than 10MB")
                return
            }
            setSelectedFile(file)
        }
    }

    const uploadFile = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${tenantId}/${activeConversation?.id}/${fileName}`

            const { data: uploadData, error } = await supabase.storage
                .from('chat-media')
                .upload(filePath, file)

            if (error) {
                console.error('[UPLOAD ERROR]', error)
                toast.error(`Erro no upload: ${error.message}`)
                return null
            }

            const { data: { publicUrl } } = supabase.storage
                .from('chat-media')
                .getPublicUrl(filePath)

            return publicUrl
        } catch (error: any) {
            console.error('[UPLOAD CATCH]', error)
            toast.error(`Erro inesperado: ${error.message || 'Verifique o console'}`)
            return null
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if ((!newMessage.trim() && !selectedFile) || !activeConversation || isSending) return

        setIsSending(true)
        try {
            if (selectedFile) {
                setIsUploading(true)
                const mediaUrl = await uploadFile(selectedFile)
                setIsUploading(false)

                if (mediaUrl) {
                    const mediaType = selectedFile.type.startsWith('image/') ? 'image' : 
                                     selectedFile.type.startsWith('video/') ? 'video' : 
                                     selectedFile.type.startsWith('audio/') ? 'audio' : 'document'

                    const res = await sendMediaMessage(
                        activeConversation.id,
                        activeConversation.lead.phone,
                        mediaUrl,
                        mediaType as any,
                        instanceName || 'INSTANCE',
                        newMessage.trim() || undefined,
                        selectedFile.name
                    )

                    if (!res.success) throw new Error(res.error)
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                }
            } else if (newMessage.trim()) {
                if (messageMode === 'note') {
                    const res = await sendInternalNote(activeConversation.id, newMessage)
                    if (!res.success) throw new Error(res.error)
                } else {
                    const res = await sendMessage(
                        activeConversation.id,
                        activeConversation.lead.phone,
                        newMessage,
                        instanceName || 'INSTANCE'
                    )
                    if (!res.success) throw new Error(res.error)
                }
            }
            setNewMessage('')
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message')
        } finally {
            setIsSending(false)
        }
    }

    const filteredConversations = conversations.filter(c => 
        c.lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.lead.phone.includes(searchQuery)
    )

    if (!whatsappConnected) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md p-10 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-xl"
                >
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <MessageSquareOff className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-semibold mb-3 tracking-tight text-zinc-900 dark:text-white">Active Channel</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">Connect your WhatsApp instance in settings to start live communication with your leads.</p>
                    <Link href="/dashboard/settings" className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                        <Zap className="w-4 h-4 fill-current" />
                        Connect Now
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex h-full w-full overflow-hidden font-sans text-zinc-900 dark:text-zinc-100 gap-6">
            {/* Sidebar List */}
            <div className="w-96 flex flex-col bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm shrink-0">
                <div className="p-6 border-b border-zinc-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
                        <div className="px-3 py-1 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active</span>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-500"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    <AnimatePresence mode="popLayout">
                        {filteredConversations.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium"
                            >
                                No signals detected
                            </motion.div>
                        ) : (
                            filteredConversations.map((conv, idx) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={conv.id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full text-left p-4 rounded-2xl transition-all flex gap-4 group relative ${
                                        activeConversation?.id === conv.id 
                                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                                    }`}
                                >
                                    {/* Unread indicator removed from here to be placed inside the flex row below */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                                        activeConversation?.id === conv.id 
                                            ? 'bg-white/20 border-white/20' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-white/5'
                                    }`}>
                                        <UserCircle2 className={`w-7 h-7 ${activeConversation?.id === conv.id ? 'text-white' : 'text-zinc-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-sm truncate uppercase tracking-tight">{conv.lead.name}</span>
                                            <span suppressHydrationWarning className={`text-[10px] font-medium ${activeConversation?.id === conv.id ? 'text-emerald-100' : 'text-zinc-400'}`}>
                                                {format(new Date(conv.last_message_at), 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs truncate max-w-[170px] ${activeConversation?.id === conv.id ? 'text-emerald-50' : 'text-zinc-500'}`}>
                                                {conv.last_message_content || 'Sem mensagens...'}
                                            </span>
                                            {conv.unread_count > 0 && (
                                                <span className={`flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-red-600 text-white text-[10px] font-bold rounded-full ${
                                                    activeConversation?.id === conv.id ? 'border-2 border-emerald-600 shadow-inner' : 'border-2 border-white dark:border-zinc-900 shadow-sm'
                                                }`}>
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.button>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Chat Board Area */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-white/90 to-white/50 dark:from-zinc-900/90 dark:to-zinc-900/50 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm relative">
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-white/5">
                                    <UserCircle2 className="w-7 h-7 text-zinc-400" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="font-semibold text-lg tracking-tight text-zinc-900 dark:text-white uppercase">{activeConversation.lead.name}</h3>
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                        <Phone className="w-3.5 h-3.5 opacity-60"/> {activeConversation.lead.phone}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-200 dark:border-white/5">
                                    <Shield className="w-3 h-3 text-emerald-500" />
                                    SECURE_COMM
                                </div>
                                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                    <MoreVertical className="w-5 h-5 text-zinc-400" />
                                </button>
                            </div>
                        </div>

                        {/* Stream */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative">
                            <AnimatePresence initial={false}>
                                {isLoadingMessages ? (
                                    <div className="flex justify-center p-8">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.3s]" />
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-.5s]" />
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400/50">
                                        <MessageCircle className="w-12 h-12 mb-4" />
                                        <p className="text-sm font-medium uppercase tracking-widest">Initial signal expected</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {messages.map((msg) => {
                                            const isOutbound = msg.direction === 'outbound'
                                            const isInternal = msg.is_internal

                                            if (isInternal) {
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.98 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        key={msg.id} 
                                                        className="flex justify-center my-6"
                                                    >
                                                        <div className="max-w-[80%] bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-500/20 rounded-2xl p-5 shadow-sm relative group">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Workspace Note</span>
                                                            </div>
                                                            <p className="text-sm italic font-serif leading-relaxed text-zinc-800 dark:text-amber-100/90">{msg.content}</p>
                                                            <div suppressHydrationWarning className="mt-3 text-[9px] font-bold text-amber-600/60 dark:text-amber-400/40 text-right uppercase tracking-tighter">
                                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            }

                                             return (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: isOutbound ? 10 : -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    key={msg.id} 
                                                    className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm border ${
                                                        isOutbound 
                                                            ? 'bg-emerald-600 text-white rounded-br-sm border-emerald-500 shadow-emerald-500/10' 
                                                            : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm border-zinc-200 dark:border-white/5'
                                                    }`}>
                                                        {msg.media_url && (
                                                            <div className="mb-2">
                                                                {msg.media_type === 'image' ? (
                                                                    <img src={msg.media_url} alt="Media" className="max-w-full h-auto rounded-2xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(msg.media_url)} />
                                                                ) : msg.media_type === 'audio' ? (
                                                                    <div className="flex flex-col gap-2">
                                                                        <audio src={msg.media_url} controls className="w-full h-10" />
                                                                        <p className="text-[10px] opacity-60 px-2 italic">Audio Message</p>
                                                                    </div>
                                                                ) : msg.media_type === 'video' ? (
                                                                    <video src={msg.media_url} controls className="max-w-full h-auto rounded-2xl" />
                                                                ) : (
                                                                    <a href={msg.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                                                        <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                                                            <File className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-bold truncate">DOCUMENT</p>
                                                                            <p className="text-[10px] opacity-60">Click to view/download</p>
                                                                        </div>
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                        {msg.content && msg.content !== `Sent ${msg.media_type}` && (
                                                            <p className="text-sm leading-relaxed antialiased whitespace-pre-wrap">{msg.content}</p>
                                                        )}
                                                        <div className={`flex items-center gap-1.5 mt-2 opacity-60 justify-end transition-opacity`}>
                                                            <span suppressHydrationWarning className="text-[9px] font-bold uppercase tracking-tighter">
                                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                            </span>
                                                            {isOutbound && (
                                                                <CheckCheck className={`w-3 h-3 ${msg.status === 'read' ? 'text-emerald-200' : ''}`} />
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Hub */}
                        <div className="p-6 pt-0 z-20">
                            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl p-4 shadow-lg space-y-4">
                                <div className="flex gap-4 border-b border-zinc-200 dark:border-white/5 pb-3">
                                    <button 
                                        onClick={() => setMessageMode('direct')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                                            messageMode === 'direct' 
                                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                        }`}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </button>
                                    <button 
                                        onClick={() => setMessageMode('note')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all ${
                                            messageMode === 'note' 
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm' 
                                                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                                        }`}
                                    >
                                        <StickyNote className="w-4 h-4" />
                                        Internal Note
                                    </button>
                                </div>

                                <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleFileSelect}
                                        accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                                    />
                                    {/* Emoji + Attachment buttons */}
                                    <div className="flex items-center gap-1 relative" ref={emojiPickerRef}>
                                        {/* Emoji button */}
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(p => !p)}
                                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                                                showEmojiPicker ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-emerald-500'
                                            }`}
                                        >
                                            <Smile className="w-5 h-5" />
                                        </button>

                                        {/* Attachment button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-emerald-500"
                                        >
                                            <Paperclip className="w-5 h-5" />
                                        </button>

                                        {/* Emoji Picker Popup */}
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 left-0 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50">
                                                <div className="p-3 border-b border-zinc-100 dark:border-white/5">
                                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Emojis</p>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto p-2 space-y-3 custom-scrollbar">
                                                    {EMOJI_CATEGORIES.map(cat => (
                                                        <div key={cat.label}>
                                                            <p className="text-[10px] font-bold text-zinc-400 uppercase px-1 mb-1">{cat.label}</p>
                                                            <div className="grid grid-cols-8 gap-0.5">
                                                                {cat.emojis.map(emoji => (
                                                                    <button
                                                                        key={emoji}
                                                                        type="button"
                                                                        onClick={() => { insertEmoji(emoji); setShowEmojiPicker(false) }}
                                                                        className="text-xl p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors leading-none"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col gap-2">
                                        {selectedFile && (
                                            <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    {selectedFile.type.startsWith('image/') ? <ImageIcon className="w-4 h-4 text-emerald-500" /> : <File className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold truncate">{selectedFile.name}</p>
                                                    <p className="text-[10px] opacity-50 uppercase font-black">Ready to launch</p>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        setSelectedFile(null)
                                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                                    }}
                                                    className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                        <textarea
                                            ref={textareaRef}
                                            rows={1}
                                            value={newMessage}
                                            onChange={(e) => {
                                                setNewMessage(e.target.value)
                                                e.target.style.height = 'auto'
                                                e.target.style.height = `${e.target.scrollHeight}px`
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault()
                                                    handleSendMessage(e)
                                                }
                                            }}
                                            placeholder={messageMode === 'note' ? "Write private note..." : "Send WhatsApp message..."}
                                            className="w-full min-h-[44px] max-h-32 bg-transparent border-none text-sm font-medium focus:ring-0 outline-none resize-none placeholder:text-zinc-400 py-2.5"
                                            disabled={isSending}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={(!newMessage.trim() && !selectedFile) || isSending}
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95 shadow-lg ${
                                            messageMode === 'note' 
                                                ? 'bg-amber-500 text-black hover:bg-amber-600 shadow-amber-500/20' 
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                                        } disabled:opacity-30`}
                                    >
                                        {isSending || isUploading ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400/30">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-zinc-900/50 p-16 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-xl"
                        >
                            <Zap className="w-16 h-16 mx-auto mb-6 opacity-20" />
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 uppercase tracking-tighter">Communication Hub</h2>
                            <p className="text-sm font-medium opacity-60">Select a lead to engage.</p>
                        </motion.div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(161, 161, 170, 0.15);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(161, 161, 170, 0.3);
                }
            `}</style>
        </div>
    )
}
