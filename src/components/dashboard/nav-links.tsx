'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, TrendingUp, MessageSquare, Calendar as CalendarIcon, Gift, Variable, Zap, Settings, Archive } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavLinksProps {
    role: string | null
    tenantId: string | null
}

export function NavLinks({ role, tenantId }: NavLinksProps) {
    const pathname = usePathname()
    const [hasUnread, setHasUnread] = useState(false)

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

        const channel = supabase.channel('sidebar_unread')
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

    const links = [
        { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
        { href: '/dashboard/leads', label: 'Leads (CRM)', icon: Users },
        { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
        { href: '/dashboard/chat', label: 'Live Chat', icon: MessageSquare },
        { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarIcon },
        { href: '/dashboard/birthdays', label: 'Birthdays', icon: Gift },
        { href: '/dashboard/vault', label: 'Mentor Vault', icon: Archive },
    ]

    const adminLinks = [
        { href: '/dashboard/settings/templates', label: 'Message Templates', icon: Variable },
        { href: '/dashboard/settings/automations', label: 'Smart Automations', icon: Zap },
        { href: '/dashboard/settings', label: 'Settings & API', icon: Settings },
    ]

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard'
        return pathname?.startsWith(href)
    }

    const linkClass = (href: string) => `
        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
        ${isActive(href) 
            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-500/10' 
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
        }
    `

    const iconClass = (href: string) => `
        w-5 h-5 transition-colors
        ${isActive(href) ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}
    `

    return (
        <div className="flex-1 py-6 px-4 space-y-1 relative">
            {links.map((link) => (
                <Link key={link.href} href={link.href} className={`${linkClass(link.href)} relative`}>
                    <link.icon className={iconClass(link.href)} />
                    {link.label}
                    {link.label === 'Live Chat' && hasUnread && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm z-10" />
                    )}
                </Link>
            ))}

            {role === 'admin' && (
                <>
                    <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Automation</div>
                    {adminLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                            <link.icon className={iconClass(link.href)} />
                            {link.label}
                        </Link>
                    ))}
                </>
            )}
        </div>
    )
}
