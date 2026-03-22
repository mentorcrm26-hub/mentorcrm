'use client';

import { useState, useEffect } from 'react';
import { 
  getWorkflows, 
  getLeadActiveWorkflow, 
  assignWorkflowToLead, 
  executeWorkflowStep 
} from '@/app/dashboard/workflow/actions';
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare, 
  FileText, 
  UserPlus, 
  CheckSquare,
  Loader2,
  Sparkles,
  GitBranch
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  leadId: string;
}

export function LeadPlaybookWidget({ leadId }: Props) {
  const [activeWorkflow, setActiveWorkflow] = useState<any>(null);
  const [availableWorkflows, setAvailableWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [leadId]);

  async function loadData() {
    setIsLoading(true);
    const [activeRes, listRes] = await Promise.all([
      getLeadActiveWorkflow(leadId),
      getWorkflows()
    ]);

    if (activeRes.success) setActiveWorkflow(activeRes.data);
    if (listRes.success) setAvailableWorkflows(listRes.data || []);
    setIsLoading(false);
  }

  const startPlaybook = async (workflowId: string) => {
    setIsProcessing(true);
    const res = await assignWorkflowToLead(leadId, workflowId);
    if (res.success) {
      toast.success('Playbook assigned to lead');
      loadData();
    } else {
      toast.error(res.error || 'Failed to assign playbook');
    }
    setIsProcessing(false);
  };

  const [choices, setChoices] = useState<any[] | null>(null);

  const nextStep = async (choiceHandle?: string) => {
    if (!activeWorkflow?.current_step_id) return;
    setIsProcessing(true);
    setChoices(null);

    const res = await executeWorkflowStep(activeWorkflow.id, activeWorkflow.current_step_id, choiceHandle);
    
    if (res.success) {
      if (res.needsChoice) {
        setChoices(res.choices);
      } else {
        toast.success(res.completed ? 'Playbook completed!' : 'Step completed');
        loadData();
      }
    } else {
      toast.error(res.error || 'Execution failed');
    }
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Smart Playbook
        </h3>
        {activeWorkflow && (
          <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded uppercase tracking-tighter">
            {activeWorkflow.workflow.name}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!activeWorkflow ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4"
          >
            <p className="text-xs text-zinc-500 mb-3 font-medium">No active playbook. Select one to start guiding this lead:</p>
            <div className="grid grid-cols-1 gap-2">
              {availableWorkflows.filter(w => w.is_active).map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => startPlaybook(wf.id)}
                  disabled={isProcessing}
                  className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all group text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{wf.name}</p>
                      <p className="text-[10px] text-zinc-400">Interactive Canvas Flow</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                </button>
              ))}
              {availableWorkflows.length === 0 && (
                <p className="text-[10px] text-zinc-400 italic text-center py-2">No playbooks defined yet.</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="executor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-indigo-600 rounded-2xl p-5 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                  {activeWorkflow.current_step?.type === 'gate' ? 'Decision Required' : 'Current Action'}
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                  {activeWorkflow.current_step?.type === 'message' && <MessageSquare className="w-6 h-6" />}
                  {activeWorkflow.current_step?.type === 'document' && <FileText className="w-6 h-6" />}
                  {activeWorkflow.current_step?.type === 'forward' && <UserPlus className="w-6 h-6" />}
                  {activeWorkflow.current_step?.type === 'task' && <CheckSquare className="w-6 h-6" />}
                  {activeWorkflow.current_step?.type === 'gate' && <GitBranch className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-lg font-bold leading-tight">{activeWorkflow.current_step?.label || 'Action Required'}</h4>
                  <p className="text-xs opacity-80 mt-1 capitalize">{activeWorkflow.current_step?.type} execution</p>
                </div>
              </div>

              {activeWorkflow.current_step?.type === 'task' && activeWorkflow.current_step.config?.description && (
                <div className="mb-6 p-3 bg-white/10 rounded-xl text-[11px] italic border border-white/10">
                  "{activeWorkflow.current_step.config.description}"
                </div>
              )}

              {choices ? (
                <div className="grid grid-cols-2 gap-3">
                  {choices.map((choice) => (
                    <button
                      key={choice.handle}
                      onClick={() => nextStep(choice.handle)}
                      disabled={isProcessing}
                      className="py-3 bg-white/20 hover:bg-white text-white hover:text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/30"
                    >
                      {choice.label}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => nextStep()}
                  disabled={isProcessing}
                  className="w-full py-3 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {activeWorkflow.current_step?.type === 'gate' ? 'Choose Path' : 'Task Accomplished'}
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
