import { getLandingConfig } from './actions'
import { LayoutTemplate } from 'lucide-react'
import { LandingPageConfigClient } from './landing-client'

export const metadata = {
  title: 'Landing Page Config | Admin',
}

export default async function LandingPageConfig() {
  const config = await getLandingConfig()

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <LayoutTemplate className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Painel de Vitrine</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Landing Page & Preços</h1>
          <p className="text-lg text-zinc-500 font-medium">Controle em tempo real de textos e planos exibidos para visitantes públicos.</p>
        </div>
      </header>

      {config ? (
        <LandingPageConfigClient initialConfig={config} />
      ) : (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">
          Erro ao carregar configurações. Verifique o banco de dados.
        </div>
      )}
    </div>
  )
}
