'use client';

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { useState, useRef } from 'react';
import { Mail, MessageSquare, Plus, Trash2, Edit2, Variable, Save, X, Info, RefreshCw, LayoutTemplate } from 'lucide-react';
import { toast } from 'sonner';
import { saveTemplate, deleteTemplate } from './actions';

const WhatsAppIcon = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
        <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
    </svg>
);

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
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);
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
            window.location.reload(); 
        } else {
            toast.error(res.error || 'Failed to save template.');
        }
    };

    const handleDelete = async (id: string) => {
        setIsConfirmOpen(false);
        setIsLoading(true);
        const res = await deleteTemplate(id);
        setIsLoading(false);
        if (res.success) {
            toast.success('Deleted!');
            window.location.reload();
        } else {
            toast.error(res.error || 'Failed to delete template.');
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

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = start + variable.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    return (
        <div className="relative min-h-[500px]">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-sm">
                        <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold tracking-widest uppercase text-zinc-900 dark:text-zinc-100">
                            Template Library
                        </h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">
                            {templates.length} Active {templates.length === 1 ? 'Rule' : 'Rules'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setCurrentTemplate({ name: '', type: 'email', content: '', subject: '' });
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-emerald-950 px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-sm transition-all active:scale-95 border border-transparent"
                >
                    <Plus className="w-4 h-4" /> New Setup
                </button>
            </div>

            {/* Grid Layout (Replaces old vertical list) */}
            {templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            className="group relative flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm hover:-translate-y-1 transition-transform cursor-pointer"
                            onClick={() => {
                                setCurrentTemplate(t);
                                setIsEditing(true);
                            }}
                        >
                            <div className="flex items-start justify-between p-5 border-b border-zinc-100 dark:border-zinc-900">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-sm ${t.type === 'email' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'}`}>
                                    {t.type === 'email' ? <Mail className="w-4 h-4" /> : <WhatsAppIcon className="w-4 h-4" />}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIdToDelete(t.id);
                                        setIsConfirmOpen(true);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="p-5 flex-1 flex flex-col">
                                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base line-clamp-1">{t.name}</h4>
                                <p className="text-[10px] text-zinc-400 mt-2 font-mono uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 w-fit px-2 py-0.5 rounded-sm">
                                    {t.type}
                                </p>
                                
                                <div className="mt-4 text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                                    {t.content}
                                </div>
                            </div>
                            
                            <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity rounded-b-sm">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">EDIT TEMPLATE</span>
                                <Edit2 className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-sm bg-zinc-50 dark:bg-zinc-900/20">
                    <Variable className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">No Variables Configured</h3>
                    <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">
                        Create your first email or mobile message strategy below to automate your outreach.
                    </p>
                    <button
                        onClick={() => {
                            setCurrentTemplate({ name: '', type: 'email', content: '', subject: '' });
                            setIsEditing(true);
                        }}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 text-xs font-bold uppercase tracking-widest rounded-sm shadow-sm transition-transform active:scale-95"
                    >
                        Define Template
                    </button>
                </div>
            )}

            {/* Slide-over Editor Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col">
                        <form onSubmit={handleSave} className="flex flex-col h-full">
                            
                            {/* Editor Header */}
                            <div className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 z-10">
                                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    {currentTemplate.id ? 'Modify Setup' : 'New Configuration'}
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Editor Body */}
                            <div className="flex-1 p-8 space-y-8">
                                {/* Type Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Strategy Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentTemplate({...currentTemplate, type: 'email'})}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-sm text-xs font-bold border transition-all ${currentTemplate.type === 'email' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                                        >
                                            <Mail className="w-4 h-4" /> EMAIL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentTemplate({...currentTemplate, type: 'whatsapp'})}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-sm text-xs font-bold border transition-all ${currentTemplate.type === 'whatsapp' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                                        >
                                            <WhatsAppIcon className="w-4 h-4" /> WHATSAPP
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Internal Reference Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={currentTemplate.name}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                                        placeholder="e.g. Intro Follow-Up"
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all outline-none font-medium"
                                    />
                                </div>

                                {currentTemplate.type === 'email' && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email Display Subject</label>
                                        <input
                                            type="text"
                                            value={currentTemplate.subject || ''}
                                            onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                                            placeholder="Hello {nome_cliente}!"
                                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm px-4 py-3 text-sm focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all outline-none font-medium text-blue-700 dark:text-blue-400"
                                        />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Injectable Parameters</label>
                                    <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-sm border border-zinc-200 dark:border-zinc-800">
                                        {['{nome_cliente}', '{email_cliente}', '{origem}', '{produto}', '{data_hoje}', '{data_reuniao}', '{hora_reuniao}', '{link_google_meet}', '{link_reuniao}'].map(v => (
                                            <button
                                                key={v}
                                                type="button"
                                                onClick={() => insertVariable(v)}
                                                className="text-[10px] uppercase font-mono px-2 py-1 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors border border-zinc-300 dark:border-zinc-700 rounded-[2px]"
                                            >
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 flex-1 flex flex-col">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Payload Content</label>
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        required
                                        value={currentTemplate.content}
                                        onChange={(e) => setCurrentTemplate({...currentTemplate, content: e.target.value})}
                                        placeholder="Write your execution script..."
                                        className="w-full flex-1 min-h-[250px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-sm p-5 text-sm font-sans focus:border-zinc-900 dark:focus:border-zinc-400 focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-all outline-none resize-none leading-relaxed"
                                    />
                                </div>
                            </div>

                            {/* Editor Footer */}
                            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 py-4 text-xs font-bold uppercase tracking-widest rounded-sm flex items-center justify-center gap-3 transition-transform active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" /> Compile & Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Brutalist Confirm Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-sm shadow-2xl border-4 border-zinc-900 dark:border-white p-8 animate-in zoom-in-95 duration-200">
                        <div className="w-full border-b-2 border-zinc-900 dark:border-zinc-800 pb-4 mb-6">
                            <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-900 dark:text-white flex items-center gap-2">
                                <Trash2 className="w-6 h-6 text-red-600" />
                                Destructive Action
                            </h3>
                        </div>
                        <p className="text-sm font-mono text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                            Aviso: Uma vez que você delete este parâmetro, todas as chamadas vinculadas a ele falharão silenciosamente. Proceder?
                        </p>
                        
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setIsConfirmOpen(false);
                                    setIdToDelete(null);
                                }}
                                className="flex-1 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 text-xs font-bold uppercase tracking-widest py-3 rounded-sm transition-colors"
                            >
                                Abortar
                            </button>
                            <button 
                                onClick={() => idToDelete && handleDelete(idToDelete)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest py-3 rounded-sm transition-colors active:scale-95 flex items-center justify-center"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
