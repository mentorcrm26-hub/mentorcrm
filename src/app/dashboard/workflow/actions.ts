'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Workflow, WorkflowStep } from '@/types/workflow';
import { manualSendMessage } from '@/app/dashboard/leads/actions';

export async function getUserTenant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('WorkFlow Action: No user session found');
    return null;
  }

  // 1. Check JWT metadata first (fastest)
  const metaTenantId = user.user_metadata?.tenant_id;
  if (metaTenantId) return metaTenantId;

  // 2. Use Admin Client to bypass RLS for this specific check 
  // (Helpful if user profile sync is delayed or RLS is restrictive)
  const adminSupabase = await createAdminClient();
  const { data: profile, error } = await adminSupabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('WorkFlow Action: Error fetching user tenant:', error.message);
  }

  return profile?.tenant_id || null;
}

export async function getWorkflows() {
  const supabase = await createClient();
  const tenantId = await getUserTenant();
  if (!tenantId) return { success: false, error: 'Tenant not found or Unauthorized' };

  const { data, error } = await supabase
    .from('workflows')
    .select(`
      *,
      steps:workflow_steps(*),
      edges:workflow_edges(*)
    `)
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function saveWorkflow(
  workflow: Partial<Workflow>, 
  steps: Partial<WorkflowStep>[],
  edges: any[] = []
) {
  const supabase = await createClient();
  const tenantId = await getUserTenant();
  if (!tenantId) return { success: false, error: 'Tenant not found or Unauthorized' };

  // 1. Save Workflow
  const { data: savedWorkflow, error: wfError } = await supabase
    .from('workflows')
    .upsert({
      ...workflow,
      tenant_id: tenantId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (wfError) return { success: false, error: wfError.message };

  // 2. Save Steps
  if (workflow.id) {
    // Basic sync: delete old steps/edges and re-insert 
    // (In production, a more careful diffing might be better, but this is robust for now)
    await supabase.from('workflow_steps').delete().eq('workflow_id', workflow.id);
    await supabase.from('workflow_edges').delete().eq('workflow_id', workflow.id);
  }

  const stepsToInsert = steps.map((step) => ({
    ...step,
    workflow_id: savedWorkflow.id,
    updated_at: new Date().toISOString()
  }));

  const { data: insertedSteps, error: stepsError } = await supabase
    .from('workflow_steps')
    .insert(stepsToInsert)
    .select();

  if (stepsError) return { success: false, error: stepsError.message };

  // 3. Save Edges
  // Map temporary client IDs to new DB IDs if necessary, 
  // but if we use UUIDs from client, it's easier.
  const edgesToInsert = edges.map(edge => ({
    workflow_id: savedWorkflow.id,
    source_step_id: edge.source,
    target_step_id: edge.target,
    source_handle: edge.sourceHandle || null,
    label: edge.label || null
  }));

  if (edgesToInsert.length > 0) {
    const { error: edgesError } = await supabase
      .from('workflow_edges')
      .insert(edgesToInsert);
    if (edgesError) return { success: false, error: edgesError.message };
  }

  revalidatePath('/dashboard/workflow');
  return { success: true, data: savedWorkflow };
}

export async function deleteWorkflow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('workflows').delete().eq('id', id);
  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/workflow');
  return { success: true };
}

export async function assignWorkflowToLead(leadId: string, workflowId: string) {
  const supabase = await createClient();
  const tenantId = await getUserTenant();
  if (!tenantId) return { success: false, error: 'Unauthorized' };

  // Get the first step of the workflow
  const { data: firstStep } = await supabase
    .from('workflow_steps')
    .select('id')
    .eq('workflow_id', workflowId)
    .order('order_index', { ascending: true })
    .limit(1)
    .single();

  const { data, error } = await supabase
    .from('lead_workflows')
    .insert({
      lead_id: leadId,
      workflow_id: workflowId,
      tenant_id: tenantId,
      current_step_id: firstStep?.id || null,
      status: 'active'
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/dashboard/leads');
  return { success: true, data };
}

export async function executeWorkflowStep(
  leadWorkflowId: string, 
  stepId: string, 
  choiceHandle?: string
) {
  const supabase = await createClient();
  
  // 1. Get step details and current lead info
  const { data: step } = await supabase
    .from('workflow_steps')
    .select('*')
    .eq('id', stepId)
    .single();

  const { data: leadWorkflow } = await supabase
    .from('lead_workflows')
    .select('*, lead:leads(*)')
    .eq('id', leadWorkflowId)
    .single();

  if (!step || !leadWorkflow) return { success: false, error: 'Step or Lead Workflow not found' };

  const lead = leadWorkflow.lead;

  // 2. Execute Action based on type
  let actionResult: any = { success: true };

  // Skip actions for 'gate' or 'start' types as they are just routing nodes
  if (step.type !== 'gate' && step.type !== 'start') {
    switch (step.type) {
      case 'message':
        if (step.config?.template_id) {
          actionResult = await manualSendMessage(step.config.template_id, lead);
        }
        break;
      
      case 'forward':
        if (step.config?.assigned_to) {
          const { error } = await supabase
            .from('leads')
            .update({ assigned_to: step.config.assigned_to })
            .eq('id', lead.id);
          if (error) actionResult = { success: false, error: error.message };
        }
        break;

      case 'document':
        // TODO: Logic for sending documents from Vault
        break;

      case 'task':
        // Manual tasks are just marked as done by advancing the step
        break;
    }
  }

  if (actionResult && !actionResult.success) return actionResult;

  // 3. Move to next step via Edges
  const { data: edges } = await supabase
    .from('workflow_edges')
    .select('target_step_id, source_handle, label')
    .eq('source_step_id', stepId);

  let nextStepId = null;
  let choices = null;

  if (edges && edges.length > 0) {
    if (edges.length === 1 && !choiceHandle) {
      // Auto-advance if only one path exists and no choice is pending
      nextStepId = edges[0].target_step_id;
    } else if (choiceHandle) {
      // Follow specific branch
      const chosenEdge = edges.find(e => e.source_handle === choiceHandle);
      nextStepId = chosenEdge?.target_step_id || null;
    } else {
      // Multiple paths - require user decision
      return { 
        success: true, 
        needsChoice: true, 
        choices: edges.map(e => ({ 
          handle: e.source_handle, 
          label: e.label || (e.source_handle === 'yes' ? 'Yes' : 'No') 
        })) 
      };
    }
  }

  const updatePayload: any = {
    current_step_id: nextStepId,
    updated_at: new Date().toISOString()
  };

  if (!nextStepId) {
    updatePayload.status = 'completed';
  }

  const { error: updateError } = await supabase
    .from('lead_workflows')
    .update(updatePayload)
    .eq('id', leadWorkflowId);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/dashboard/leads');
  return { success: true, completed: !nextStepId, nextStepId };
}

export async function getLeadActiveWorkflow(leadId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lead_workflows')
    .select(`
      *,
      workflow:workflows(
        *,
        steps:workflow_steps(*)
      ),
      current_step:workflow_steps(*)
    `)
    .eq('lead_id', leadId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
