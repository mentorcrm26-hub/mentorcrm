'use client'

import { useState } from 'react'
import { createTag, deleteTag } from './actions'
import { toast } from 'sonner'
import { Tag, Plus, Trash2, Loader2, Palette } from 'lucide-react'

// Pre-defined color palette following CRM premium branding
const COLORS = [
    { label: 'Rose', value: '#ef4444' },     
    { label: 'Orange', value: '#f97316' },   
    { label: 'Amber', value: '#f59e0b' },    
    { label: 'Emerald', value: '#10b981' },  
    { label: 'Cyan', value: '#06b6d4' },     
    { label: 'Blue', value: '#3b82f6' },     
    { label: 'Indigo', value: '#6366f1' },   
    { label: 'Fuchsia', value: '#d946ef' },  
    { label: 'Zinc', value: '#71717a' },     
]

export function TagsClient({ initialTags }: { initialTags: any[] }) {
    const [name, setName] = useState('')
    const [color, setColor] = useState(COLORS[6].value)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return

        setIsSubmitting(true)
        const res = await createTag(name.trim(), color)
        
        if (res.success) {
            toast.success('Tag created successfully!')
            setName('')
        } else {
            toast.error(res.error || 'Failed to create tag.')
        }
        setIsSubmitting(false)
    }

    async function handleDelete(id: string) {
        setDeletingId(id)
        const res = await deleteTag(id)
        if (res.success) {
            toast.success('Tag removed.')
        } else {
            toast.error(res.error || 'Failed to remove tag.')
        }
        setDeletingId(null)
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Creator Form */}
            <div className="w-full md:w-80 shrink-0 bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-zinc-400" /> Tag Name
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={24}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., VIP, Urgent, Spam"
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-zinc-900 dark:text-zinc-100"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
                            <Palette className="w-4 h-4 text-zinc-400" /> Tag Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full shadow-sm transition-all focus:outline-none cursor-pointer ${color === c.value ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-zinc-600 scale-110' : 'hover:scale-105 opacity-80'}`}
                                    style={{ backgroundColor: c.value }}
                                    title={c.label}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Tag
                    </button>
                </form>

                {/* Live Preview */}
                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Live Preview</p>
                    <div 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all shadow-sm"
                        style={{ backgroundColor: `${color}15`, color: color, border: `1px solid ${color}30` }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                        {name || 'Preview Tag'}
                    </div>
                </div>
            </div>

            {/* Existing Tags Grid */}
            <div className="flex-1 w-full flex flex-wrap gap-3">
                {initialTags.length === 0 ? (
                    <div className="w-full py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <Tag className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm font-medium">No tags created yet.</p>
                    </div>
                ) : (
                    initialTags.map((tag) => (
                        <div 
                            key={tag.id}
                            className="group flex flex-col items-center justify-center relative w-full sm:w-[150px] aspect-video rounded-xl border bg-white dark:bg-zinc-950 transition-all shadow-sm hover:shadow-md"
                            style={{ borderColor: `${tag.color_hex}30` }}
                        >
                            <div className="absolute inset-0 opacity-5 dark:opacity-10 rounded-xl" style={{ backgroundColor: tag.color_hex }} />
                            
                            <div 
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-bold shadow-sm z-10"
                                style={{ backgroundColor: `${tag.color_hex}15`, color: tag.color_hex, border: `1px solid ${tag.color_hex}30` }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color_hex }} />
                                {tag.name}
                            </div>

                            <button
                                onClick={() => handleDelete(tag.id)}
                                disabled={deletingId === tag.id}
                                className="absolute top-2 right-2 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 shadow-sm opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 z-20 cursor-pointer"
                                title="Delete Tag"
                            >
                                {deletingId === tag.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
