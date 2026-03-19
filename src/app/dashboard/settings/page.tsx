import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileSettingsForm } from './profile-settings-form'

export default async function SettingsPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile and tenant info
    const { data: userData } = await supabase
        .from('users')
        .select('*, tenants(name)')
        .eq('id', user.id)
        .single()

    const tenant = (userData?.tenants as any)

    return (
        <div className="max-w-4xl space-y-12 pb-20">
            {/* 1. General Workspace Settings */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 italic tracking-tight">General</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Update your workspace details and basic configuration.
                    </p>
                </div>

                <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 space-y-4">
                        <div className="grid gap-2">
                            <label htmlFor="workspace-name" className="text-xs font-bold uppercase tracking-tight text-zinc-400">
                                Workspace Name
                            </label>
                            <input
                                id="workspace-name"
                                className="flex h-10 w-full rounded-md border border-zinc-300 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-50"
                                defaultValue={tenant?.name || 'My Workspace'}
                            />
                        </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/30 px-6 py-4 flex items-center justify-end border-t border-zinc-200 dark:border-white/10">
                        <button className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 bg-blue-600 text-white shadow-sm hover:bg-blue-700 h-9 px-4 py-2 shrink-0">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Personal Profile Settings */}
            <ProfileSettingsForm 
                initialData={{
                    id: user.id,
                    full_name: userData?.full_name || '',
                    email: user.email || userData?.email || '',
                    phone: userData?.phone || '',
                    google_meet_link: userData?.google_meet_link || '',
                    other_meet_link: userData?.other_meet_link || ''
                }} 
            />

            {/* 3. Danger Zone */}
            <div className="space-y-6 pt-6 border-t border-zinc-100 dark:border-white/5">
                <div>
                    <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-widest">Danger Zone</h4>
                    <p className="text-sm text-zinc-500 mt-1">
                        Permanently delete your workspace and all data. This action is irreversible.
                    </p>
                </div>
                <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-red-800 dark:text-red-300">Delete this workspace and all associated leads/data</span>
                        <button className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 bg-red-600 text-white shadow-sm hover:bg-red-700 h-9 px-4 py-2 shrink-0">
                            Delete Workspace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
