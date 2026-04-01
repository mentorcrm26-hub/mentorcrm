import { Users } from 'lucide-react'
import { getTeamRequests } from './actions'
import { TeamRequestsClient } from './team-requests-client'

export const metadata = { title: 'Solicitações Team | Admin' }

export default async function TeamRequestsPage() {
    const { success, data } = await getTeamRequests()

    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 border-b border-zinc-200 dark:border-white/10 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
                        <Users className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Plano Team</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Solicitações Team</h1>
                    <p className="text-lg text-zinc-500 font-medium">Leads que solicitaram o plano Team via landing page.</p>
                </div>
            </header>

            {success ? (
                <TeamRequestsClient initialData={data} />
            ) : (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl font-bold">
                    Falha ao carregar solicitações.
                </div>
            )}
        </div>
    )
}
