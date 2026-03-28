'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState } from 'react'
import { Gift, CalendarDays, ArrowRight, MessageSquareText, Mail } from 'lucide-react'
import { Lead } from '@/types/leads'
import { SendMessageModal } from '@/components/leads/send-message-modal'

type LeadWithBirthday = Lead & {
    bMonth?: number
    bDay?: number
}

interface BirthdaysViewProps {
    monthBirthdays: LeadWithBirthday[]
    upcomingList: LeadWithBirthday[]
    currentDay: number
}

export function BirthdaysView({ monthBirthdays, upcomingList, currentDay }: BirthdaysViewProps) {
    const [messageModalState, setMessageModalState] = useState<{
        isOpen: boolean,
        lead: LeadWithBirthday | null,
        type: 'whatsapp' | 'sms' | 'email' | null
    }>({ isOpen: false, lead: null, type: null })

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between pb-6 shrink-0 gap-4 border-b border-zinc-200 dark:border-white/10">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-1 flex items-center gap-3">
                        <Gift className="w-8 h-8 text-indigo-500" />
                        Birthdays
                    </h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Stay ahead of relationships by wishing your clients a happy birthday.
                    </p>
                </div>
            </header>

            {/* Upcoming Birthdays Alert / Highlight */}
            {upcomingList.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-indigo-900 dark:text-indigo-200">Upcoming in the next 7 days</h2>
                            <p className="text-sm text-indigo-700 dark:text-indigo-400">Don&apos;t miss the chance to send a message!</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingList.map(lead => (
                            <div key={lead.id} className="bg-white dark:bg-zinc-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        {lead.name}
                                        {lead.bDay === currentDay && (
                                            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                                Today!
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-zinc-500 mt-0.5">
                                        Day {lead.bDay}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
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

                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Month Birthdays List */}
            <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 border-l-4 border-zinc-300 dark:border-zinc-700 pl-3">
                    All Birthdays this Month ({monthBirthdays.length})
                </h3>

                {monthBirthdays.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <Gift className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                        <h4 className="text-zinc-900 dark:text-white font-medium">No birthdays this month</h4>
                        <p className="text-zinc-500 text-sm mt-1">Add Birth Dates to your leads to see them here.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-medium border-b border-zinc-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Day</th>
                                    <th className="px-6 py-4">Lead Name</th>
                                    <th className="px-6 py-4">Phone</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {monthBirthdays.map((lead) => (
                                    <tr key={lead.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${lead.bDay === currentDay ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
                                                {lead.bDay}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                                            {lead.name}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {lead.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500">
                                            {lead.email || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => setMessageModalState({ isOpen: true, lead, type: 'whatsapp' })}
                                                    className="flex p-1.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors bg-white dark:bg-zinc-950 shadow-sm border border-zinc-100 dark:border-zinc-800"
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
                                                    className="flex p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 transition-colors bg-white dark:bg-zinc-950 shadow-sm border border-zinc-100 dark:border-zinc-800"
                                                    title="Send SMS"
                                                >
                                                    <MessageSquareText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setMessageModalState({ isOpen: true, lead, type: 'email' })}
                                                    className="flex p-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors bg-white dark:bg-zinc-950 shadow-sm border border-zinc-100 dark:border-zinc-800"
                                                    title="Send Email"
                                                >
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <SendMessageModal
                isOpen={messageModalState.isOpen}
                onClose={() => setMessageModalState(prev => ({ ...prev, isOpen: false }))}
                lead={messageModalState.lead}
                type={messageModalState.type}
            />
        </div>
    )
}
