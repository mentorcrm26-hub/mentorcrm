'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Copy, Trash2, Users, PenLine } from 'lucide-react'
import { format } from 'date-fns'
import { Drawing } from '@/types/draw'

interface DrawCardProps {
    drawing: Drawing
    onDelete: (id: string) => void
    onDuplicate: (id: string) => void
}

export function DrawCard({ drawing, onDelete, onDuplicate }: DrawCardProps) {
    const router = useRouter()
    const [menuOpen, setMenuOpen] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [imageError, setImageError] = useState(false)

    const openEditor = () => router.push(`/dashboard/draw/${drawing.id}`)

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirmDelete) {
            onDelete(drawing.id)
        } else {
            setConfirmDelete(true)
            setTimeout(() => setConfirmDelete(false), 3000)
        }
    }

    return (
        <div className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col">
            {/* Thumbnail */}
            <div
                onClick={openEditor}
                className="relative h-44 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center overflow-hidden"
            >
                {drawing.thumbnail_url && !imageError ? (
                    <img
                        src={`${drawing.thumbnail_url}${drawing.thumbnail_url.includes('?') ? '&' : '?'}v=${new Date(drawing.updated_at).getTime()}`}
                        alt={drawing.title}
                        onLoad={() => setImageError(false)}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-300 dark:text-zinc-700">
                        <PenLine className="w-10 h-10" />
                        <span className="text-xs font-medium">Empty canvas</span>
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white dark:bg-zinc-900 text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        Open Editor
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <h3
                        onClick={openEditor}
                        className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate flex-1 hover:text-indigo-600 transition-colors"
                    >
                        {drawing.title}
                    </h3>

                    {/* Actions menu */}
                    <div className="relative shrink-0">
                        <button
                            onClick={e => { e.stopPropagation(); setMenuOpen(prev => !prev) }}
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 top-7 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl w-44 py-1 text-sm animate-in zoom-in-95 duration-150">
                                    <button
                                        onClick={e => { e.stopPropagation(); setMenuOpen(false); openEditor() }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    >
                                        <Pencil className="w-3.5 h-3.5" /> Open Editor
                                    </button>
                                    <button
                                        onClick={e => { e.stopPropagation(); setMenuOpen(false); onDuplicate(drawing.id) }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    >
                                        <Copy className="w-3.5 h-3.5" /> Duplicate
                                    </button>
                                    <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                                    <button
                                        onClick={handleDelete}
                                        className={`flex items-center gap-2.5 w-full px-3 py-2 transition-colors ${confirmDelete ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-red-500'}`}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        {confirmDelete ? 'Confirm delete?' : 'Delete'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-zinc-400">
                        {format(new Date(drawing.updated_at), 'MMM d, yyyy')}
                    </span>
                    {(drawing.linked_leads_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                            <Users className="w-3 h-3" />
                            {drawing.linked_leads_count} lead{(drawing.linked_leads_count ?? 0) !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
