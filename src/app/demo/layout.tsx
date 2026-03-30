/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import Link from 'next/link'
import { LayoutDashboard, Users, LogIn, LogOut, Home } from 'lucide-react'
import { DemoProvider } from '@/components/demo/demo-provider'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
    return (
        <DemoProvider>
            <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-950 dark:text-zinc-50 flex">
                {/* Sidebar Desktop */}
                <aside className="w-64 border-r border-zinc-200 dark:border-white/10 hidden md:flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/10">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Mentor CRM</span>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-2 relative">
                        <Link href="/demo" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <LayoutDashboard className="w-5 h-5" />
                            Overview
                        </Link>
                        <Link href="/demo/leads" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                            <Users className="w-5 h-5" />
                            Leads (Kanban)
                        </Link>
                    </div>

                    <div className="p-4 border-t border-zinc-200 dark:border-white/10">
                        <Link href="/signup" className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors justify-center transition-all bg-[length:200%_auto] hover:bg-right hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                            <LogIn className="w-4 h-4" />
                            Create Account
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                    {/* Header Mobile */}
                    <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Mentor CRM</span>
                        <Link href="/signup" className="px-3 py-1.5 rounded text-xs font-semibold text-white bg-blue-600 flex items-center gap-2">
                            Create Account
                        </Link>
                    </header>

                    <div className="mx-4 md:mx-6 mt-4 md:mt-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-xl border border-blue-500/20 dark:border-blue-400/10 p-4 flex flex-col sm:flex-row items-center justify-between z-10 shrink-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/40 dark:bg-black/20 mix-blend-overlay"></div>
                        <div className="relative z-10 flex items-center gap-3 font-semibold text-blue-900 dark:text-blue-200 text-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            Interactive Demo Environment
                        </div>
                        <div className="relative z-10 text-sm font-medium text-blue-800 dark:text-blue-200 mt-3 sm:mt-0 bg-white/40 dark:bg-black/30 px-4 py-1.5 rounded-full backdrop-blur-md border border-blue-500/10 text-center">
                            Data is not saved (Read-Only Mode)
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 md:p-8 relative z-0">
                        {children}
                    </div>
                </main>
            </div>
        </DemoProvider>
    )
}
