'use client'

import { useState } from 'react'
import { ArrowLeft, Building2, Calendar, Mail, ShieldCheck, ShieldBan, Users, CreditCard, Activity, ExternalLink, User, AlertCircle, Loader2, Link2, Gift } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toggleTenantStatus, toggleTenantVipStatus } from '../actions'
import { toast } from 'sonner'

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(isoString))
}

export function TenantDetailsClient({ data }: { data: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showVipModal, setShowVipModal] = useState(false)
  const [vipLoading, setVipLoading] = useState(false)
  
  const isSuspended = data.status === 'suspended'
  const isVip = data.is_vip === true
  const agentsCount = data.users?.length || 0

  const handleToggleStatus = async () => {
    setShowConfirmModal(false)
    setLoading(true)
    const res = await toggleTenantStatus(data.id, data.status)
    setLoading(false)
    
    if (res.success) {
      toast.success(isSuspended ? 'Workspace Reativado!' : 'Workspace Suspenso.')
      router.refresh()
    } else {
      toast.error(res.error || 'Erro ao alterar status')
    }
  }

  const handleToggleVip = async () => {
    setShowVipModal(false)
    setVipLoading(true)
    const res = await toggleTenantVipStatus(data.id, isVip)
    setVipLoading(false)
    
    if (res.success) {
      toast.success(isVip ? 'Status VIP Revogado.' : 'Acesso VIP Vitalício Concedido!')
      router.refresh()
    } else {
      toast.error(res.error || 'Erro ao alterar status VIP')
    }
  }

  const handleAccessWorkspace = () => {
    toast.info('Abrindo painel do cliente...')
    window.open(`${window.location.origin}/dashboard`, '_blank')
  }

  const handleStripeDashboard = () => {
    if (data.stripe_customer_id) {
        window.open(`https://dashboard.stripe.com/customers/${data.stripe_customer_id}`, '_blank')
    } else {
        toast.error('Este cliente não possui um Customer ID do Stripe vinculado.')
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Navigation */}
      <header className="flex flex-col gap-6">
        <Link 
            href="/admin/clientes" 
            className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 font-bold transition-colors w-fit group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para Listagem
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-white/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Painel Administrativo do Workspace</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                {data.name}
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isSuspended 
                    ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                 }`}>
                    {isSuspended ? (
                        <>
                            <ShieldBan className="w-3.5 h-3.5" /> Suspenso
                        </>
                    ) : (
                        <>
                            <ShieldCheck className="w-3.5 h-3.5" /> Ativo
                        </>
                    )}
                </span>
            </h1>
            <p className="text-zinc-500 font-medium">ID único: <code className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{data.id}</code></p>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={handleAccessWorkspace}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-rose-600/20 flex items-center gap-2 cursor-pointer"
             >
                Acessar Workspace <ExternalLink className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Info Cards */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 w-fit mb-4">
                        <Users className="w-5 h-5" />
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Agentes</p>
                    <h3 className="text-2xl font-black dark:text-white">{agentsCount}</h3>
                </div>
                
                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 w-fit mb-4">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Assinatura</p>
                    <h3 className="text-2xl font-black dark:text-white capitalize">
                        {data.plan === 'agent' ? 'Agent Solo' : 
                         data.plan === 'agent_annual' ? 'Agent Solo (Anual)' : 
                         data.plan === 'team' ? 'Team' : 
                         data.plan === 'sandbox' ? 'Sandbox' : 
                         data.plan || 'Nenhum'}
                    </h3>
                </div>

                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 w-fit mb-4">
                        <Activity className="w-5 h-5" />
                    </div>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Status Global</p>
                    <h3 className="text-2xl font-black dark:text-white text-emerald-500">Saudável</h3>
                </div>
            </div>

            {/* Users List Table */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-white/5">
                    <h3 className="text-lg font-black dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-rose-500" /> Agentes Conectados ao Workspace
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">Todos os membros com acesso ao banco de dados deste cliente.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-[10px] text-zinc-500 uppercase font-black tracking-widest border-b border-zinc-100 dark:border-white/5">
                            <tr>
                                <th className="px-6 py-4">Agente</th>
                                <th className="px-6 py-4">Cargo / Função</th>
                                <th className="px-6 py-4">E-mail</th>
                                <th className="px-6 py-4">Data de Ingresso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {data.users?.map((usr: any) => (
                                <tr key={usr.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-zinc-900 dark:text-white">{usr.full_name || 'Nome não preenchido'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wider ${
                                            usr.role === 'admin' 
                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' 
                                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                                        }`}>
                                            {usr.role === 'admin' ? 'Proprietário' : 'Agente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-zinc-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 opacity-60" />
                                            {usr.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400 text-xs">
                                        {usr.created_at ? new Date(usr.created_at).toLocaleDateString('pt-BR') : '--'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
             <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-white/5 shadow-sm space-y-6">
                <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Informações de Registro</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Criado em</span>
                            <span className="text-zinc-900 dark:text-white font-bold">{data.created_at ? formatDate(data.created_at) : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500 font-medium flex items-center gap-1.5"><Activity className="w-4 h-4" /> Última Atividade</span>
                            <span className="text-zinc-900 dark:text-white font-bold">Hoje, 14:00</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 dark:border-white/5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Zona Crítica</h4>
                    <div className="space-y-3">
                        <button 
                            onClick={() => setShowConfirmModal(true)}
                            disabled={loading}
                            className={`w-full py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                            isSuspended 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' 
                            : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                        }`}>
                           {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSuspended ? (
                                <><ShieldCheck className="w-4 h-4" /> Reativar Acesso</>
                           ) : (
                                <><ShieldBan className="w-4 h-4" /> Suspender Workspace</>
                           ))}
                        </button>
                        
                        {!isSuspended && (
                             <p className="text-[10px] text-zinc-400 text-center font-medium leading-relaxed">
                                A suspensão impede que qualquer agente faça login e encerra as sessões ativas do banco de dados.
                             </p>
                        )}
                    </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-8 rounded-3xl text-white shadow-xl shadow-rose-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CreditCard className="w-24 h-24 -rotate-12" />
                </div>
                <div className="flex items-center justify-between mb-2 opacity-80">
                    <h4 className="font-black uppercase tracking-widest text-[10px]">Faturamento Stripe</h4>
                    {isVip && (
                        <span className="bg-amber-400 text-amber-950 px-2 py-0.5 rounded uppercase font-black text-[9px] shadow-sm">
                            Cortesia VIP
                        </span>
                    )}
                </div>
                <p className="font-medium text-xs mb-4 opacity-90">Este cliente está vinculado ao Customer ID:</p>
                <div className="text-lg font-black mb-6 flex items-center gap-1">
                    {data.stripe_customer_id || 'Não vinculado'} 
                    {data.stripe_customer_id && (
                        <span 
                            className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-black cursor-pointer hover:bg-white/30 transition-colors ml-2" 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(data.stripe_customer_id)
                                toast.success('ID Copiado!')
                            }}
                        >
                            COPY
                        </span>
                    )}
                </div>
                <button 
                    onClick={handleStripeDashboard}
                    className="w-full bg-white text-rose-600 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg cursor-pointer mb-3"
                >
                    Ver no Dashboard Stripe
                </button>
                <div className="pt-4 border-t border-white/20 mt-2">
                    <button 
                         onClick={() => setShowVipModal(true)}
                         disabled={vipLoading}
                         className={`w-full py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border ${
                             isVip 
                             ? 'bg-transparent border-white/40 text-white hover:bg-white/10' 
                             : 'bg-amber-400 border-amber-400 text-amber-950 hover:bg-amber-300 shadow-md shadow-amber-400/20'
                         }`}
                    >
                         {vipLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isVip ? (
                             <><ShieldBan className="w-4 h-4" /> Revogar Acesso VIP</>
                         ) : (
                             <><ShieldCheck className="w-4 h-4" /> Conceder Acesso VIP</>
                         ))}
                    </button>
                    {!isVip && (
                        <p className="text-[9px] text-white/60 text-center font-medium mt-3 leading-relaxed">
                            O Acesso VIP libera limite total sem cobranças, ignorando o Stripe.
                        </p>
                    )}
                </div>
             </div>
        </div>
      </div>

      {/* Modern Confirmation Modal */}
      {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      isSuspended ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                      {isSuspended ? <ShieldCheck className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                  </div>
                  
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                      {isSuspended ? 'Reativar Workspace?' : 'Suspender Workspace?'}
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-8 leading-relaxed">
                      {isSuspended 
                          ? `Deseja reativar o acesso de ${data.name}? Todos os agentes poderão logar novamente no sistema imediatamente.`
                          : `Você está prestes a suspender ${data.name}. Isso bloqueará o acesso de todos os agentes do workspace até que seja reativado.`}
                  </p>
                  
                  <div className="flex flex-col gap-3 font-bold">
                      <button 
                          onClick={handleToggleStatus} 
                          className={`w-full py-4 text-white rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer uppercase tracking-widest text-xs font-black ${
                              isSuspended 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                          }`}
                      >
                          {isSuspended ? 'Confirmar Reativação' : 'Confirmar Suspensão'}
                      </button>
                      <button 
                          onClick={() => setShowConfirmModal(false)} 
                          className="w-full py-4 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer uppercase tracking-widest text-xs font-black"
                      >
                          Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* VIP Confirmation Modal */}
      {showVipModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${
                      !isVip ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400'
                  }`}>
                      <Gift className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                      {!isVip ? 'Conceder Acesso VIP?' : 'Revogar Acesso VIP?' }
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-8 leading-relaxed">
                      {!isVip 
                          ? `Dar acesso VIP ao ${data.name} significa que a agência deles poderá usar o CRM gratuitamente sem sofrer restrições de pagamento.`
                          : `Revogar significa que eles entrarão no sistema de cobrança padrão e o acesso pode ser bloqueado se não pagarem.`}
                  </p>
                  
                  <div className="flex flex-col gap-3 font-bold">
                      <button 
                          onClick={handleToggleVip} 
                          className={`w-full py-4 text-white rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer uppercase tracking-widest text-xs font-black ${
                              !isVip 
                                  ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20' 
                                  : 'bg-zinc-800 hover:bg-zinc-700 shadow-zinc-800/20'
                          }`}
                      >
                          {!isVip ? 'Confirmar Acesso VIP' : 'Confirmar Revogação'}
                      </button>
                      <button 
                          onClick={() => setShowVipModal(false)} 
                          className="w-full py-4 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer uppercase tracking-widest text-xs font-black"
                      >
                          Cancelar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}
