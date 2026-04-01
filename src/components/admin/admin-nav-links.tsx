'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, LayoutTemplate, ShieldCheck, UsersRound, MessageCircle } from 'lucide-react'

export function AdminNavLinks() {
    const pathname = usePathname()

    const links = [
        { href: '/admin', label: 'Visão Global', icon: LayoutDashboard },
        { href: '/admin/clientes', label: 'Clientes & Assinaturas', icon: Users },
        { href: '/admin/team-requests', label: 'Solicitações Team', icon: UsersRound },
        { href: '/admin/stripe', label: 'Central Stripe', icon: CreditCard },
        { href: '/admin/landing-page', label: 'Landing Page Config', icon: LayoutTemplate },
        { href: '/admin/whatsapp', label: 'WhatsApp Admin', icon: MessageCircle },
        { href: '/admin/system', label: 'Saúde do Sistema', icon: ShieldCheck },
    ]

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin'
        return pathname?.startsWith(href)
    }

    const linkClass = (href: string) => `
        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
        ${isActive(href) 
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 shadow-sm ring-1 ring-rose-500/10' 
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
        }
    `

    const iconClass = (href: string) => `
        w-5 h-5 transition-colors
        ${isActive(href) ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-500'}
    `

    return (
        <div className="flex-1 py-6 px-4 space-y-1 relative">
            {links.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                    <link.icon className={iconClass(link.href)} />
                    {link.label}
                </Link>
            ))}
        </div>
    )
}
