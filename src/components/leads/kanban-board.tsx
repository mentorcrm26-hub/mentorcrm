'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { MessageSquareText, Mail, Megaphone, AlertTriangle, Clock, CalendarX, X, Search } from 'lucide-react'
import { updateLeadStatus } from '@/app/dashboard/leads/actions'
import { formatFlorida } from '@/lib/timezone'
import { toast } from 'sonner'
import { DeleteLeadButton } from './delete-lead-button'
import { SendMessageModal } from './send-message-modal'
import { BroadcastModal } from './broadcast-modal'
import { LeadDetailsModal } from './lead-details-modal'
import { NewLeadModal } from './new-lead-modal'

const COLUMNS = [
    { id: 'New Lead', title: 'New Lead', color: 'bg-blue-500' },
    { id: 'Contacting', title: 'Contacting', color: 'bg-yellow-500' },
    { id: 'Scheduled', title: 'Scheduled', color: 'bg-purple-500' },
    { id: 'Won', title: 'Won', color: 'bg-emerald-500' },
    { id: 'Lost', title: 'Lost', color: 'bg-red-500' },
]

type Lead = {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    birth_date: string | null
    meeting_at: string | null
    status: string
    created_at: string
}

export function KanbanBoard({ initialLeads }: { initialLeads: any[] }) {
    const [leads, setLeads] = useState<Lead[]>(initialLeads)
    const [isMounted, setIsMounted] = useState(false)
    const [messageModalState, setMessageModalState] = useState<{
        isOpen: boolean,
        lead: Lead | null,
        type: 'whatsapp' | 'sms' | 'email' | null
    }>({ isOpen: false, lead: null, type: null })

    const [broadcastModalState, setBroadcastModalState] = useState<{
        isOpen: boolean,
        columnTitle: string | null,
        leads: Lead[],
        color: string | null
    }>({ isOpen: false, columnTitle: null, leads: [], color: null })

    const [detailsModalLead, setDetailsModalLead] = useState<Lead | null>(null)
    const [appointmentModalLead, setAppointmentModalLead] = useState<Lead | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const [downgradeConf, setDowngradeConf] = useState<{
        isOpen: boolean
        lead: Lead
        newStatus: string
    } | null>(null)

    // Sync state with server changes
    useEffect(() => {
        setLeads(initialLeads)
    }, [initialLeads])

    // AVOID HYDRATION ERROR
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        const newStatus = destination.droppableId
        const movedLead = leads.find(l => l.id === draggableId)

        if (movedLead?.meeting_at && (newStatus === 'New Lead' || newStatus === 'Contacting')) {
            // Intercept downgrade
            setDowngradeConf({ isOpen: true, lead: movedLead, newStatus })
            return
        }

        commitMove(draggableId, newStatus, false)
    }

    const commitMove = async (leadId: string, newStatus: string, clearMeeting: boolean) => {
        // Optimistic UI Update
        const updatedLeads = leads.map((lead) => {
            if (lead.id !== leadId) return lead

            const updated = { ...lead, status: newStatus }
            if (clearMeeting) {
                updated.meeting_at = null
            }
            return updated
        })
        setLeads(updatedLeads)

        // Server update
        const res = await updateLeadStatus(leadId, newStatus)
        if (!res.success) {
            // Revert on error
            setLeads(leads)
            toast.error(`Error: ${res.error}`)
        } else {
            if (res.syncError) {
                toast.warning(`Moved to ${newStatus}, but Calendar Sync failed: ${res.syncError}`)
            }
            if (newStatus === 'Scheduled') {
                // Auto open the scheduling modal
                const movedLead = updatedLeads.find(l => l.id === leadId)
                if (movedLead) {
                    setAppointmentModalLead(movedLead)
                }
            }
        }
    }

    const [showSearchDropdown, setShowSearchDropdown] = useState(false)

    if (!isMounted) return <div className="p-8 text-center text-zinc-500">Loading Kanban...</div>

    const filteredLeads = leads.filter(lead => {
        const query = searchTerm.toLowerCase().trim()
        if (!query) return true

        // Helper to remove accents (diacritics) to allow "joao" to match "João"
        const removeAccents = (str: string) =>
            str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

        const safeName = removeAccents((lead.name || '').toLowerCase())
        const safeEmail = removeAccents((lead.email || '').toLowerCase())
        const normalizedQuery = removeAccents(query)

        return safeName.includes(normalizedQuery) || safeEmail.includes(normalizedQuery)
    })

    return (
        <div className="flex flex-col h-full gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 shrink-0 relative z-20">
                <div className="relative max-w-sm w-full group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-indigo-500 transition-colors z-10" />
                    <input
                        type="search"
                        placeholder="Search leads by name or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setShowSearchDropdown(true)
                        }}
                        onFocus={() => setShowSearchDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-zinc-800 dark:text-zinc-200 shadow-sm relative z-10"
                    />

                    {/* Intelligent Dropdown Results */}
                    {showSearchDropdown && searchTerm && filteredLeads.length > 0 && (
                        <div className="absolute z-[60] left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-y-auto">
                            <div className="sticky top-0 p-1 px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/90 backdrop-blur-sm z-10">
                                Global Search Results
                            </div>
                            {filteredLeads.map(lead => (
                                <button
                                    key={lead.id}
                                    type="button"
                                    onClick={() => {
                                        setDetailsModalLead(lead)
                                        setShowSearchDropdown(false)
                                        setSearchTerm('')
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left transition-colors border-b last:border-0 border-zinc-100 dark:border-zinc-800 group/item"
                                >
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-colors">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                                            {lead.name}
                                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                                                In: {lead.status}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-zinc-500 truncate">{lead.email || 'No email registered'}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex gap-4 h-full items-stretch pb-4 overflow-x-auto snap-x snap-mandatory">
                    {COLUMNS.map((column) => {
                        const columnLeads = filteredLeads.filter(l => l.status === column.id) || []
                        return (
                            <div key={column.id} className="flex-1 min-w-[280px] flex flex-col bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl snap-center shrink-0 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm group/column">
                                <div className="p-4 font-semibold text-zinc-700 dark:text-zinc-200 flex justify-between items-center border-b border-zinc-200 dark:border-white/10 relative overflow-hidden rounded-t-2xl">
                                    <div className={`absolute top-0 left-0 w-full h-1 ${column.color} opacity-80`} />
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`} />
                                        {column.title}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setBroadcastModalState({ isOpen: true, columnTitle: column.title, leads: columnLeads, color: column.color })
                                            }}
                                            className="p-1.5 rounded-md text-zinc-500 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                                            title={`Broadcast to ${column.title}`}
                                        >
                                            <Megaphone className="w-4 h-4" />
                                        </button>
                                        <span className="bg-white dark:bg-black rounded-full px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                            {columnLeads.length}
                                        </span>
                                    </div>
                                </div>

                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`flex-1 p-3 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-zinc-200/50 dark:bg-zinc-800/50' : ''}`}
                                        >
                                            {columnLeads.map((lead, index) => (
                                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className={`bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm border border-zinc-200/50 dark:border-white/10 group relative cursor-pointer hover:border-indigo-500/30 transition-colors ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/20 rotate-2' : ''}`}
                                                            onClick={() => setDetailsModalLead(lead)}
                                                        >
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="min-w-0 flex-1">
                                                                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</h4>
                                                                    {lead.email && <p className="text-xs text-zinc-500 mt-1 truncate">{lead.email}</p>}
                                                                    {lead.phone && <p className="text-xs text-zinc-500 mt-1">{lead.phone}</p>}
                                                                </div>
                                                                <div
                                                                    className="flex bg-white dark:bg-zinc-950 items-center justify-end absolute top-2 right-2 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
                                                                </div>
                                                            </div>

                                                            {/* Integrations Bar */}
                                                            <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={() => setMessageModalState({ isOpen: true, lead, type: 'whatsapp' })}
                                                                        className="flex p-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors"
                                                                        title="Send WhatsApp"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                                            <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                                                                            <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setMessageModalState({ isOpen: true, lead, type: 'sms' })}
                                                                        className="flex p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors"
                                                                        title="Send SMS"
                                                                    >
                                                                        <MessageSquareText className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setMessageModalState({ isOpen: true, lead, type: 'email' })}
                                                                        className="flex p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors"
                                                                        title="Send Email"
                                                                    >
                                                                        <Mail className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                                <span className="text-[10px] font-medium text-zinc-400">
                                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        )
                    })}
                </div>

                <SendMessageModal
                    isOpen={messageModalState.isOpen}
                    onClose={() => setMessageModalState(prev => ({ ...prev, isOpen: false }))}
                    lead={messageModalState.lead}
                    type={messageModalState.type}
                />

                <BroadcastModal
                    isOpen={broadcastModalState.isOpen}
                    onClose={() => setBroadcastModalState(prev => ({ ...prev, isOpen: false }))}
                    columnTitle={broadcastModalState.columnTitle}
                    leads={broadcastModalState.leads}
                    colorClass={broadcastModalState.color}
                />

                <LeadDetailsModal
                    isOpen={!!detailsModalLead}
                    onClose={() => setDetailsModalLead(null)}
                    lead={detailsModalLead}
                />

                <NewLeadModal
                    isOpen={!!appointmentModalLead}
                    onToggle={(open) => !open && setAppointmentModalLead(null)}
                    availableLeads={leads}
                    mode="appointment"
                    initialLeadId={appointmentModalLead?.id}
                    showTrigger={false}
                />

                {/* Downgrade Confirmation Modal */}
                {downgradeConf?.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDowngradeConf(null)}>
                        <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex items-start justify-between p-6 pb-2">
                                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-500">
                                    <AlertTriangle className="w-6 h-6 shrink-0" />
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">Cancel Meeting?</h3>
                                </div>
                                <button onClick={() => setDowngradeConf(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-6 pt-2 pb-6 space-y-4">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    You are about to move <strong>{downgradeConf.lead.name}</strong> backwards in the pipeline. This action will permanently cancel their upcoming meeting.
                                </p>
                                <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 rounded-xl space-y-2">
                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Meeting to be cancelled</span>
                                    <div className="font-medium text-rose-900 dark:text-rose-200 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-rose-400" />
                                        {downgradeConf.lead.meeting_at && formatFlorida(downgradeConf.lead.meeting_at, "EEEE, MMM do 'at' HH:mm")}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex gap-3 justify-end">
                                <button
                                    onClick={() => setDowngradeConf(null)}
                                    className="px-4 py-2 font-medium text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                                >
                                    Keep in Scheduled
                                </button>
                                <button
                                    onClick={() => {
                                        commitMove(downgradeConf.lead.id, downgradeConf.newStatus, true)
                                        setDowngradeConf(null)
                                    }}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                                >
                                    <CalendarX className="w-4 h-4" /> Move & Cancel Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DragDropContext>
        </div>
    )
}
