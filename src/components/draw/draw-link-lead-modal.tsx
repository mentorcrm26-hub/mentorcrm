'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { X, Search, Check, Loader2, Users, Link2Off } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    linkDrawingToLeads,
    unlinkDrawingFromLead,
    getLinkedLeadsForDrawing,
} from '@/app/dashboard/draw/actions'
import { toast } from 'sonner'

interface Lead {
    id: string
    name: string
    email: string | null
}

interface DrawLinkLeadModalProps {
    isOpen: boolean
    onClose: () => void
    drawingId: string
}

export function DrawLinkLeadModal({ isOpen, onClose, drawingId }: DrawLinkLeadModalProps) {
    const router = useRouter()
    const [leads, setLeads] = useState<Lead[]>([])
    const [linkedLeadIds, setLinkedLeadIds] = useState<Set<string>>(new Set())
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [search, setSearch] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setSearch('')
        setSelected(new Set())
        loadData()
    }, [isOpen, drawingId])

    const loadData = async () => {
        setIsLoading(true)
        const supabase = createClient()

        const [{ data: leadsData }, linkedRes] = await Promise.all([
            supabase
                .from('leads')
                .select('id, name, email')
                .is('is_archived', false)
                .order('name'),
            getLinkedLeadsForDrawing(drawingId),
        ])

        setLeads((leadsData as Lead[]) || [])
        const ids = new Set<string>(
            (linkedRes.data || []).map((row: any) => row.lead_id as string)
        )
        setLinkedLeadIds(ids)
        setIsLoading(false)
    }

    const filtered = useMemo(() =>
        leads.filter(l =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            (l.email && l.email.toLowerCase().includes(search.toLowerCase()))
        ),
        [leads, search]
    )

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleLink = async () => {
        if (selected.size === 0) return
        setIsSaving(true)
        const res = await linkDrawingToLeads(drawingId, Array.from(selected))
        if (res.success) {
            toast.success(`Drawing linked to ${selected.size} lead${selected.size !== 1 ? 's' : ''}`)
            router.refresh()
            onClose()
        } else {
            toast.error(res.error || 'Failed to link drawing')
        }
        setIsSaving(false)
    }

    const handleUnlink = async (leadId: string, leadName: string) => {
        const res = await unlinkDrawingFromLead(drawingId, leadId)
        if (res.success) {
            setLinkedLeadIds(prev => {
                const next = new Set(prev)
                next.delete(leadId)
                return next
            })
            toast.success(`Unlinked from ${leadName}`)
            router.refresh()
        } else {
            toast.error(res.error || 'Failed to unlink')
        }
    }

    if (!isOpen) return null

    const linkedLeads = leads.filter(l => linkedLeadIds.has(l.id))
    const unlinkedLeads = filtered.filter(l => !linkedLeadIds.has(l.id))

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Link to Leads</h3>
                            <p className="text-xs text-zinc-500">Select leads to attach this drawing to</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-5 pt-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-5 py-2 space-y-1">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 text-zinc-300 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Already linked */}
                            {linkedLeads.length > 0 && (
                                <>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 pt-1 pb-1">
                                        Currently Linked
                                    </p>
                                    {linkedLeads.map(lead => (
                                        <div
                                            key={lead.id}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/40"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{lead.name}</p>
                                                {lead.email && <p className="text-xs text-zinc-500">{lead.email}</p>}
                                            </div>
                                            <button
                                                onClick={() => handleUnlink(lead.id, lead.name)}
                                                title="Unlink"
                                                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Link2Off className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {unlinkedLeads.length > 0 && (
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 pt-3 pb-1">
                                            Add More
                                        </p>
                                    )}
                                </>
                            )}

                            {/* Unlinked leads */}
                            {unlinkedLeads.length === 0 && linkedLeads.length === 0 && (
                                <p className="text-sm text-zinc-400 text-center py-10">No leads found</p>
                            )}
                            {unlinkedLeads.map(lead => {
                                const isSelected = selected.has(lead.id)
                                return (
                                    <button
                                        key={lead.id}
                                        onClick={() => toggle(lead.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                                            isSelected
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{lead.name}</p>
                                            {lead.email && <p className="text-xs text-zinc-500">{lead.email}</p>}
                                        </div>
                                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                                            isSelected
                                                ? 'bg-indigo-600 border-indigo-600'
                                                : 'border-zinc-300 dark:border-zinc-600'
                                        }`}>
                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                    </button>
                                )
                            })}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400">
                        {selected.size > 0 ? `${selected.size} lead${selected.size !== 1 ? 's' : ''} selected` : 'Select leads to link'}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleLink}
                            disabled={selected.size === 0 || isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Link Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
