'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Trash2, Copy, Check, ShieldCheck, AlertCircle, X, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { createApiKey, getApiKeys, revokeApiKey } from './api-keys-actions'

export function ApiKeyManagement() {
    const [keys, setKeys] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newKeyName, setNewKeyName] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    
    // Revoke confirmation modal
    const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false)
    const [keyToRevoke, setKeyToRevoke] = useState<string | null>(null)
    const [isRevoking, setIsRevoking] = useState(false)
    
    // Key display modal (Show once)
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [hasCopied, setHasCopied] = useState(false)

    useEffect(() => {
        loadKeys()
    }, [])

    async function loadKeys() {
        setIsLoading(true)
        const res = await getApiKeys()
        if (res.success) setKeys(res.data || [])
        setIsLoading(false)
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newKeyName.trim()) return
        
        setIsGenerating(true)
        const res = await createApiKey(newKeyName)
        setIsGenerating(false)

        if (res.success && res.apiKey) {
            setGeneratedKey(res.apiKey)
            setIsCreateModalOpen(false)
            setNewKeyName('')
            loadKeys()
            toast.success('API Key generated successfully!')
        } else {
            toast.error(res.error || 'Failed to generate key')
        }
    }

    const openRevokeModal = (id: string) => {
        setKeyToRevoke(id)
        setIsRevokeModalOpen(true)
    }

    const handleRevoke = async () => {
        if (!keyToRevoke) return
        
        setIsRevoking(true)
        const res = await revokeApiKey(keyToRevoke)
        setIsRevoking(false)
        setIsRevokeModalOpen(false)
        setKeyToRevoke(null)

        if (res.success) {
            toast.success('Key revoked successfully')
            loadKeys()
        } else {
            toast.error(res.error || 'Failed to revoke key')
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setHasCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setHasCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            {/* Header & New Key Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200 dark:border-white/10 backdrop-blur-sm">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-500" />
                        API Keys & Integrations
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Use these keys to connect Mentor CRM with external systems (WordPress, Zapier, etc).
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Generate New Key
                </button>
            </div>

            {/* Keys List */}
            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                    </div>
                ) : keys.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                        <ShieldCheck className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 opacity-50" />
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium">No API keys generated yet.</p>
                        <p className="text-xs text-zinc-400 mt-1">Generate a key to start integrating your data.</p>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div 
                            key={key.id}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-all shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{key.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="text-[10px] sm:text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono text-zinc-500">
                                            {key.key_preview}
                                        </code>
                                        <span className="text-[10px] text-zinc-400">
                                            Created on {new Date(key.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => openRevokeModal(key.id)}
                                className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer"
                                title="Revoke Key"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal: Create New Key */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Generate Access Number</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Integration Name</label>
                                <input 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g.: WordPress Site, RD Station, Zapier..."
                                    value={newKeyName}
                                    onChange={e => setNewKeyName(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                This number will allow another system to access your leads and schedule. Keep it private.
                            </p>
                            <button 
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Key Now'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Show Generated Key (Liquid Glass Style) */}
            {generatedKey && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-indigo-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10 overflow-hidden p-8 sm:p-10 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        
                        <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-indigo-500/40 rotate-12">
                            <ShieldCheck className="w-10 h-10" />
                        </div>
                        
                        <h2 className="text-2xl font-black text-center text-zinc-900 dark:text-white mb-2">Your Integration Key</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8 px-4">
                            WARNING: Copy this key now. For your security, <strong className="text-zinc-900 dark:text-white">it will not be shown again</strong> after you close this window.
                        </p>

                        <div className="relative group mb-8">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-white/5 font-mono text-sm break-all">
                                <span className="flex-1 text-indigo-600 dark:text-indigo-400 font-bold select-all">
                                    {generatedKey}
                                </span>
                                <button 
                                    onClick={() => copyToClipboard(generatedKey)}
                                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 hover:scale-110 active:scale-90 transition-all cursor-pointer shrink-0"
                                >
                                    {hasCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-zinc-500" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 mb-8">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800 dark:text-amber-500 font-medium">
                                Never share this code in public chats or send it via unprotected email. Treat this number like your bank password.
                            </p>
                        </div>

                        <button 
                            onClick={() => setGeneratedKey(null)}
                            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-[1.5rem] py-4 text-sm font-black transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-xl"
                        >
                            I have saved the key securely
                        </button>
                    </div>
                </div>
            )}

            {/* CUSTOM Revoke Confirmation Modal (Replaces Browser Alert) */}
            {isRevokeModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-sm border border-red-200 dark:border-red-800">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Revoke API Key?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Are you sure you want to revoke this key? Any integration using it <strong className="text-zinc-900 dark:text-white">will stop working immediately</strong>.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleRevoke}
                                disabled={isRevoking}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isRevoking ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Yes, Revoke Now'}
                            </button>
                            <button 
                                onClick={() => { setIsRevokeModalOpen(false); setKeyToRevoke(null); }}
                                disabled={isRevoking}
                                className="w-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-bold py-3 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
