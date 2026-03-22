import { createClient } from '@/lib/supabase/server';
import { WorkflowManagementClient } from './WorkflowManagementClient';

export default async function WorkflowPage() {
    const supabase = await createClient();

    // 1. Fetch Workflows
    const { data: workflows } = await supabase
        .from('workflows')
        .select(`
            *,
            steps:workflow_steps(*),
            edges:workflow_edges(*)
        `)
        .order('created_at', { ascending: false });

    // 2. Fetch Context Data for the Builder
    const { data: templates } = await supabase
        .from('message_templates')
        .select('id, name, type')
        .order('name');

    const { data: users } = await supabase
        .from('users')
        .select('id, full_name, role')
        .order('full_name');

    const { data: vaultItems } = await supabase
        .from('vault_items')
        .select('id, name, type')
        .order('name');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">WorkFlow Playbooks</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                    Design structured playbooks for your agents to follow. Combine messages, documents, and tasks.
                </p>
            </div>

            <WorkflowManagementClient 
                initialWorkflows={workflows || []} 
                templates={templates || []}
                users={users || []}
                vaultItems={vaultItems || []}
            />
        </div>
    );
}
