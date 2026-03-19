'use client';

import { useState, useRef } from 'react';
import { Mail, MessageSquare, Plus, Trash2, Edit2, Variable, Save, X, Info } from 'lucide-react';
import { toast } from 'sonner';
import { saveTemplate, deleteTemplate } from './actions';

interface Template {
    id: string;
    name: string;
    subject?: string;
    content: string;
    type: 'email' | 'whatsapp';
}

export function TemplatesManagementClient({ initialTemplates }: { initialTemplates: Template[] }) {
    const [templates, setTemplates] = useState<Template[]>(initialTemplates);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>({
        name: '',
        type: 'email',
        content: '',
        subject: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTemplate.name || !currentTemplate.content) {
            toast.error('Name and Content are required.');
            return;
        }

        setIsLoading(true);
        const res = await saveTemplate(currentTemplate as Template);
        setIsLoading(false);

        if (res.success) {
            toast.success('Template saved successfully!');
            setIsEditing(false);
            window.location.reload(); // Quick way to refresh for now
        } else {
            toast.error(res.error || 'Failed to save template.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const res = await deleteTemplate(id);
        if (res.success) {
            toast.success('Deleted!');
            window.location.reload();
        }
    };

    const insertVariable = (variable: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const content = currentTemplate.content || '';
        const before = content.substring(0, start);
        const after = content.substring(end);
        
        const newContent = before + variable + after;
        setCurrentTemplate({ ...currentTemplate, content: newContent });

        // Set focus back and move cursor after the inserted variable
        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + variable.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List Section */}
            <div className="lg:col-span-1 space-y-4 h-fit sticky top-4">
                <button
                    onClick={() => {
                        setCurrentTemplate({ name: '', type: 'email', content: '', subject: '' });
                        setIsEditing(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl py-3 text-sm font-bold hover:shadow-lg transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> New Template
                </button>

                <div className="space-y-3 pt-2">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                                currentTemplate.id === t.id 
                                ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-800'
                            }`}
                            onClick={() => {
                                setCurrentTemplate(t);
                                setIsEditing(true);
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-1.5 rounded-lg ${t.type === 'email' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                    {t.type === 'email' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(t.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h4 className="font-semibold text-sm truncate">{t.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">{t.type}</p>
                        </div>
                    ))}
                    
                    {templates.length === 0 && !isEditing && (
                        <div className="text-center py-10 opacity-50">
                            <Info className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No templates found.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Section */}
            <div className="lg:col-span-2">
                {isEditing ? (
                    <form onSubmit={handleSave} className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-100 dark:border-white/5">
                            <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                {currentTemplate.id ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {currentTemplate.id ? 'Edit Template' : 'Create New Template'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Template Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentTemplate.name}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                                        placeholder="e.g. Welcome Message"
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Type</label>
                                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentTemplate({...currentTemplate, type: 'email'})}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all ${currentTemplate.type === 'email' ? 'bg-white dark:bg-zinc-800 shadow-sm text-blue-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            Email
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentTemplate({...currentTemplate, type: 'whatsapp'})}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all ${currentTemplate.type === 'whatsapp' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                                        >
                                            WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {currentTemplate.type === 'email' && (
                                <div className="space-y-2 animate-in fade-in duration-300">
                                    <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Email Subject</label>
                                    <input
                                        type="text"
                                        value={currentTemplate.subject || ''}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                                        placeholder="Hello {nome_cliente}!"
                                        className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase tracking-tight text-zinc-400">Message Body</label>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">
                                        <Variable className="w-3 h-3" /> USABLE VARIABLES
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {['{nome_cliente}', '{email_cliente}', '{origem}', '{produto}', '{data_hoje}', '{data_reuniao}', '{hora_reuniao}', '{link_google_meet}', '{link_reuniao}'].map(v => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => insertVariable(v)}
                                            className="text-[11px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all border border-zinc-200 dark:border-zinc-700"
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    ref={textareaRef}
                                    required
                                    rows={8}
                                    value={currentTemplate.content}
                                    onChange={(e) => setCurrentTemplate({...currentTemplate, content: e.target.value})}
                                    placeholder="Write your message here..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none font-sans"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Save className="w-5 h-5" /> {isLoading ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="h-full min-h-[400px] border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/20">
                        <Variable className="w-12 h-12 mb-4 opacity-20" />
                        <p className="text-sm font-medium">Select a template or create a new one to start</p>
                    </div>
                )}
            </div>
        </div>
    );
}
