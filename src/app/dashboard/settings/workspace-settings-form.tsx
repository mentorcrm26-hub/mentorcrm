'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { updateTenantName } from './tenant-actions';

interface WorkspaceSettingsFormProps {
    initialName: string;
}

export function WorkspaceSettingsForm({ initialName }: WorkspaceSettingsFormProps) {
    const [name, setName] = useState(initialName);
    const [isLoading, setIsLoading] = useState(false);

    // Reset local state if server data changes (e.g. after revalidatePath)
    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Workspace name cannot be empty');
            return;
        }

        setIsLoading(true);
        try {
            const res = await updateTenantName(name);
            if (res.success) {
                toast.success('Workspace updated successfully!');
            } else {
                toast.error(res.error || 'Failed to update workspace.');
            }
        } catch (error) {
            console.error('Error saving workspace name:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 space-y-4">
                <div className="grid gap-2">
                    <label htmlFor="workspace-name" className="text-xs font-bold uppercase tracking-tight text-zinc-400">
                        Workspace Name
                    </label>
                    <input
                        id="workspace-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-50"
                        placeholder="Enter your workspace name"
                    />
                </div>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-end border-t border-zinc-200 dark:border-white/10">
                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 bg-blue-600 text-white shadow-sm hover:bg-blue-700 h-9 px-4 py-2 shrink-0 disabled:opacity-50 cursor-pointer active:scale-95"
                >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
