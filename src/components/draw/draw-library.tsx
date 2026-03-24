'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PenLine, Plus, Search, Loader2 } from 'lucide-react'
import { Drawing } from '@/types/draw'
import { createDrawing, deleteDrawing, duplicateDrawing } from '@/app/dashboard/draw/actions'
import { DrawCard } from './draw-card'
import { toast } from 'sonner'

export function DrawLibrary({ initialDrawings }: { initialDrawings: Drawing[] }) {
    const router = useRouter()
    const [drawings, setDrawings] = useState<Drawing[]>(initialDrawings)
    const [search, setSearch] = useState('')
    const [isPending, startTransition] = useTransition()

    const filtered = drawings.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase())
    )

    const handleNew = () => {
        startTransition(async () => {
            const res = await createDrawing('Untitled Drawing')
            if (res.success && res.data) {
                router.push(`/dashboard/draw/${res.data.id}`)
            } else {
                toast.error(res.error || 'Failed to create drawing')
            }
        })
    }

    const handleDelete = async (id: string) => {
        const res = await deleteDrawing(id)
        if (res.success) {
            setDrawings(prev => prev.filter(d => d.id !== id))
            toast.success('Drawing deleted')
        } else {
            toast.error(res.error || 'Failed to delete drawing')
        }
    }

    const handleDuplicate = async (id: string) => {
        const res = await duplicateDrawing(id)
        if (res.success && res.data) {
            setDrawings(prev => [res.data!, ...prev])
            toast.success('Drawing duplicated')
        } else {
            toast.error(res.error || 'Failed to duplicate drawing')
        }
    }

    return (
        <div className="flex flex-col gap-8 h-full">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 gap-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <PenLine className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Draw</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 text-sm">
                            Create and manage presentation drawings for your leads.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleNew}
                    disabled={isPending}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-60 shrink-0"
                >
                    {isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Plus className="w-4 h-4" />
                    }
                    New Drawing
                </button>
            </header>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    placeholder="Search drawings..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 outline-none transition-all"
                />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                        <PenLine className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                        {search ? 'No drawings found' : 'No drawings yet'}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-1 max-w-xs">
                        {search
                            ? 'Try a different search term.'
                            : 'Create your first drawing to use in lead presentations.'
                        }
                    </p>
                    {!search && (
                        <button
                            onClick={handleNew}
                            disabled={isPending}
                            className="mt-5 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
                        >
                            <Plus className="w-4 h-4" /> New Drawing
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
                    {filtered.map(drawing => (
                        <DrawCard
                            key={drawing.id}
                            drawing={drawing}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicate}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
