'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Building2, CreditCard, Blocks } from 'lucide-react'

export function SettingsNav() {
    const pathname = usePathname()

    const navItems = [
        {
            name: 'General',
            href: '/dashboard/settings',
            icon: Building2,
            exact: true
        },
        {
            name: 'Integrations',
            href: '/dashboard/settings/integrations',
            icon: Blocks,
            exact: false
        },
        {
            name: 'IA Knowledge Base',
            href: '/dashboard/settings/ai-knowledge',
            icon: Building2, // Podemos mudar o ícone depois se necessário
            exact: false
        },
        {
            name: 'Billing',
            href: '/dashboard/settings/billing',
            icon: CreditCard,
            exact: false
        }
    ]

    return (
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
            {navItems.map((item) => {
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname?.startsWith(item.href)

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0
                            ${isActive
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white'
                            }
                        `}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                )
            })}
        </nav>
    )
}
