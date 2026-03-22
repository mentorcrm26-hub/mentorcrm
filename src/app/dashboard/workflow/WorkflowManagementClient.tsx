'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Handle, 
  Position, 
  Connection,
  Edge,
  Node,
  Panel,
  PanelPosition
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Workflow, WorkflowStep, WorkflowStepType } from '@/types/workflow';
import { 
  Plus, 
  Settings2, 
  Trash2, 
  MessageSquare, 
  FileText, 
  UserPlus, 
  CheckSquare, 
  X,
  Save,
  Play,
  ArrowLeft,
  Settings,
  GitBranch,
  Rocket
} from 'lucide-react';
import { saveWorkflow, deleteWorkflow } from './actions';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  initialWorkflows: Workflow[];
  templates: any[];
  users: any[];
  vaultItems: any[];
}

// --- Custom Node Components (Glassmorphism) ---

const NodeContainer = ({ children, title, icon: Icon, colorClass, selected }: any) => (
  <div className={`
    min-w-[200px] p-4 rounded-2xl border backdrop-blur-xl transition-all
    ${selected ? 'ring-2 ring-indigo-500 border-indigo-500 scale-105' : 'border-white/20 dark:border-white/10'}
    ${colorClass === 'indigo' ? 'bg-indigo-500/10 dark:bg-indigo-900/20' : ''}
    ${colorClass === 'emerald' ? 'bg-emerald-500/10 dark:bg-emerald-900/20' : ''}
    ${colorClass === 'amber' ? 'bg-amber-500/10 dark:bg-amber-900/20' : ''}
    bg-white/60 dark:bg-zinc-900/60 shadow-xl
  `}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-xl text-white ${
        colorClass === 'indigo' ? 'bg-indigo-500' : 
        colorClass === 'emerald' ? 'bg-emerald-500' : 
        'bg-amber-500'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50 font-sans">{title}</h4>
    </div>
    <div className="text-sm font-bold truncate max-w-[160px] font-sans">{children}</div>
  </div>
);

const ActionNode = ({ data, selected }: any) => {
  const iconMap: Record<string, any> = {
    message: MessageSquare,
    document: FileText,
    forward: UserPlus,
    task: CheckSquare,
  };
  const Icon = iconMap[data.type] || Play;
  const colorMap: Record<string, string> = {
    message: 'indigo',
    document: 'indigo',
    forward: 'emerald',
    task: 'amber',
  };

  return (
    <>
      <Handle 
        type="target" 
        position={Position.Left} 
        style={{ width: 12, height: 12, background: '#6366f1', border: '2px solid white' }}
      />
      <NodeContainer title={data.type} icon={Icon} colorClass={colorMap[data.type]} selected={selected}>
        {data.label || 'Untitled Step'}
      </NodeContainer>
      <Handle 
        type="source" 
        position={Position.Right} 
        style={{ width: 12, height: 12, background: '#6366f1', border: '2px solid white' }}
      />
    </>
  );
};

const StartNode = ({ selected }: any) => (
  <div className="flex flex-col items-center">
    <div className={`
      p-6 rounded-full border-2 backdrop-blur-xl transition-all flex items-center justify-center
      ${selected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-indigo-500/30'}
      bg-indigo-500/20 shadow-xl
    `}>
      <Rocket className="w-8 h-8 text-indigo-500 animate-pulse" />
    </div>
    <div className="mt-2 text-[10px] font-black uppercase tracking-tighter opacity-70">Trigger</div>
    <Handle 
      type="source" 
      position={Position.Right} 
      style={{ width: 12, height: 12, background: '#6366f1', border: '2px solid white' }}
    />
  </div>
);

const ConditionNode = ({ data, selected }: any) => (
  <>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ width: 12, height: 12, background: '#6366f1', border: '2px solid white' }}
    />
    <div className={`
      min-w-[160px] p-5 rounded-3xl border-2 backdrop-blur-xl transition-all flex flex-col items-center justify-center
      ${selected ? 'ring-2 ring-amber-500 border-amber-500' : 'border-amber-500/40'}
      bg-amber-100/50 dark:bg-amber-900/20 shadow-xl
    `}>
      <GitBranch className="w-6 h-6 text-amber-600 mb-1" />
      <div className="text-[10px] font-black uppercase tracking-tighter">Condition</div>
      <div className="text-[9px] font-bold opacity-70 text-center line-clamp-2">{data.label || 'Branch Logic'}</div>
    </div>
    
    <Handle 
      id="yes" 
      type="source" 
      position={Position.Right} 
      style={{ top: '30%', width: 12, height: 12, background: '#10b981', border: '2px solid white' }} 
    />
    <label className="absolute -right-8 top-[28%] text-[9px] font-black text-emerald-500 pointer-events-none">YES</label>
    
    <Handle 
      id="no" 
      type="source" 
      position={Position.Right} 
      style={{ top: '70%', width: 12, height: 12, background: '#f43f5e', border: '2px solid white' }} 
    />
    <label className="absolute -right-8 top-[68%] text-[9px] font-black text-rose-500 pointer-events-none">NO</label>
  </>
);

// --- Main Component ---

const nodeTypes = {
  action: ActionNode,
  start: StartNode,
  gate: ConditionNode,
};

export function WorkflowManagementClient({ initialWorkflows, templates, users, vaultItems }: Props) {
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<Partial<Workflow> | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<any>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sidebar node configuration state
  const [selectedNode, setSelectedNode] = useState<Node<any> | null>(null);

  const startNewWorkflow = () => {
    const id = crypto.randomUUID();
    setCurrentWorkflow({ name: '', description: '', is_active: true });
    
    const initialNodes: Node[] = [
      { 
        id: 'start', 
        type: 'start', 
        position: { x: 50, y: 200 }, 
        data: { type: 'start' } 
      },
    ];
    
    setNodes(initialNodes);
    setEdges([]);
    setIsEditing(true);
  };

  const editWorkflow = (wf: Workflow) => {
    setCurrentWorkflow(wf);
    
    // Map Steps to Nodes
    const wfNodes: Node[] = (wf.steps || []).map((step: any, idx) => {
      const px = step.position_x !== null && step.position_x !== undefined ? Number(step.position_x) : 50 + (idx * 250);
      const py = step.position_y !== null && step.position_y !== undefined ? Number(step.position_y) : 150;
      
      return {
        id: step.id,
        type: step.type === 'gate' ? 'gate' : step.type === 'start' ? 'start' : 'action',
        position: { x: px, y: py },
        data: { ...step } as any
      };
    });

    // Map Edges
    const wfEdges: Edge[] = (wf.edges || []).map((edge: any) => ({
      id: edge.id,
      source: edge.source_step_id,
      target: edge.target_step_id,
      sourceHandle: edge.source_handle,
      label: edge.label || undefined,
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 }
    }));

    setNodes(wfNodes);
    setEdges(wfEdges);
    setIsEditing(true);
  };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } }, eds));
  }, [setEdges]);

  const addActionNode = (type: WorkflowStepType) => {
    const newNode: Node = {
      id: crypto.randomUUID(),
      type: type === 'gate' ? 'gate' : 'action',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { type, label: `New ${type}`, config: {} }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = async () => {
    if (!currentWorkflow?.name) {
      toast.error('Workflow name is required');
      return;
    }

    setIsSaving(true);
    
    // Convert Nodes back to WorkflowStep structure
    const stepsToSave = nodes.map(node => ({
      id: node.id.length > 20 ? node.id : undefined, // Check if it's a UUID or simple ID
      type: (node.data as any).type as WorkflowStepType,
      label: (node.data as any).label || (node.type as string),
      config: (node.data as any).config || {},
      position_x: node.position.x,
      position_y: node.position.y
    }));

    const edgesToSave = edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      label: edge.label
    }));

    const res = await saveWorkflow(currentWorkflow, stepsToSave as any, edgesToSave);
    setIsSaving(false);

    if (res.success) {
      toast.success('Playbook saved successfully');
      setIsEditing(false);
      window.location.reload();
    } else {
      toast.error(res.error || 'Failed to save');
    }
  };

  const deleteSelectedNode = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    }
  };

  const updateNodeData = (data: any) => {
    if (selectedNode) {
      setNodes((nds) => nds.map((n) => n.id === selectedNode.id ? { ...n, data: { ...n.data, ...data } } : n));
    }
  };

  return (
    <div className="h-[80vh] w-full bg-zinc-50 dark:bg-zinc-950 rounded-[40px] border border-zinc-200 dark:border-zinc-800 overflow-hidden relative shadow-inner flex flex-col">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-10 h-full overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tighter uppercase italic">My Playbooks</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Design automated customer journeys</p>
              </div>
              <button
                onClick={startNewWorkflow}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-indigo-500/40"
              >
                <Plus className="w-5 h-5" />
                Build System
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workflows.map((wf) => (
                <div key={wf.id} className="group relative p-8 bg-white dark:bg-zinc-900/50 backdrop-blur-md rounded-[32px] border-2 border-zinc-100 dark:border-zinc-800 hover:border-indigo-500 transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => editWorkflow(wf)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-indigo-500 hover:text-white"><Settings2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{wf.name}</h3>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed line-clamp-2">{wf.description || 'No description provided.'}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="canvas"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="h-full w-full relative flex flex-col"
          >
            {/* Canvas Header (Non-floating for better layout) */}
            <div className="z-20 flex justify-between items-center p-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsEditing(false)} 
                  className="p-3 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-2xl transition-colors border border-zinc-200 dark:border-zinc-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Editing Workflow</span>
                  <input 
                    value={currentWorkflow?.name || ''} 
                    onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Playbook Name..." 
                    className="bg-transparent text-xl font-black uppercase tracking-tighter outline-none focus:text-indigo-600"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  Deploy Playbook
                </button>
              </div>
            </div>

            {/* Main Canvas Container */}
            <div className="flex-1 relative">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={(_, node) => setSelectedNode(node)}
                onPaneClick={() => setSelectedNode(null)}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                fitView
                className="bg-zinc-50 dark:bg-zinc-950"
              >
                <Background 
                  variant={('dots' as any)}
                  gap={20} 
                  size={1}
                  className="!text-zinc-300 dark:!text-zinc-800"
                />
                <Controls className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-800 !rounded-2xl" />
                
                <Panel position={'bottom-left' as PanelPosition} className="flex flex-col gap-3 mb-4 ml-4">
                  <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-3 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-row gap-3">
                    <button onClick={() => addActionNode('message')} className="group relative flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-2xl hover:scale-110 transition-all shadow-lg">
                      <MessageSquare className="w-5 h-5" />
                      <span className="absolute bottom-16 px-4 py-2 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase font-black tracking-widest whitespace-nowrap">Add Message</span>
                    </button>
                    <button onClick={() => addActionNode('gate')} className="group relative flex items-center justify-center w-12 h-12 bg-amber-500 text-white rounded-2xl hover:scale-110 transition-all shadow-lg">
                      <GitBranch className="w-5 h-5" />
                      <span className="absolute bottom-16 px-4 py-2 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase font-black tracking-widest whitespace-nowrap">Add Condition</span>
                    </button>
                    <button onClick={() => addActionNode('forward')} className="group relative flex items-center justify-center w-12 h-12 bg-emerald-600 text-white rounded-2xl hover:scale-110 transition-all shadow-lg">
                      <UserPlus className="w-5 h-5" />
                      <span className="absolute bottom-16 px-4 py-2 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase font-black tracking-widest whitespace-nowrap">Add Forward</span>
                    </button>
                  </div>
                </Panel>
              </ReactFlow>
            </div>

            {/* Inspector Sidebar */}
            <AnimatePresence>
              {selectedNode && selectedNode.type !== 'start' && (
                <motion.div
                  initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
                  className="absolute top-6 bottom-6 right-6 w-96 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl border border-white/20 rounded-[40px] shadow-2xl z-20 p-8 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black tracking-tighter uppercase whitespace-pre-wrap">Card Settings</h3>
                    <button onClick={() => setSelectedNode(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Step Label</label>
                      <input 
                        value={(selectedNode.data as any).label || ''} 
                        onChange={(e) => updateNodeData({ label: e.target.value })}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                      />
                    </div>

                    {selectedNode.data.type === 'message' && (
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">WhatsApp Template</label>
                        <select 
                          value={(selectedNode.data as any).config?.template_id || ''}
                          onChange={(e) => updateNodeData({ config: { ...(selectedNode.data as any).config, template_id: e.target.value } })}
                          className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none font-bold"
                        >
                          <option value="">Select...</option>
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                    )}

                    {selectedNode.data.type === 'forward' && (
                      <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Forward To</label>
                        <select 
                          value={(selectedNode.data as any).config?.assigned_to || ''}
                          onChange={(e) => updateNodeData({ config: { ...(selectedNode.data as any).config, assigned_to: e.target.value } })}
                          className="w-full bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl outline-none font-bold"
                        >
                          <option value="">Select Agent...</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={deleteSelectedNode}
                      className="w-full p-4 text-red-500 font-bold uppercase tracking-widest text-[10px] hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Destroy Card
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
