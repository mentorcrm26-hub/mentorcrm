'use client'

import { useState, useEffect } from 'react'
import { getSystemHealth, clearGlobalCache } from './actions'
import { ServerCog, Loader2, RefreshCcw, Database, MessageCircle, Mic, Mail, Banknote, BrainCircuit, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function SystemHealthClient() {
    const [health, setHealth] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchHealth = async () => {
        setLoading(true)
        const res = await getSystemHealth()
        if (res.success) {
            setHealth(res.data)
        } else {
            toast.error(`Falha ao checar saúde: ${"error" in res ? res.error : "Erro desconhecido"}`)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchHealth()
    }, [])

    const handleClearCache = async () => {
        toast.promise(clearGlobalCache(), {
            loading: 'Purgando cache do Next.js (Edge e Vercel CDN)...',
            success: 'Cache Global Purgado! Interfaces atualizadas.',
            error: 'Falha ao tentar limpar o cache'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
            </div>
        )
    }

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'ok') return <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 font-bold px-2 py-1 rounded text-xs uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Operacional</span>
        if (status === 'missing') return <span className="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-bold px-2 py-1 rounded text-xs uppercase tracking-widest flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Chave Ausente</span>
        if (status === 'warning') return <span className="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400 font-bold px-2 py-1 rounded text-xs uppercase tracking-widest flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Instável</span>
        return <span className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 font-bold px-2 py-1 rounded text-xs uppercase tracking-widest flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> Erro Crítico</span>
    }

    const services = [
        { 
            name: 'Supabase Postgres (DB)', 
            icon: Database, 
            status: health?.database?.status, 
            latency: health?.database?.latencyMs,
            desc: 'Banco de Dados, RLS e Autenticação Master'
        },
        { 
            name: 'Evolution API (WhatsApp)', 
            icon: MessageCircle, 
            status: health?.evolution?.status, 
            latency: health?.evolution?.latencyMs,
            desc: 'Nó Central para disparo de mensagens e instâncias',
            error: health?.evolution?.error,
            adminTip: 'Dica Pró: Se o Ping estiver verde (<1000ms), lentidões no envio são causadas pela internet do cliente. Se vermelho (>4000ms), seu servidor de WhatsApp engasgou e precisa de reinício (Reboot).'
        },
        { 
            name: 'Stripe API (Gateway)', 
            icon: Banknote, 
            status: health?.stripe?.status, 
            desc: 'Pagamentos, Assinaturas e Webhooks'
        },
        { 
            name: 'OpenAI (LLM Core)', 
            icon: BrainCircuit, 
            status: health?.openai?.status, 
            desc: 'Motor dos Agentes Inteligentes e Análise de Sentimento'
        },
        { 
            name: 'Resend (E-mail API)', 
            icon: Mail, 
            status: health?.resend?.status, 
            desc: 'Disparo de E-mails Transacionais para Leads'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={fetchHealth} 
                    className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                    <RefreshCcw className="w-4 h-4 text-zinc-500" />
                    Auditoria de Rotas HTTP
                </button>
                <button 
                    onClick={handleClearCache} 
                    className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:hover:bg-rose-900/40 text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer border border-rose-200 dark:border-rose-900/50"
                >
                    <ServerCog className="w-4 h-4" />
                    Forçar Limpeza de Cache (Vercel)
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((svc, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl">
                                    <svc.icon className="w-6 h-6" />
                                </div>
                                <StatusBadge status={svc.status || 'missing'} />
                            </div>
                            <h3 className="font-extrabold text-zinc-900 dark:text-white text-lg">{svc.name}</h3>
                            <p className="text-zinc-500 text-sm font-medium mt-1">{svc.desc}</p>
                        </div>
                        
                        {(svc.latency !== undefined || svc.error || svc.adminTip) && (
                            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/50 flex flex-col gap-2">
                                {svc.latency !== undefined && (
                                    <div className="flex items-center justify-between text-xs font-mono font-bold">
                                        <span className="text-zinc-500 uppercase tracking-widest">Ping / Latência</span>
                                        <span className={svc.latency > 1000 ? 'text-red-500' : 'text-emerald-500'}>{svc.latency}ms</span>
                                    </div>
                                )}
                                {svc.error && (
                                    <div className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded truncate">
                                        {svc.error}
                                    </div>
                                )}
                                {svc.adminTip && (
                                    <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/10 px-2 py-2 rounded border border-amber-200/50 dark:border-amber-900/30">
                                        {svc.adminTip}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
