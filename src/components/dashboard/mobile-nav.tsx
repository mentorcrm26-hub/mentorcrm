'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Settings, Menu, X, LogOut, Gift, MessageSquare, Calendar as CalendarIcon, Archive, TrendingUp, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function MobileNav({ role, tenantName, tenantId }: { role: string | null, tenantName: string | null, tenantId: string | null }) {
    const [isOpen, setIsOpen] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        if (!tenantId) return;
        const supabase = createClient();

        const checkUnread = async () => {
            const { data } = await supabase
                .from('conversations')
                .select('unread_count')
                .eq('tenant_id', tenantId)
                .gt('unread_count', 0)
                .limit(1);
            setHasUnread(!!(data && data.length > 0));
        };

        checkUnread();

        const channel = supabase.channel('mobile_unread')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${tenantId}` },
                () => checkUnread()
            )
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${tenantId}` },
                () => checkUnread()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tenantId]);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -mr-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-50 w-72 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-white/10 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-white/10 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Mentor CRM</span>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 -mr-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    {[
                        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
                        { href: '/dashboard/leads', label: 'Leads (CRM)', icon: Users },
                        { href: '/dashboard/chat', label: 'Live Chat', icon: MessageSquare },
                        { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarIcon },
                        { href: '/dashboard/birthdays', label: 'Birthdays', icon: Gift },
                        { href: '/dashboard/vault', label: 'Mentor Vault', icon: Archive },
                        { href: '/dashboard/draw', label: 'Draw', icon: PenLine },
                    ].map((link) => {
                        const active = pathname === link.href || (link.href !== '/dashboard' && pathname?.startsWith(link.href))
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all relative ${active 
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                            >
                                <link.icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}`} />
                                {link.label}
                                {link.label === 'Live Chat' && hasUnread && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm z-10" />
                                )}
                            </Link>
                        )
                    })}
                    
                    {role === 'admin' && (
                        <>
                            <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Administration</div>
                            {[
                                { href: '/dashboard/analytics', label: 'Overview & Stats', icon: TrendingUp },
                                { href: '/dashboard/settings', label: 'Settings', icon: Settings },
                            ].map((link) => {
                                const active = pathname?.startsWith(link.href)
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${active 
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
                                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
                                    >
                                        <link.icon className={`w-5 h-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}`} />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </>
                    )}
                </div>

                <div className="p-6 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-950/50 shrink-0">
                    <div className="flex flex-col mb-6">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{tenantName || 'Your Workspace'}</span>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{role === 'admin' ? 'Account Owner' : 'Agent'}</span>
                    </div>

                    <form action="/auth/signout" method="post">
                        <button className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/30 dark:hover:bg-red-900/40 transition-all border border-red-100 dark:border-red-900/50 hover:scale-[1.02] active:scale-95 shadow-sm">
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
