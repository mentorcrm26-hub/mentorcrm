import { ShieldCheck, ServerCog } from 'lucide-react'
import { SystemHealthClient } from './system-client'

export const metadata = {
  title: 'Saúde do Sistema | Super Admin',
}

export default function SystemHealthPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Painel de Auditoria MASTER</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <ServerCog className="w-8 h-8 text-blue-500 dark:text-blue-400" /> Saúde do SaaS
          </h1>
          <p className="text-lg text-zinc-500 font-medium">Latência de conexões globais com serviços terceiros e limpeza de cache.</p>
        </div>
      </header>

      <SystemHealthClient />
    </div>
  )
}
