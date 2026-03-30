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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-blue-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Agent Solo Mensal</h3>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">{tenantStats.soloMonthly || 0}</p>
          <div className="flex gap-2 text-[10px] font-bold text-zinc-500">
             <span>Assinantes ativos</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-indigo-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Agent Solo Anual</h3>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">{tenantStats.soloAnnual || 0}</p>
          <div className="flex gap-2 text-[10px] font-bold text-zinc-500">
             <span>Economia confirmada</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-purple-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
               <Users className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Team Monthly</h3>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">{tenantStats.team || 0}</p>
          <div className="flex gap-2 text-[10px] font-bold text-zinc-500">
             <span>Agências multi-agentes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 p-6 border hover:border-zinc-400/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl">
               <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sandbox Demo</h3>
          </div>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">{tenantStats.sandbox || 0}</p>
          <div className="flex gap-2 text-[10px] font-bold text-zinc-500">
             <span>Usuários experimentais</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 border border-rose-400/20 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
             <ShieldCheck className="w-20 h-20 text-white" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-white/20 text-white rounded-xl">
               <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-bold text-rose-100 uppercase tracking-widest">Clientes VIPs</h3>
          </div>
          <p className="text-3xl font-extrabold text-white mb-2 relative z-10">{tenantStats.vip || 0}</p>
          <div className="flex gap-2 text-[10px] font-bold text-rose-100/60 relative z-10">
             <span>Acesso cortesia/vitalício</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12 lg:col-span-6 bg-white dark:bg-zinc-950 p-6 border hover:border-emerald-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
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

        <div className="md:col-span-12 lg:col-span-6 bg-white dark:bg-zinc-950 p-6 border hover:border-purple-500/30 transition-colors border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
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

