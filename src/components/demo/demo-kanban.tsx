'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { MessageSquareText, Mail } from 'lucide-react'
import { useDemo } from '@/components/demo/demo-provider'

const COLUMNS = [
    { id: 'Diagnostic', title: 'Diagnóstico', color: 'bg-blue-500' },
    { id: 'Interview', title: 'Entrevista', color: 'bg-yellow-500' },
    { id: 'Strategy', title: 'Estratégia', color: 'bg-purple-500' },
    { id: 'Presentation', title: 'Apresentação', color: 'bg-indigo-500' },
    { id: 'Active Protection', title: 'Proteção Ativada', color: 'bg-emerald-500' },
]

type Lead = {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    status: string
    created_at: string
}

export function DemoKanbanBoard() {
    const { leads, setLeads } = useDemo()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result

        if (!destination) return

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return
        }

        const newStatus = destination.droppableId
        const updatedLeads = leads.map((lead) =>
            lead.id === draggableId ? { ...lead, status: newStatus } : lead
        )
        setLeads(updatedLeads)
    }

    if (!isMounted) return <div className="p-8 text-center text-zinc-500">Loading Kanban Demo...</div>

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full items-stretch pb-4 overflow-x-auto snap-x snap-mandatory">
                {COLUMNS.map((column) => {
                    const columnLeads = leads.filter(l => l.status === column.id) || []
                    return (
                        <div key={column.id} className="flex-1 min-w-[280px] flex flex-col bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl snap-center shrink-0 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                            <div className="p-4 font-semibold text-zinc-700 dark:text-zinc-200 flex justify-between items-center border-b border-zinc-200 dark:border-white/10 relative overflow-hidden rounded-t-2xl">
                                <div className={`absolute top-0 left-0 w-full h-1 ${column.color} opacity-80`} />
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${column.color} shadow-sm`} />
                                    {column.title}
                                </div>
                                <span className="bg-white dark:bg-black rounded-full px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                    {columnLeads.length}
                                </span>
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
                                                        className={`bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm border border-zinc-200/50 dark:border-white/10 group relative ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-500/20 rotate-2' : ''}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{lead.name}</h4>
                                                                {lead.email && <p className="text-xs text-zinc-500 mt-1 truncate">{lead.email}</p>}

                                                                {/* Life Planner Specific Badges */}
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {lead.status === 'Diagnostic' && (
                                                                        <span className="text-[9px] font-bold uppercase tracking-tighter bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200/50">Diagnóstico Pendente</span>
                                                                    )}
                                                                    {lead.status === 'Strategy' && (
                                                                        <span className="text-[9px] font-bold uppercase tracking-tighter bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-200/50">Estratégia Pronta</span>
                                                                    )}
                                                                    {lead.status === 'Active Protection' && (
                                                                        <span className="text-[9px] font-bold uppercase tracking-tighter bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-200/50">Proteção Ativada</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Integrations Bar */}
                                                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-white/5 flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                                                            <div className="relative group/tooltip">
                                                                <button className="flex p-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors" title="WhatsApp integration is available in the Full Version.">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                                        <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                                                                        <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                                                                    </svg>
                                                                </button>
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                                    Requires Auth
                                                                </span>
                                                            </div>
                                                            <div className="relative group/tooltip">
                                                                <button className="flex p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors" title="SMS integration is available in the Full Version.">
                                                                    <MessageSquareText className="w-4 h-4" />
                                                                </button>
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                                    Requires Auth
                                                                </span>
                                                            </div>
                                                            <div className="relative group/tooltip">
                                                                <button className="flex p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors" title="Email integration is available in the Full Version.">
                                                                    <Mail className="w-4 h-4" />
                                                                </button>
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-zinc-800 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                                                                    Requires Auth
                                                                </span>
                                                            </div>
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
        </DragDropContext>
    )
}
