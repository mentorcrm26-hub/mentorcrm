/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

export type WorkflowStepType = 'message' | 'document' | 'forward' | 'task' | 'gate' | 'start';

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  type: WorkflowStepType;
  label: string;
  config: {
    template_id?: string;
    vault_id?: string;
    assigned_to?: string;
    description?: string;
    [key: string]: any;
  };
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowEdge {
  id: string;
  workflow_id: string;
  source_step_id: string;
  target_step_id: string;
  source_handle: string | null;
  label: string | null;
  created_at: string;
}

export interface Workflow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  steps?: WorkflowStep[];
  edges?: WorkflowEdge[];
}

export interface LeadWorkflow {
  id: string;
  lead_id: string;
  workflow_id: string;
  current_step_id: string | null;
  status: 'active' | 'completed' | 'paused';
  tenant_id: string;
  created_at: string;
  updated_at: string;
  workflow?: Workflow;
  current_step?: WorkflowStep;
}
