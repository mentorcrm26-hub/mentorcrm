'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateTeamRequestStatus } from './actions'
import { Search, Phone, Mail, Users, MessageSquare, Clock, CheckCircle2, XCircle, ArrowRightCircle, Loader2 } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
    pending:   { label: 'Pendente',   color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',   dot: 'bg-amber-500 animate-pulse' },
    contacted: { label: 'Contatado',  color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',         dot: 'bg-blue-500' },
    converted: { label: 'Convertido', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30', dot: 'bg-emerald-500' },
    dismissed: { label: 'Descartado', color: 'bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-900/20 dark:text-zinc-500 dark:border-zinc-800',            dot: 'bg-zinc-400' },
}

const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

export function TeamRequestsClient({ initialData }: { initialData: any[] }) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const handleStatus = async (id: string, status: string) => {
        setLoadingId(id)
        const res = await updateTeamRequestStatus(id, status)
        setLoadingId(null)
        if (res.success) {
            toast.success('Status atualizado.')
            router.refresh()
        } else {
            toast.error(res.error || 'Erro ao atualizar status')
        }
    }

    const filtered = initialData.filter(r => {
        const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchStatus = statusFilter === 'all' || r.status === statusFilter
        return matchSearch && matchStatus
    })

    const counts = {
        all: initialData.length,
        pending: initialData.filter(r => r.status === 'pending').length,
        contacted: initialData.filter(r => r.status === 'contacted').length,
        converted: initialData.filter(r => r.status === 'converted').length,
        dismissed: initialData.filter(r => r.status === 'dismissed').length,
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-rose-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {(['all', 'pending', 'contacted', 'converted', 'dismissed'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border transition-all cursor-pointer ${
                                statusFilter === s
                                    ? 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-white/5 hover:border-rose-300'
                            }`}
                        >
                            {s === 'all' ? `Todos (${counts.all})` : `${STATUS_CONFIG[s].label} (${counts[s]})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
                        <Users className="w-8 h-8 text-zinc-400 mb-3" />
                        <p className="text-zinc-500 font-medium">Nenhuma solicitação encontrada.</p>
                    </div>
                ) : (
                    filtered.map(req => {
                        const s = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                        const isExpanded = expandedId === req.id

                        return (
                            <div key={req.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className="font-extrabold text-zinc-900 dark:text-white">{req.name}</span>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                {s.label}
                                            </span>
                                            <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                                {req.team_size} agentes
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium flex-wrap">
                                            <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{req.email}</span>
                                            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{req.phone}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{formatDate(req.created_at)}</span>
                                        </div>
                                        {req.message && (
                                            <button onClick={() => setExpandedId(isExpanded ? null : req.id)} className="mt-1.5 flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-bold cursor-pointer">
                                                <MessageSquare className="w-3 h-3" />
                                                {isExpanded ? 'Ocultar mensagem' : 'Ver mensagem'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {loadingId === req.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                                        ) : (
                                            <>
                                                {req.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatus(req.id, 'contacted')}
                                                        title="Marcar como contatado"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30 rounded-lg transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        <ArrowRightCircle className="w-3.5 h-3.5" /> Contatado
                                                    </button>
                                                )}
                                                {(req.status === 'pending' || req.status === 'contacted') && (
                                                    <button
                                                        onClick={() => handleStatus(req.id, 'converted')}
                                                        title="Marcar como convertido"
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30 rounded-lg transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Convertido
                                                    </button>
                                                )}
                                                {req.status !== 'dismissed' && (
                                                    <button
                                                        onClick={() => handleStatus(req.id, 'dismissed')}
                                                        title="Descartar"
                                                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-zinc-200 dark:border-white/5 transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {req.status === 'dismissed' && (
                                                    <button
                                                        onClick={() => handleStatus(req.id, 'pending')}
                                                        className="px-3 py-1.5 text-xs font-black uppercase tracking-widest text-zinc-500 border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-all active:scale-95 cursor-pointer"
                                                    >
                                                        Reabrir
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {isExpanded && req.message && (
                                    <div className="px-5 pb-4 border-t border-zinc-100 dark:border-white/5 pt-3">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic">"{req.message}"</p>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
