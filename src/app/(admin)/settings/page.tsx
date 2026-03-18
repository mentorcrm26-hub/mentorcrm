import { getAdminSettings, triggerTrialCleanup } from './actions'
import { EvolutionSettingsForm } from './evolution-form'
import { Settings, ShieldCheck, Zap } from 'lucide-react'

export default async function AdminSettingsPage() {
  const initialSettings = await getAdminSettings()

  return (
    <div className="flex-1 space-y-8 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Admin Global Control</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">System Settings</h1>
          <p className="text-lg text-zinc-500 font-medium">Gerencie as infraestruturas globais e automações de todo o sistema Mentor CRM.</p>
        </div>
      </header>

      <div className="grid gap-8">
        {/* WhatsApp Gateway Panel */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Communication Engine</h2>
          </div>
          <EvolutionSettingsForm initialSettings={initialSettings.map(s => ({
            id: s.id,
            key_name: s.key_name,
            key_value: s.key_value
          }))} />
        </section>

        {/* Placeholder for other admin settings */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Cron Schedule Status</h4>
            <p className="text-sm text-zinc-500 mb-4">O motor de disparos automáticos está ativo e monitorando reuniões em Florida Timezone. Verifique os logs no dashboard de automação.</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold ring-1 ring-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Monitoring
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <h4 className="font-bold text-zinc-900 dark:text-white mb-2">Platform Maintenance</h4>
            <p className="text-sm text-zinc-500 mb-4">
              Remova workspaces de teste (Trials) expirados há mais de 5 dias para otimizar o banco de dados.
            </p>
            <form action={async () => {
              'use server'
              const res = await triggerTrialCleanup()
              // Normally we'd use a client component for feedback, but this is admin area
              // and server actions in forms handle it or we can pass a message.
              // For now, let's just make it work.
            }}>
              <button 
                className="w-full px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Ativar Garbage Collector
              </button>
            </form>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed">
            <h4 className="font-bold text-zinc-400 dark:text-zinc-600 mb-2">More Global Modules Coming Soon</h4>
            <p className="text-sm text-zinc-400 mb-4 font-medium">Métricas de disparos, controle de taxa de erros e configurações de mirroring avançado estarão disponíveis em breve.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
