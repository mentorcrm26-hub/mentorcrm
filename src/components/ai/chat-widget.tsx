'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatWidgetProps {
    configId: string;
    primaryColor?: string;
    title?: string;
    subtitle?: string;
    welcomeMessage?: string;
}

export function AIChatWidget({
    configId,
    primaryColor = '#3b82f6',
    title = 'Assistente Mentor',
    subtitle = 'Normalmente responde na hora',
    welcomeMessage = 'Olá! Como posso ajudar você hoje?'
}: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');

    // USANDO O PADRÃO ABSOLUTO DA SDK PARA EVITAR QUALQUER ERRO DE FUNÇÃO
    const {
        messages,
        sendMessage,
        status,
    } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/ai/chat',
            body: { configId },
        }),
        messages: [
            {
                id: 'welcome-v6',
                role: 'assistant',
                parts: [{ type: 'text', text: welcomeMessage }],
            }
        ] as UIMessage[],
    });

    const isLoading = status === 'streaming' || status === 'submitted';

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async (e?: { preventDefault?: () => void }) => {
        if (e?.preventDefault) e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        
        const text = inputValue;
        setInputValue('');
        await sendMessage({ text });
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="mb-4 w-[400px] h-[620px] flex flex-col bg-[#050505] rounded-[2.5rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden ring-1 ring-white/10"
                    >
                        {/* Header */}
                        <div
                            className="p-6 flex items-center justify-between shrink-0"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border border-white/20 backdrop-blur-xl">
                                    <Bot size={26} className="text-white" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-[16px] font-bold text-white tracking-tight">{title}</h3>
                                    <div className="flex items-center gap-2 mt-1.5 text-white/70">
                                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">{subtitle}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-3 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Messages - Sólido e legível */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-zinc-950/20 custom-scrollbar"
                        >
                            {(messages || []).map((m, idx) => (
                                <div
                                    key={m.id || `msg-${idx}`}
                                    className={cn(
                                        "flex flex-col max-w-[85%]",
                                        m.role === 'user' ? 'ml-auto items-end' : 'items-start'
                                    )}
                                >
                                    <div className={cn(
                                        "px-4.5 py-3 rounded-[1.25rem] text-[14.5px] leading-relaxed shadow-lg",
                                        m.role === 'user'
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-zinc-900 text-zinc-100 border border-white/5 rounded-tl-none font-medium"
                                    )}>
                                        {m.parts.map((part, i) => {
                                            if (part.type === 'text') return <span key={i}>{part.text}</span>;
                                            return null;
                                        })}
                                    </div>
                                    <span className="mt-2 px-1 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
                                        {m.role === 'user' ? 'Você' : 'Suporte Mentor'}
                                    </span>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-center gap-3 text-[11px] font-black text-blue-500 uppercase tracking-widest px-2">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Processando</span>
                                </div>
                            )}
                        </div>

                        {/* Input Footer - PRETO PURO PARA VISIBILIDADE MAXIMA */}
                        <div className="p-6 bg-[#000000] border-t border-white/5 shrink-0">
                            <form
                                onSubmit={handleSubmit}
                                className="relative flex items-center gap-3"
                            >
                                <input
                                    value={inputValue || ''}
                                    onChange={handleInputChange}
                                    placeholder="Como podemos ajudar?"
                                    className="flex-1 bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4.5 text-[15px] text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-zinc-600 block"
                                    style={{ color: '#ffffff', backgroundColor: '#111112' }}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue?.trim()}
                                    className="bg-blue-600 p-4 rounded-2xl text-white hover:bg-blue-500 disabled:opacity-20 flex items-center justify-center transition-all active:scale-95 shadow-2xl shadow-blue-600/30"
                                >
                                    {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                                </button>
                            </form>
                            <div className="mt-5 text-center opacity-10">
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                                    Mentor AI v6.0 • Final
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Launcher */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="flex h-16 w-16 items-center justify-center rounded-[1.8rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/15 transition-all group overflow-hidden"
                    style={{ backgroundColor: primaryColor }}
                >
                    <MessageCircle className="text-white group-hover:scale-110 transition-transform" size={32} />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
            )}
        </div>
    );
}
