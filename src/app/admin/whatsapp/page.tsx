import { MessageCircle } from 'lucide-react'
import { getAdminWhatsAppInstance } from './actions'
import { AdminWhatsAppCard } from './admin-whatsapp-card'

export const metadata = { title: 'WhatsApp Admin | Mentor CRM' }

export default async function AdminWhatsAppPage() {
    const { data: instance } = await getAdminWhatsAppInstance()

    return (
        <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Notificações</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">WhatsApp Admin</h1>
                    <p className="text-lg text-zinc-500 font-medium">
                        Conecte seu WhatsApp para receber notificações automáticas de novas solicitações do plano Team.
                    </p>
                </div>
            </header>

            <AdminWhatsAppCard initialData={instance} />

            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Como funciona</h4>
                <ul className="space-y-1.5 text-sm text-zinc-500">
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">1.</span>
                        Conecte seu WhatsApp escaneando o QR code abaixo.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">2.</span>
                        Sempre que alguém preencher o formulário do plano Team na landing page, você receberá uma mensagem automática no WhatsApp com os dados do lead.
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">3.</span>
                        Você também pode ver e gerenciar todas as solicitações em{' '}
                        <a href="/admin/team-requests" className="text-rose-600 hover:underline font-semibold">
                            Solicitações Team
                        </a>.
                    </li>
                </ul>
            </div>
        </div>
    )
}
