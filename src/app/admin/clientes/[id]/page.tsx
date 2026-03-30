import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getTenantDetails } from './actions'
import { TenantDetailsClient } from './details-client'

export const metadata = {
  title: 'Detalhes do Cliente | Admin',
}

export default async function TenantDetailsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const { success, data, error } = await getTenantDetails(id)

  if (!success || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-red-50 dark:bg-red-950/20 p-8 rounded-3xl border border-red-100 dark:border-red-900/30 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Ops! Cliente não encontrado</h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-6">{error || 'Ocorreu um erro ao carregar as informações.'}</p>
          <Link href="/admin/clientes" className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold transition-all active:scale-95 inline-flex items-center gap-2 shadow-lg">
            <ArrowLeft className="w-4 h-4" /> Voltar para Listagem
          </Link>
        </div>
      </div>
    )
  }

  return <TenantDetailsClient data={data} />
}
