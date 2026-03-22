import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/leads/kanban-board'
import { NewLeadModal } from '@/components/leads/new-lead-modal'
import { ImportLeadsModal } from '@/components/leads/import-leads-modal'

export default async function LeadsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch the leads for the user's tenant with expanded tags
    const { data: leadsResponse } = await supabase
        .from('leads')
        .select(`
            *,
            lead_tags(tags(id, name, color_hex))
        `)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

    const leads = leadsResponse?.map(lead => ({
        ...lead,
        tags: lead.lead_tags?.map((lt: any) => lt.tags).filter(Boolean) || []
    })) || []

    const { data: allTags } = await supabase.from('tags').select('*').order('name')

    return (
        <div className="flex flex-col gap-6 h-full">
            <header className="flex items-center justify-between pb-6 border-b border-zinc-200 dark:border-white/10 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Drag and drop your leads in the sales funnel.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <NewLeadModal mode="lead" />
                    <ImportLeadsModal />
                </div>
            </header>

            <main className="flex-1 overflow-x-auto min-h-0">
                <KanbanBoard initialLeads={leads || []} availableTags={allTags || []} />
            </main>
        </div>
    )
}
