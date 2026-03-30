import { ShieldCheck, Users, Activity, CreditCard, Loader2 } from 'lucide-react'
import { getAdminOverviewData } from './actions'

export const metadata = {
  title: 'Super Admin | Mentor CRM',
}

export default async function AdminOverviewPage() {
  const { success, data, error } = await getAdminOverviewData()

  if (!success || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">
        Não foi possível carregar as métricas do sistema: {error}
      </div>
    )
  }

  const { tenantStats, mrrCents, automationsCount, hasStripeError } = data

  const formatUSD = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Painel de Controle MASTER</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Visão Global</h1>
          <p className="text-lg text-zinc-500 font-medium">As métricas completas do seu SaaS exibidas em tempo real.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-blue-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total de Clientes</h3>
          </div>
          <p className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">{tenantStats.total}</p>
          <div className="flex gap-2 text-xs font-bold">
            <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded-md">{tenantStats.active} Ativos</span>
            <span className="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded-md">{tenantStats.trial} Trial</span>
            <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded-md">{tenantStats.suspended} Susp.</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-emerald-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">MRR Total Estimado</h3>
          </div>
          <p className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">
             {hasStripeError ? <Loader2 className="w-6 h-6 animate-spin text-zinc-400" /> : formatUSD(mrrCents)}
          </p>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10 px-2 py-0.5 rounded-md">Assinaturas Ativas (Stripe)</span>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-purple-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Volume de Automações</h3>
          </div>
          <p className="text-4xl font-extrabold text-zinc-900 dark:text-white mb-2">{automationsCount}</p>
          <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/10 px-2 py-0.5 rounded-md">Configuradas pelas Agências</span>
        </div>
      </div>
    </div>
  )
}

