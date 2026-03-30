import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import { AdminNavLinks } from '@/components/admin/admin-nav-links'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Usando RPC customizada criada na migration para verificar status de admin
    const { data: isAdmin, error } = await supabase.rpc('is_super_admin')

    console.log('--- DEBUG ADMIN ---')
    console.log('USER ID:', user.id)
    console.log('IS ADMIN:', isAdmin)
    console.log('ERROR:', error)
    console.log('-------------------')

    if (!isAdmin || error) {
        // Redireciona usuários ou agentes comuns de volta para os painéis liberados
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-950 dark:text-zinc-50 flex">
            {/* Sidebar Desktop */}
            <aside className="w-64 border-r border-zinc-200 dark:border-white/10 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/10">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500">Super Admin</span>
                </div>

                <AdminNavLinks />

                <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/30">
                    <div className="flex flex-col mb-4 px-2">
                        <span className="text-sm font-medium truncate">{user.user_metadata?.full_name || 'Owner'}</span>
                        <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Acesso Irrestrito</span>
                    </div>

                    <form action="/auth/signout" method="post">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-100/50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 rounded-xl transition-all group cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Encerrar Sessão
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header Mobile */}
                <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md z-20">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-500">Super Admin</span>
                    <AdminMobileNav />
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 relative z-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
