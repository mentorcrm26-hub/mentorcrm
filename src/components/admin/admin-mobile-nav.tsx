'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { AdminNavLinks } from './admin-nav-links'

export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -mr-2 text-zinc-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
                <Menu className="h-6 w-6" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
                    <div className="relative flex w-full max-w-[280px] flex-col bg-white dark:bg-black border-l border-zinc-200 dark:border-white/10 ml-auto h-full animate-in slide-in-from-right duration-300 shadow-2xl">
                        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-200 dark:border-white/10">
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500">Super Admin</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto" onClick={() => setIsOpen(false)}>
                            <AdminNavLinks />
                        </div>

                        <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/50">
                            <form action="/auth/signout" method="post">
                                <button className="w-full flex items-center justify-center gap-2 px-2 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-xl transition-colors cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                                    Encerrar Sessão
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
