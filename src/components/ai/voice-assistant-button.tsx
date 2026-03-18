'use client';

import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Loader2, Bot } from 'lucide-react';
import { vapiService } from '@/lib/vapi/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface VoiceAssistantButtonProps {
    assistantId: string;
    className?: string;
    label?: string;
}

export function VoiceAssistantButton({
    assistantId,
    className,
    label = "Falar com Consultor AI"
}: VoiceAssistantButtonProps) {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const vapi = vapiService.init();

        if (!vapi) return;

        vapi.on('call-start', () => {
            setIsActive(true);
            setIsConnecting(false);
            toast.success('Conectado à Voz do Mentor');
        });

        vapi.on('call-end', () => {
            setIsActive(false);
            setIsConnecting(false);
            setIsMuted(false);
        });

        return () => {
            vapiService.stopCall();
        };
    }, []);

    const handleToggleCall = async () => {
        if (isActive) {
            vapiService.stopCall();
        } else {
            setIsConnecting(true);
            try {
                await vapiService.startAssistantCall(assistantId);
            } catch (error) {
                setIsConnecting(false);
                toast.error('Não foi possível iniciar a conexão de voz.');
            }
        }
    };

    const toggleMute = () => {
        const nextMute = !isMuted;
        vapiService.setMuted(nextMute);
        setIsMuted(nextMute);
    };

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleCall}
                disabled={isConnecting}
                className={cn(
                    "relative flex items-center gap-3 px-8 py-4 rounded-full font-semibold transition-all shadow-xl backdrop-blur-md border",
                    isActive
                        ? "bg-red-500/10 border-red-500/50 text-red-500"
                        : "bg-blue-600 border-white/10 text-white hover:bg-blue-700"
                )}
            >
                <AnimatePresence mode="wait">
                    {isConnecting ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : isActive ? (
                        <PhoneOff size={20} />
                    ) : (
                        <Phone size={20} />
                    )}
                </AnimatePresence>

                <span>{isConnecting ? 'Chamando...' : isActive ? 'Encerrar Chamada' : label}</span>

                {/* Efeito de Ondas Sonoras quando Ativo */}
                {isActive && (
                    <div className="absolute -bottom-6 flex gap-1 items-center h-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [4, 12, 4],
                                    opacity: [0.5, 1, 0.5]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.1
                                }}
                                className="w-1 bg-red-400 rounded-full"
                            />
                        ))}
                    </div>
                )}
            </motion.button>

            <AnimatePresence>
                {isActive && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={toggleMute}
                        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                    >
                        {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
                        {isMuted ? 'Microfone Mutado' : 'Microfone Ativo'}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
