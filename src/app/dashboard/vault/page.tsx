/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Archive, Search, RefreshCcw, User, Mail, Phone, Calendar as CalendarIcon, Filter } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { restoreLead } from '../leads/actions'
import { revalidatePath } from 'next/cache'

export default async function VaultPage({
    searchParams,
}: {
    searchParams: { q?: string }
}) {
    const supabase = await createClient()
    const query = searchParams.q || ''

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch archived leads with optional search
    let leadsQuery = supabase
        .from('leads')
        .select('*')
        .eq('is_archived', true)
        .order('archived_at', { ascending: false })

    if (query) {
        leadsQuery = leadsQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    }

    const { data: archivedLeads } = await leadsQuery

    async function handleRestore(id: string) {
        'use server'
        await restoreLead(id)
        revalidatePath('/dashboard/vault')
    }

    return (
        <div className="flex flex-col gap-6 h-full animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 to-zinc-500 dark:from-zinc-200 dark:to-zinc-400">
                        Mentor Vault
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        Search through your archived leads and historical data.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-500 uppercase tracking-tighter">
                    <Archive className="w-3.5 h-3.5" />
                    <span>{archivedLeads?.length || 0} Archived Leads</span>
                </div>
            </header>

            <div className="flex flex-col md:flex-row gap-4">
                <form className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search by name, email or phone..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                </form>
                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                    <Filter className="w-4 h-4" />
                    More Filters
                </button>
            </div>

            <main className="flex-1 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Lead</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Archived At</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {archivedLeads && archivedLeads.length > 0 ? (
                                archivedLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">{lead.name}</span>
                                                <div className="flex items-center gap-3 mt-1">
                                                    {lead.email && (
                                                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                            <Mail className="w-3 h-3" />
                                                            {lead.email}
                                                        </span>
                                                    )}
                                                    {lead.phone && (
                                                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                                                            <Phone className="w-3 h-3" />
                                                            {lead.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                                lead.status === 'closed' 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                            }`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-500 tabular-nums">
                                            {lead.archived_at ? format(new Date(lead.archived_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={handleRestore.bind(null, lead.id)}>
                                                <button 
                                                    type="submit"
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                                                >
                                                    <RefreshCcw className="w-3.5 h-3.5" />
                                                    Reactivate
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <Archive className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 italic">Vault is empty</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400">When you archive leads, they will safely appear here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
