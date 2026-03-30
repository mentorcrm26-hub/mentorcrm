import { Banknote } from 'lucide-react'
import { getStripeProducts } from './actions'
import { StripeClient } from './stripe-client'

export const metadata = {
  title: 'Stripe Financeiro | Admin',
}

export default async function StripeAdminPage() {
  const { success, data, error } = await getStripeProducts()

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <Banknote className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Gateway de Pagamento</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Central Stripe</h1>
          <p className="text-lg text-zinc-500 font-medium">Controle de saldos, saques e emissões de estorno via API.</p>
        </div>
      </header>

      {!success && error?.includes('não configurada') ? (
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex flex-col gap-2">
            <h3 className="text-lg font-bold text-amber-600 dark:text-amber-500">Stripe Não Conectado</h3>
            <p className="text-amber-700 dark:text-amber-400 font-medium">Para ver seus pagamentos e saldos aqui, adicione <code className="bg-amber-100 dark:bg-amber-900/30 px-1 rounded">STRIPE_SECRET_KEY</code> no seu arquivo <code>.env.local</code>.</p>
        </div>
      ) : (
        <StripeClient productData={data || []} />
      )}
    </div>
  )
}
