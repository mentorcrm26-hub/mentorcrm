'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState } from 'react'
import { deleteLead } from '@/app/dashboard/leads/actions'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export function DeleteLeadButton({ leadId, leadName, userRole = 'agent' }: { leadId: string, leadName: string, userRole?: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    if (userRole !== 'admin') return null

    async function handleDelete() {
        setIsDeleting(true)
        setShowConfirm(false)
        const toastId = toast.loading('Deleting lead...')

        const res = await deleteLead(leadId)

        if (!res.success) {
            toast.error(res.error || 'Failed to delete lead', { id: toastId })
            setIsDeleting(false)
        } else {
            toast.success('Lead deleted successfully', { id: toastId })
        }
    }

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
                className="text-zinc-400 hover:text-red-500 transition-colors p-1 rounded-md disabled:opacity-50"
                title="Delete Lead"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-sm border border-zinc-200 dark:border-white/10 overflow-hidden text-center p-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Delete Lead</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                            Are you sure you want to delete <strong>{leadName}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors w-full"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors w-full"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
