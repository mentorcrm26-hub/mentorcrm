'use client'

import { useState, useMemo, useEffect } from 'react'
import { createLead, updateLead } from '@/app/dashboard/leads/actions'
import { toast } from 'sonner'
import { X, Calendar, User, Mail, Phone, FileText, Plus, Clock, Search, Check } from 'lucide-react'
import { parseFloridaTime } from '@/lib/timezone'
import { useRouter } from 'next/navigation'

interface Lead {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    birth_date: string | null
    meeting_at: string | null
    status: string
}

export function NewLeadModal({
    isOpen: controlledOpen,
    onToggle,
    initialMeetingAt,
    showTrigger = true,
    availableLeads = [],
    mode = 'lead', // 'lead' or 'appointment'
    initialLeadId = ""
}: {
    isOpen?: boolean,
    onToggle?: (open: boolean) => void,
    initialMeetingAt?: string,
    showTrigger?: boolean,
    availableLeads?: Lead[],
    mode?: 'lead' | 'appointment',
    initialLeadId?: string
} = {}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen

    const setIsOpen = (open: boolean) => {
        if (onToggle) onToggle(open)
        if (!isControlled) setInternalOpen(open)
    }

    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLeadId)

    // Form data
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phoneStr, setPhoneStr] = useState("")
    const [birthDate, setBirthDate] = useState("")
    const [notes, setNotes] = useState("")
    const [meetingAt, setMeetingAt] = useState(initialMeetingAt || "")

    useEffect(() => {
        if (initialLeadId) {
            setSelectedLeadId(initialLeadId)
        }
    }, [initialLeadId])

    useEffect(() => {
        if (selectedLeadId && availableLeads.length > 0) {
            const lead = availableLeads.find(l => l.id === selectedLeadId)
            if (lead) {
                setName(lead.name)
                setEmail(lead.email || "")
                setPhoneStr(formatPhoneUI(lead.phone || ""))
                setBirthDate(lead.birth_date || "")
                setNotes(lead.notes || "")
            }
        } else if (!selectedLeadId) {
            // Reset if deselected (but keep what was typed if creation)
        }
    }, [selectedLeadId, availableLeads])

    // Search/Dropdown state
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        if (initialMeetingAt) {
            setMeetingAt(initialMeetingAt)
        }
    }, [initialMeetingAt])

    const filteredLeads = useMemo(() => {
        if (!name) return []
        return availableLeads.filter(l =>
            l.name.toLowerCase().includes(name.toLowerCase()) ||
            (l.email?.toLowerCase().includes(name.toLowerCase()))
        ).slice(0, 5)
    }, [name, availableLeads])

    const formatPhoneUI = (val: string) => {
        if (!val) return "";
        let cleaned = val.replace(/\D/g, '')
        if (cleaned.length === 11 && cleaned.startsWith('1')) cleaned = cleaned.substring(1);
        if (cleaned.length > 10) cleaned = cleaned.substring(0, 10);
        
        let formatted = cleaned
        if (cleaned.length > 6) {
            formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`
        } else if (cleaned.length > 3) {
            formatted = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3)}`
        } else if (cleaned.length > 0) {
            formatted = `(${cleaned}`
        }
        return formatted
    }

    const handleSelectLead = (lead: Lead) => {
        setSelectedLeadId(lead.id)
        setName(lead.name)
        setEmail(lead.email || '')
        setPhoneStr(formatPhoneUI(lead.phone || ''))
        setBirthDate(lead.birth_date || '')
        setNotes(lead.notes || '')
        setShowDropdown(false)
        toast.info(`Lead "${lead.name}" selecionado.`)
    }

    async function handleFormSubmit(event: React.FormEvent) {
        event.preventDefault()
        setIsSubmitting(true)
        setError(null)

        if (!name) {
            setError('Name is required')
            setIsSubmitting(false)
            return
        }

        const rawPhone = phoneStr.replace(/\D/g, '')
        if (rawPhone.length > 0 && rawPhone.length !== 10) {
            setError('Phone must be exactly 10 digits (Area Code + Number)')
            setIsSubmitting(false)
            return
        }

        const finalPhone = rawPhone.length === 10 ? `1${rawPhone}` : rawPhone;

        const payload = {
            name,
            email: email || undefined,
            phone: finalPhone || undefined,
            notes: notes || undefined,
            birth_date: birthDate || undefined,
            meeting_at: meetingAt ? parseFloridaTime(meetingAt) : undefined
        }

        let res
        if (selectedLeadId) {
            // Update existing lead
            res = await updateLead(selectedLeadId, payload)
        } else {
            // Create new lead
            res = await createLead(payload)
        }

        if (!res.success) {
            setError(res.error || 'Failed to save appointment')
            toast.error('An error occurred while saving.')
        } else {
            if (res.syncError) {
                toast.warning(`${mode === 'appointment' ? 'Appointment' : 'Lead'} saved, but Calendar Sync failed: ${res.syncError}`)
            } else {
                toast.success(mode === 'appointment' ? 'Appointment created & Synced!' : (selectedLeadId ? 'Lead updated!' : 'New Lead created!'))
            }
            setIsOpen(false)
            resetForm()
            router.refresh()
        }
        setIsSubmitting(false)
    }

    const resetForm = () => {
        setSelectedLeadId("")
        setName('')
        setEmail('')
        setPhoneStr('')
        setBirthDate('')
        setMeetingAt('')
        setNotes('')
        setShowDropdown(false)
        setError(null)
    }

    return (
        <>
            {showTrigger && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Lead
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        {mode === 'appointment' ? 'Schedule Appointment' : (selectedLeadId ? 'Update Lead Info' : 'Create New Lead')}
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-medium">
                                        {mode === 'appointment' ? `Configure the calendar event for ${name || 'Lead'}` : (selectedLeadId ? `Managing contact details for ${name}` : 'Add a new contact to your CRM')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setIsOpen(false); resetForm(); }}
                                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6">
                            <form id="schedule-form" onSubmit={handleFormSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 text-sm font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/50 flex items-center gap-2 animate-in slide-in-from-top-2">
                                        <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field with Intelligent Search */}
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Search className="w-4 h-4 text-zinc-400" /> Lead Name (Search) *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value)
                                                    setSelectedLeadId("") // release if typing
                                                    setShowDropdown(true)
                                                }}
                                                onFocus={() => setShowDropdown(true)}
                                                placeholder="Search or enter name..."
                                                className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium pr-10"
                                            />
                                            {selectedLeadId && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500">
                                                    <Check className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Dropdown Results */}
                                        {showDropdown && name && !selectedLeadId && filteredLeads.length > 0 && (
                                            <div className="absolute z-[60] left-0 right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="p-1 px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                                                    Leads Found
                                                </div>
                                                {filteredLeads.map(lead => (
                                                    <button
                                                        key={lead.id}
                                                        type="button"
                                                        onClick={() => handleSelectLead(lead)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-colors border-b last:border-0 border-zinc-100 dark:border-zinc-800"
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</div>
                                                            <div className="text-[10px] text-zinc-500 truncate">{lead.email || 'No email'}</div>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-zinc-400" /> E-mail Address
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-zinc-400" /> Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            value={phoneStr}
                                            onChange={(e) => setPhoneStr(formatPhoneUI(e.target.value))}
                                            placeholder="(201) 555-0123"
                                            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-zinc-400" /> Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-zinc-700 dark:text-zinc-300 [&::-webkit-calendar-picker-indicator]:dark:invert"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-zinc-400" /> {mode === 'lead' ? 'Schedule (Optional)' : 'Schedule For (Florida ET) *'}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            required={mode === 'appointment'}
                                            value={meetingAt}
                                            onChange={(e) => setMeetingAt(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-zinc-700 dark:text-zinc-300 [&::-webkit-calendar-picker-indicator]:dark:invert border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.1)]"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-zinc-400" /> Internal Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add background info..."
                                        className="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none text-zinc-700 dark:text-zinc-300"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => { setIsOpen(false); resetForm(); }}
                                className="px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="schedule-form"
                                disabled={isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 active:scale-95"
                            >
                                {isSubmitting ? 'Saving...' : (mode === 'appointment' ? 'Confirm & Schedule' : (selectedLeadId ? 'Save Changes' : 'Add Lead'))}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
