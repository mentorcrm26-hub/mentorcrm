'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Play, Pause, Pencil, X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { saveAutomation, deleteAutomation, toggleAutomation, saveAppointmentSettings, getAppointmentSettings } from './actions';

interface Automation {
    id: string;
    name: string;
    trigger_event: string;
    trigger_condition?: any;
    template_id: string;
    is_active: boolean;
    template?: {
        name: string;
        type: string;
    };
}

export function AutomationsManagementClient({ 
    initialAutomations, 
    templates
}: { 
    initialAutomations: Automation[], 
    templates: any[]
}) {
    const [automations, setAutomations] = useState<Automation[]>(initialAutomations);
    const [isEditing, setIsEditing] = useState(false);
    const [current, setCurrent] = useState<Partial<Automation>>({
        name: '',
        trigger_event: 'new_lead',
        is_active: true,
        trigger_condition: { status: 'Agendado' }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const [settings, setSettings] = useState<any>({
        reminder_0m_template_id: '',
        reminder_1h_template_id: '',
        reminder_30m_template_id: '',
        notify_professional_30m: true,
        professional_phone: '',
        professional_email: ''
    });

    useEffect(() => {
        const loadSettings = async () => {
            const data = await getAppointmentSettings();
            if (data) {
                setSettings({
                    ...data,
                    professional_phone: data.professional_phone || data.profile_phone || ''
                });
            }
        };
        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!current.name || !current.template_id) {
            toast.error('Name and Template are required.');
            return;
        }

        setIsLoading(true);
        const res = await saveAutomation(current as Automation);
        setIsLoading(false);

        if (res.success) {
            toast.success('Automation saved!');
            setIsEditing(false);
            window.location.reload();
        } else {
            toast.error(res.error);
        }
    };

    const handleToggle = async (id: string, active: boolean) => {
        const res = await toggleAutomation(id, !active);
        if (res.success) {
            toast.success(active ? 'Disabled' : 'Enabled');
            window.location.reload();
        }
    };

    const handleSaveSettings = async () => {
        setIsLoading(true);
        const res = await saveAppointmentSettings(settings);
        setIsLoading(false);
        if (res.success) {
            toast.success('Settings saved!');
        } else {
            toast.error('Error saving settings');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setCurrent({ name: '', trigger_event: 'new_lead', is_active: true, trigger_condition: { status: 'Agendado' } });
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" /> Create Automation
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {automations.map((a) => (
                    <div key={a.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:border-indigo-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-xl ${a.is_active ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-900'}`}>
                                <Zap className="w-5 h-5 transition-all" />
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleToggle(a.id, a.is_active)}
                                    title={a.is_active ? 'Disable Automation' : 'Enable Automation'}
                                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                                        a.is_active 
                                            ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' 
                                            : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                    }`}
                                >
                                    {a.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => {
                                        setCurrent(a);
                                        setIsEditing(true);
                                        setConfirmDeleteId(null);
                                    }}
                                    title="Edit Automation"
                                    className="p-2 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all cursor-pointer"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                
                                {confirmDeleteId === a.id ? (
                                    <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-red-100 dark:border-red-900/50 shadow-sm shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="px-2 py-1 text-[10px] font-extrabold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
                                        >
                                            NO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setIsLoading(true);
                                                const res = await deleteAutomation(a.id);
                                                setIsLoading(false);
                                                if (res.success) {
                                                    toast.success('Deleted');
                                                    window.location.reload();
                                                }
                                            }}
                                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-extrabold rounded cursor-pointer"
                                        >
                                            YES
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setConfirmDeleteId(a.id);
                                        }}
                                        title="Delete Automation"
                                        className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-zinc-900 dark:text-white line-clamp-1">{a.name}</h4>
                            {!a.is_active && (
                                <span className="text-[9px] font-extrabold uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">
                                    Paused
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
                            <span>
                                {a.trigger_event === 'new_lead' && 'A new lead is created'}
                                {a.trigger_event === 'status_change' && 'Lead status changes'}
                                {a.trigger_event === 'meeting_scheduled' && 'Immediately when scheduled'}
                                {a.trigger_event === 'lead_birthday' && 'Lead\'s birthday'}
                                {a.trigger_event === 'deal_closed' && 'Deal closed (Won)'}
                                {a.trigger_event === 'holiday_christmas' && 'Christmas Day (Dec 25)'}
                                {a.trigger_event === 'holiday_new_year' && 'New Year\'s Day (Jan 1)'}
                            </span>
                            {a.trigger_event === 'status_change' && (
                                <span className="bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-bold ml-1">
                                    → {a.trigger_condition?.status}
                                </span>
                            )}
                        </p>
                        
                        <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-2">
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-zinc-400 font-bold uppercase tracking-wider">Template</span>
                                <span className="text-zinc-600 dark:text-zinc-300 font-medium">{a.template?.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="text-zinc-400 font-bold uppercase tracking-wider">Channel</span>
                                <span className={`px-2 py-0.5 rounded-full font-bold ${a.template?.type === 'whatsapp' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30'}`}>
                                    {a.template?.type?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editing Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {current.id ? 'Edit Automation' : 'Create Automation'}
                                </h3>
                                <p className="text-sm text-zinc-500">Configure how this automation should behave.</p>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer">
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Automation Name</label>
                                <input
                                    type="text"
                                    value={current.name}
                                    onChange={(e) => setCurrent({ ...current, name: e.target.value })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50"
                                    placeholder="e.g. Welcome Message"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">When this happens...</label>
                                    <select
                                        value={current.trigger_event}
                                        onChange={(e) => setCurrent({ ...current, trigger_event: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50"
                                    >
                                        <option value="new_lead">A new lead is created</option>
                                        <option value="status_change">Lead status changes</option>
                                        <option value="meeting_scheduled">Immediately when meeting scheduled</option>
                                        <option value="lead_birthday">Lead's birthday</option>
                                        <option value="deal_closed">Deal closed (Won)</option>
                                        <option value="holiday_christmas">Christmas Day</option>
                                        <option value="holiday_new_year">New Year's Day</option>
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Send Message Template</label>
                                    <select
                                        value={current.template_id}
                                        onChange={(e) => setCurrent({ ...current, template_id: e.target.value })}
                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 font-bold text-indigo-600"
                                    >
                                        <option value="">Select a template...</option>
                                        {templates.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {current.trigger_event === 'status_change' && (
                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl animate-in slide-in-from-top-2">
                                    <div className="grid gap-2">
                                        <label className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">When status changes to:</label>
                                        <select
                                            value={current.trigger_condition?.status}
                                            onChange={(e) => setCurrent({ ...current, trigger_condition: { status: e.target.value } })}
                                            className="w-full bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-indigo-900/40 rounded-xl px-4 py-2 text-sm font-bold text-indigo-600"
                                        >
                                            <option value="Novo Lead">Novo Lead</option>
                                            <option value="Contactando">Contactando</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Vendido">Vendido</option>
                                            <option value="Perdido">Perdido</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-4 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/20 -mx-8 -mb-8 p-8">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Automation'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 text-zinc-500 font-bold hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* System Reminders Section */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-xl">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Scheduled Meeting Reminders (Auto Timeline)</h3>
                        <p className="text-xs text-zinc-500">Configure default timeline reminders for leads in the "Scheduled" column.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* 1 Hour Reminder */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">1 Hour Reminder (Lead)</label>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Auto</span>
                        </div>
                        <select 
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white"
                            value={settings.reminder_1h_template_id || ''}
                            onChange={(e) => setSettings({ ...settings, reminder_1h_template_id: e.target.value || null })}
                        >
                            <option value="">Default System Message</option>
                            {templates.filter(t => t.type === 'whatsapp').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-zinc-500 italic">Only leads in "Scheduled" column will receive this.</p>
                    </div>

                    {/* 30 Min Reminder */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">30 Min Reminder (Lead & You)</label>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Auto</span>
                        </div>
                        <select 
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white"
                            value={settings.reminder_30m_template_id || ''}
                            onChange={(e) => setSettings({ ...settings, reminder_30m_template_id: e.target.value || null })}
                        >
                            <option value="">Default System Message</option>
                            {templates.filter(t => t.type === 'whatsapp').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        
                        <div className="pt-2 space-y-3 border-t border-zinc-100 dark:border-white/5">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="notify-prof" 
                                    checked={settings.notify_professional_30m} 
                                    onChange={(e) => setSettings({ ...settings, notify_professional_30m: e.target.checked })}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" 
                                />
                                <label htmlFor="notify-prof" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Notify me (Professional) as well</label>
                            </div>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Your WhatsApp (e.g. 1407...)" 
                                    value={settings.professional_phone || ''}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 10) val = val.slice(0, 10);
                                        
                                        // Mask (XXX) XXX-XXXX
                                        let masked = val;
                                        if (val.length > 6) masked = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
                                        else if (val.length > 3) masked = `(${val.slice(0, 3)}) ${val.slice(3)}`;
                                        else if (val.length > 0) masked = `(${val}`;
                                        
                                        setSettings({ ...settings, professional_phone: masked });
                                    }}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white pr-10"
                                />
                                {settings.profile_phone && (                                    <button
                                        type="button"
                                        onClick={() => {
                                            let val = settings.profile_phone.replace(/\D/g, '');
                                            if (val.startsWith('1') && val.length > 10) val = val.slice(1);
                                            
                                            // Mask (XXX) XXX-XXXX
                                            let masked = val;
                                            if (val.length > 6) masked = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
                                            else if (val.length > 3) masked = `(${val.slice(0, 3)}) ${val.slice(3)}`;
                                            else if (val.length > 0) masked = `(${val}`;
 
                                            setSettings({ ...settings, professional_phone: masked });
                                            toast.success('Phone synced from profile');
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-indigo-500 transition-colors cursor-pointer"
                                        title="Sync with Personal Profile"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                    </button>

                                )}
                            </div>
                        </div>
                    </div>

                    {/* Exact Time Reminder */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Exact Time (I'm Waiting)</label>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Auto</span>
                        </div>
                        <select 
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 text-zinc-900 dark:text-white"
                            value={settings.reminder_0m_template_id || ''}
                            onChange={(e) => setSettings({ ...settings, reminder_0m_template_id: e.target.value || null })}
                        >
                            <option value="">Default System Message</option>
                            {templates.filter(t => t.type === 'whatsapp').map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <div className="pt-2">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="notify-prof-0m" 
                                    checked={settings.notify_professional_0m} 
                                    onChange={(e) => setSettings({ ...settings, notify_professional_0m: e.target.checked })}
                                    className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" 
                                />
                                <label htmlFor="notify-prof-0m" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Notify me (Professional) as well</label>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 italic">Sent exactly at the time of the meeting.</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-white/5 flex justify-end">
                    <button 
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <Save className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save Reminders Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
