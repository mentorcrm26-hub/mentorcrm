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

    const { data: userProfile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const userRole = userProfile?.role || 'agent'

    // 1. Fetch external events and tags first
    const [externalEvents, { data: allTags }] = await Promise.all([
        fetchExternalEvents(supabase),
        supabase.from('tags').select('*').order('name')
    ])
    
    console.log(`[DEBUG LeadsPage] External events fetched: ${externalEvents.length}`)

    // 2. Reconcile changes (sync external deletions/moves back to CRM)
    const wasUpdated = await reconcileExternalChanges(supabase, externalEvents)
    console.log(`[DEBUG LeadsPage] Sync reconciliation performed. Updates made: ${wasUpdated}`)

    // 3. Fetch final leads data from DB (after reconciliation)
    const { data: leadsResponse } = await supabase
        .from('leads')
        .select(`
            *,
            lead_tags(tags(id, name, color_hex))
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })


    const leads = (leadsResponse || []).map(lead => ({
        ...lead,
        tags: (lead.lead_tags as unknown as { tags: { id: string, name: string, color_hex: string } | null }[] | undefined)?.map(lt => lt.tags).filter(Boolean) || []
    })) || []

    return (
        <div className="flex flex-col gap-6 h-full">
            <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Drag and drop your leads in the sales funnel.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <NewLeadModal mode="lead" />
                    {userRole === 'admin' && <ImportLeadsModal />}
                </div>
            </header>

            <main className="flex-1 overflow-x-auto min-h-0">
                <KanbanBoard initialLeads={leads || []} availableTags={allTags || []} userRole={userRole} />
            </main>
        </div>
    )
}
