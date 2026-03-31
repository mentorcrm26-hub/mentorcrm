/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/leads/kanban-board'
import { NewLeadModal } from '@/components/leads/new-lead-modal'
import { ImportLeadsModal } from '@/components/leads/import-leads-modal'
import { fetchExternalEvents, reconcileExternalChanges } from '@/lib/integrations/calendar/sync-engine'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LeadsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: userProfile } = await supabase.from('users').select('role, tenant_id').eq('id', user.id).single()
    const userRole = userProfile?.role || 'agent'
    const tenantId = userProfile?.tenant_id

    // 1. Fetch external events, tags and agents (if admin)
    const [externalEvents, { data: allTags }, { data: agents }] = await Promise.all([
        fetchExternalEvents(supabase),
        supabase.from('tags').select('*').order('name'),
        userRole === 'admin' 
            ? supabase.from('users').select('id, full_name').eq('tenant_id', tenantId).order('full_name')
            : Promise.resolve({ data: [] })
    ])
    
    console.log(`[DEBUG LeadsPage] External events fetched: ${externalEvents.length}`)

    // 2. Reconcile changes (sync external deletions/moves back to CRM)
    const wasUpdated = await reconcileExternalChanges(supabase, externalEvents)
    console.log(`[DEBUG LeadsPage] Sync reconciliation performed. Updates made: ${wasUpdated}`)

    // 3. Fetch final leads data from DB (after reconciliation)
    let query = supabase
        .from('leads')
        .select(`
            *,
            lead_tags(tags(id, name, color_hex))
        `)
        .eq('is_archived', false)

    // FILTER: Agents see only assigned leads. Admins see all.
    if (userRole === 'agent') {
        query = query.eq('assigned_to', user.id)
    }

    const { data: leadsResponse } = await query.order('created_at', { ascending: false })

    const leads = (leadsResponse || []).map(lead => ({
        ...lead,
        tags: (lead.lead_tags as unknown as { tags: { id: string, name: string, color_hex: string } | null }[] | undefined)?.map(lt => lt.tags).filter(Boolean) || []
    })) || []

    return (
        <div className="flex flex-col gap-6 h-full">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Drag and drop your leads in the sales funnel.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <NewLeadModal mode="lead" agents={agents || []} userRole={userRole} />
                    {userRole === 'admin' && <ImportLeadsModal agents={agents || []} />}
                </div>
            </header>

            <main className="flex-1 overflow-x-auto min-h-0">
                <KanbanBoard initialLeads={leads || []} availableTags={allTags || []} userRole={userRole} agents={agents || []} />
            </main>
        </div>
    )
}
