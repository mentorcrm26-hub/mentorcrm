'use client'

import { useState, useEffect } from 'react'
import { updateLead, archiveLead } from '@/app/dashboard/leads/actions'
import { getLeadNotes, addLeadNote, updateLeadNote, deleteLeadNote } from '@/app/dashboard/leads/note-actions'
import { toggleLeadTag } from '@/app/dashboard/settings/tags/actions'
import { toast } from 'sonner'
import { X, Calendar, User, Mail, Phone, FileText, Clock, Trash2, CalendarX, Pencil, Save, Archive, Tag } from 'lucide-react'
import { formatFlorida, parseFloridaTime } from '@/lib/timezone'

export function LeadDetailsModal({
    isOpen,
    onClose,
    lead,
    availableTags = [],
    userRole = 'agent'
}: {
    isOpen: boolean
    onClose: () => void
    lead: any | null
    availableTags?: any[]
    userRole?: string
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [phoneStr, setPhoneStr] = useState("")

    const [confirmDeleteLead, setConfirmDeleteLead] = useState(false)
    const [confirmCancel, setConfirmCancel] = useState(false)
    const [confirmArchive, setConfirmArchive] = useState(false)
    
    const [notesList, setNotesList] = useState<any[]>([])
    const [isLoadingNotes, setIsLoadingNotes] = useState(false)
    const [newNote, setNewNote] = useState("")
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
    const [editingContent, setEditingContent] = useState("")
    const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState<string | null>(null)
    const [optimisticTags, setOptimisticTags] = useState<any[]>([])

    // Helper to format phone visually
    const formatPhoneUI = (raw: string) => {
        if (!raw) return "";
        let val = raw.replace(/\D/g, '');
        // If it came from DB with US country code (11 digits starting with 1), strip it for UI
        if (val.length === 11 && val.startsWith('1')) {
            val = val.substring(1);
        }
        if (val.length > 10) val = val.substring(0, 10);

        let formatted = val;
        if (val.length > 6) {
            formatted = `(${val.substring(0, 3)}) ${val.substring(3, 6)}-${val.substring(6)}`;
        } else if (val.length > 3) {
            formatted = `(${val.substring(0, 3)}) ${val.substring(3)}`;
        } else if (val.length > 0) {
            formatted = `(${val}`;
        }
        return formatted;
    }

    useEffect(() => {
        if (lead && isOpen) {
            setPhoneStr(formatPhoneUI(lead.phone || ""))
            setConfirmDeleteLead(false)
            setConfirmCancel(false)
            setConfirmArchive(false)
            setConfirmDeleteNoteId(null)
            setNewNote("")
            setOptimisticTags(lead.tags || [])
            loadNotes()
        } else {
            setPhoneStr("")
        }
    }, [lead, isOpen])

    async function handleToggleTag(tag: any) {
        const isAttached = optimisticTags.some(t => t.id === tag.id)
        
        // Optimistic UI update
        if (isAttached) {
            setOptimisticTags(prev => prev.filter(t => t.id !== tag.id))
            const res = await toggleLeadTag(lead.id, tag.id, false)
            if (!res.success) toast.error("Failed to remove tag")
        } else {
            setOptimisticTags(prev => [...prev, tag])
            const res = await toggleLeadTag(lead.id, tag.id, true)
            if (!res.success) toast.error("Failed to add tag")
        }
    }

    async function loadNotes() {
        if (!lead) return
        setIsLoadingNotes(true)
        const res = await getLeadNotes(lead.id)
        if (res.success) {
            let fetchedNotes = res.data || []
            
            // If no timeline notes but lead.notes exists (legacy), show it
            if (fetchedNotes.length === 0 && lead.notes) {
                fetchedNotes = [{
                    id: 'legacy-note',
                    content: lead.notes,
                    created_at: lead.created_at || new Date().toISOString(),
                    is_legacy: true
                }]
            }
            
            setNotesList(fetchedNotes)
        }
        setIsLoadingNotes(false)
    }

    if (!isOpen || !lead) return null

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhoneStr(formatPhoneUI(e.target.value))
    }

    async function handleAddNote() {
        if (!newNote.trim()) return
        setIsSubmitting(true)
        const res = await addLeadNote(lead.id, newNote.trim())
        if (res.success) {
            setNewNote("")
            loadNotes()
            toast.success('Note added')
        } else {
            console.error('Note action error:', res.error)
            toast.error(`Failed to add note: ${res.error || 'Unknown error'}`)
        }
        setIsSubmitting(false)
    }

    async function handleUpdateNote(noteId: string) {
        if (!editingContent.trim()) return
        setIsSubmitting(true)
        const res = await updateLeadNote(noteId, editingContent.trim())
        if (res.success) {
            setEditingNoteId(null)
            loadNotes()
            toast.success('Note updated')
        } else {
            toast.error('Failed to update note')
        }
        setIsSubmitting(false)
    }

    async function handleDeleteNote(noteId: string) {
        setIsSubmitting(true)
        const res = await deleteLeadNote(noteId)
        if (res.success) {
            setConfirmDeleteNoteId(null)
            loadNotes()
            toast.success('Note deleted')
        } else {
            toast.error('Failed to delete note')
        }
        setIsSubmitting(false)
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const birth_date = formData.get('birth_date') as string
        const rawMeetingAt = formData.get('meeting_at') as string
        const meeting_at = rawMeetingAt ? parseFloridaTime(rawMeetingAt) : undefined
        const rawPhone = phoneStr.replace(/\D/g, '')
        
        if (!name) {
            setError('Name is required')
            setIsSubmitting(false)
            return
        }

        if (rawPhone.length > 0 && rawPhone.length !== 10) {
            setError('Phone must be exactly 10 digits (Area Code + Number)')
            setIsSubmitting(false)
            return
        }

        const finalPhone = rawPhone.length === 10 ? `1${rawPhone}` : rawPhone;

        const res = await updateLead(lead.id, {
            name,
            email,
            phone: finalPhone,
            notes: lead.notes, 
            birth_date: birth_date || undefined,
            meeting_at
        })

        if (!res.success) {
            setError(res.error || 'Failed to update lead')
            toast.error('Failed to update lead')
        } else {
            toast.success('Lead updated successfully')
            onClose()
        }

        setIsSubmitting(false)
    }

    async function onCancelMeeting() {
        setIsSubmitting(true)
        const res = await updateLead(lead.id, {
            name: lead.name,
            email: lead.email || undefined,
            phone: phoneStr || undefined,
            birth_date: lead.birth_date || undefined,
            meeting_at: undefined,
            status: 'Attempting Contact'
        })

        if (!res.success) {
            toast.error('Failed to cancel meeting')
        } else {
            toast.success('Meeting cancelled. Lead remains in CRM.')
            setConfirmCancel(false)
            onClose()
        }
        setIsSubmitting(false)
    }

    async function onArchive() {
        if (!lead) return
        setIsSubmitting(true)
        const res = await archiveLead(lead.id)
        if (res.success) {
            toast.success('Lead moved to Vault')
            onClose()
        } else {
            toast.error('Failed to archive lead')
        }
        setIsSubmitting(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Lead Details
                            </h2>
                            <p className="text-sm text-zinc-500 font-medium">
                                Review and update information for {lead.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    <form id="lead-details-form" onSubmit={onSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/50 flex items-center gap-2 animate-in slide-in-from-top-2">
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <User className="w-4 h-4 text-zinc-400" /> Full Name *
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    disabled={userRole !== 'admin'}
                                    defaultValue={lead.name}
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium disabled:opacity-75 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-zinc-400" /> Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    defaultValue={lead.email || ''}
                                    disabled={userRole !== 'admin'}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium disabled:opacity-75 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-zinc-400" /> Phone Number
                                </label>
                                <input
                                    name="phone"
                                    type="text"
                                    value={phoneStr}
                                    disabled={userRole !== 'admin'}
                                    onChange={handlePhoneChange}
                                    placeholder="(407) 123-4567"
                                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium disabled:opacity-75 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                                />
                            </div>

                            {/* Tags / Flags */}
                            {availableTags && availableTags.length > 0 && (
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-zinc-400" /> Lead Tags & Flags
                                    </label>
                                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        {availableTags.map(tag => {
                                            const isActive = optimisticTags.some(t => t.id === tag.id);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    disabled={userRole !== 'admin'}
                                                    onClick={() => handleToggleTag(tag)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all shadow-sm ${isActive ? 'opacity-100 scale-100 ring-2 ring-offset-1 focus:outline-none dark:ring-offset-zinc-950' : 'opacity-40 hover:opacity-100 scale-95'} disabled:cursor-not-allowed`}
                                                    style={{ 
                                                        backgroundColor: `${tag.color_hex}15`, 
                                                        color: tag.color_hex, 
                                                        border: `1px solid ${tag.color_hex}30`,
                                                        ...(isActive ? { '--tw-ring-color': tag.color_hex } as any : {})
                                                    }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color_hex }} />
                                                    {tag.name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1">Click a tag to apply or remove it from this lead.</p>
                                </div>
                            )}

                            {/* Birth Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-zinc-400" /> Date of Birth
                                </label>
                                <input
                                    name="birth_date"
                                    type="date"
                                    defaultValue={lead.birth_date || ''}
                                    disabled={userRole !== 'admin'}
                                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium text-zinc-700 dark:text-zinc-300 [&::-webkit-calendar-picker-indicator]:dark:invert disabled:opacity-75 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                                />
                                <p className="text-xs text-zinc-500 mt-1">Automatic format based on browser.</p>
                            </div>

                            {/* Meeting Appointment */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-zinc-400" /> Scheduled Consultation (Florida ET)
                                </label>
                                <input
                                    name="meeting_at"
                                    type="datetime-local"
                                    defaultValue={lead.meeting_at ? formatFlorida(lead.meeting_at, "yyyy-MM-dd'T'HH:mm") : ''}
                                    disabled={userRole !== 'admin'}
                                    className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium text-zinc-700 dark:text-zinc-300 [&::-webkit-calendar-picker-indicator]:dark:invert disabled:opacity-75 disabled:bg-zinc-50 dark:disabled:bg-zinc-900/50"
                                />
                                <div className="flex items-center gap-x-1.5 mt-1.5 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100/50 dark:border-indigo-900/50 rounded-lg">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    <p className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                                        Timezone: Florida, USA (EST/EDT)
                                    </p>
                                </div>
                            </div>

                            {/* Cancel Meeting Area */}
                            {userRole === 'admin' && lead.meeting_at && (
                                <div className="space-y-2 flex flex-col pt-0">
                                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <CalendarX className="w-4 h-4 text-rose-500" /> Manage Session
                                    </label>
                                    <div className="w-full flex-1 flex items-center justify-between px-4 py-2 border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/3"></div>

                                        <div className="font-semibold text-rose-800 dark:text-rose-300 text-[11px] md:text-sm z-10 leading-tight">
                                            Active Appointment<br />
                                            <span className="font-medium text-[10px] opacity-80 uppercase tracking-widest mt-0.5 inline-block">Want to clear it?</span>
                                        </div>

                                        <div className="z-10 shrink-0">
                                            {confirmCancel ? (
                                                <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-rose-100 dark:border-rose-900/50">
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmCancel(false)}
                                                        className="px-3 py-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-[10px] font-extrabold uppercase transition-colors"
                                                    >
                                                        Back
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={onCancelMeeting}
                                                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm tracking-wide transition-all active:scale-95 flex items-center gap-1"
                                                    >
                                                        <CalendarX className="w-3 h-3" /> Confirm
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmCancel(true)}
                                                    className="px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95 group"
                                                >
                                                    <CalendarX className="w-4 h-4 text-rose-400 group-hover:text-rose-600 dark:text-rose-500 dark:group-hover:text-rose-400 transition-colors" /> Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Archive Lead Area */}
                            {userRole === 'admin' && (
                                <div className="space-y-2 flex flex-col pt-0">
                                <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Archive className="w-4 h-4 text-zinc-400" /> Archive to Vault
                                </label>
                                <div className="w-full flex-1 flex items-center justify-between px-4 py-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 rounded-xl relative overflow-hidden group/archive">
                                    <div className="font-semibold text-zinc-500 dark:text-zinc-400 text-[11px] md:text-sm z-10 leading-tight">
                                        Move to Vault<br />
                                        <span className="font-medium text-[10px] opacity-80 uppercase tracking-widest mt-0.5 inline-block text-zinc-400">Hide from active boards</span>
                                    </div>

                                    <div className="z-10 shrink-0">
                                        {confirmArchive ? (
                                            <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 p-1 rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmArchive(false)}
                                                    className="px-3 py-1.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-[10px] font-extrabold uppercase transition-colors"
                                                >
                                                    No
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={onArchive}
                                                    className="px-3 py-1.5 bg-zinc-800 dark:bg-zinc-700 hover:bg-black text-white text-[10px] font-extrabold uppercase rounded-lg shadow-sm tracking-wide transition-all active:scale-95 flex items-center gap-1"
                                                >
                                                    <Archive className="w-3 h-3" /> Yes, Vault
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setConfirmArchive(true)}
                                                className="px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                                            >
                                                <Archive className="w-4 h-4 text-zinc-400" /> Archive
                                            </button>
                                        )}
                                    </div>
                                </div>
                                </div>
                            )}
                        </div>

                        {/* Smart Playbook Widget (Hidden for now as requested)
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <LeadPlaybookWidget leadId={lead.id} />
                        </div>
                        */}

                        {/* Enhanced Notes Section */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-zinc-400" /> Observations & Notes
                            </label>
                            
                            {/* Previous Notes List */}
                            <div className="space-y-3">
                                {isLoadingNotes ? (
                                    <p className="text-xs text-zinc-500 animate-pulse">Loading notes...</p>
                                ) : (
                                    notesList.map((note) => (
                                        <div key={note.id} className="group p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-3 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50">
                                            <div className="flex-1">
                                                {editingNoteId === note.id ? (
                                                    <textarea
                                                        autoFocus
                                                        value={editingContent}
                                                        onChange={(e) => setEditingContent(e.target.value)}
                                                        className="w-full p-2 text-sm bg-white dark:bg-zinc-950 border border-blue-500 rounded-lg outline-none"
                                                        rows={2}
                                                    />
                                                ) : (
                                                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium whitespace-pre-wrap">
                                                        {note.content}
                                                    </p>
                                                )}
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                        {note.is_legacy ? 'Initial Note' : new Date(note.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {confirmDeleteNoteId === note.id ? (
                                                    <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-red-100 dark:border-red-900/50 shadow-sm shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmDeleteNoteId(null)}
                                                            className="px-2 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                                                        >
                                                            NO
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteNote(note.id)}
                                                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded"
                                                        >
                                                            YES
                                                        </button>
                                                    </div>
                                                ) : editingNoteId === note.id ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleUpdateNote(note.id)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingNoteId(note.id)
                                                                setEditingContent(note.content)
                                                                setConfirmDeleteNoteId(null)
                                                            }}
                                                            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setConfirmDeleteNoteId(note.id)
                                                                setEditingNoteId(null)
                                                            }}
                                                            className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Add New Note Area */}
                            <div className="flex gap-2 items-start">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    rows={2}
                                    placeholder="Add a new observation..."
                                    className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-zinc-700 dark:text-zinc-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim() || isSubmitting}
                                    className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap"
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    {userRole === 'admin' && (
                        <button
                            type="submit"
                            form="lead-details-form"
                            disabled={isSubmitting}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
