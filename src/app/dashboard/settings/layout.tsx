/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SettingsNav } from './settings-nav'

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userProfile?.role !== 'admin') {
        redirect('/dashboard') // Regular agents can't access settings
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between pb-6 shrink-0 gap-4 border-b border-zinc-200 dark:border-white/10">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-1">Settings</h1>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        Manage your workspace, billing, and integrations.
                    </p>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-64 shrink-0">
                    <SettingsNav />
                </aside>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
