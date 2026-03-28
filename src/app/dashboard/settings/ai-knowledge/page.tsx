'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useEffect, useState } from 'react'
import { Upload, FileText, Trash2, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getKnowledgeListAction, uploadKnowledgeAction, deleteKnowledgeAction } from './ai-actions'

export default function AIKnowledgePage() {
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [files, setFiles] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    // ... loadKnowledge e handleFileUpload permanecem iguais ou similares ...

    const handleRemove = async (id: string) => {
        setDeletingId(id)
        setDeletingId(id)
        try {
            const result = await deleteKnowledgeAction(id)
            if (result.error) throw new Error(result.error)
            toast.success('Document removed.')
            await loadKnowledge()
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove document.')
        } finally {
            setDeletingId(null)
        }
    }

    useEffect(() => {
        loadKnowledge()
    }, [])

    const loadKnowledge = async () => {
        try {
            setLoading(true)
            const data = await getKnowledgeListAction()
            setFiles(data)
        } catch (error) {
            toast.error('Failed to load knowledge base.')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File too large. Max 5MB.')
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const result = await uploadKnowledgeAction(formData)
            if (result.error) throw new Error(result.error)
            
            toast.success('File uploaded and indexed successfully!')
            await loadKnowledge()
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to process file.')
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const filteredFiles = files.filter(f => 
        f.name.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-white">IA Knowledge Base</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Upload documents (PDF, TXT) to train your AI on company specific information.
                </p>
            </div>

            <div className="grid gap-6">
                {/* Upload Area */}
                <div className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                        {uploading ? (
                            <Loader2 className="w-6 h-6 text-zinc-600 dark:text-zinc-400 animate-spin" />
                        ) : (
                            <Upload className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {uploading ? 'Processing Document...' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">PDF or TXT up to 5MB</p>
                    </div>
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        accept=".pdf,.txt"
                    />
                </div>

                {/* Search & List */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search indexed knowledge..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        />
                    </div>

                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                        {loading ? (
                            <div className="p-12 text-center">
                                <Loader2 className="w-8 h-8 text-zinc-200 dark:text-zinc-800 animate-spin mx-auto" />
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="p-12 text-center">
                                <FileText className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {search ? 'No documents match your search.' : 'No documents indexed yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                                {filteredFiles.map((file) => (
                                    <div key={file.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                                                <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{file.name}</p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{file.size} • Indexed at {new Date(file.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setItemToDelete(file.id)
                                                setIsConfirmOpen(true)
                                            }}
                                            className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Confirm Modal */}
            {isConfirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-sm border border-red-200 dark:border-red-800">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Delete Document?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            This document will be permanently removed from the AI knowledge base. This action cannot be undone.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => {
                                    if (itemToDelete) handleRemove(itemToDelete)
                                    setIsConfirmOpen(false)
                                }}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 text-sm font-bold transition-all shadow-md active:scale-95"
                            >
                                Yes, Remove Document
                            </button>
                            <button 
                                onClick={() => {
                                    setIsConfirmOpen(false)
                                    setItemToDelete(null)
                                }}
                                className="w-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-bold py-3 transition-colors"
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
