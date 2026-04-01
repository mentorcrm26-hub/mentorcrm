'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { toggleTenantStatus, dangerouslyClearAllClients, createVipClient } from './actions'
import { Search, ShieldBan, ShieldCheck, Loader2, Users, ChevronRight, Activity, AlertCircle, Trash2, UserPlus, Star } from 'lucide-react'

const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(new Date(isoString))
}

export function ClientesClient({ initialData }: { initialData: any[] }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, tenantId: string, currentStatus: string, tenantName: string } | null>(null)
  const [showClearDbModal, setShowClearDbModal] = useState(false)
  const [showVipModal, setShowVipModal] = useState(false)
  const [vipForm, setVipForm] = useState({ email: '', full_name: '', plan: 'agent' as 'agent' | 'agent_annual' | 'team' })
  const [isCreatingVip, setIsCreatingVip] = useState(false)

  const handleToggleStatusRequest = (tenantId: string, currentStatus: string, tenantName: string) => {
    setConfirmModal({
      isOpen: true,
      tenantId,
      currentStatus,
      tenantName
    })
  }

  const executeToggleStatus = async () => {
    if (!confirmModal) return
    const { tenantId, currentStatus } = confirmModal
    const isSuspended = currentStatus === 'suspended'
    
    setConfirmModal(null)
    setLoadingId(tenantId)
    const res = await toggleTenantStatus(tenantId, currentStatus)
    setLoadingId(null)
    
    if (res.success) {
        toast.success(isSuspended ? 'Workspace Reativado com Sucesso!' : 'Workspace Suspenso.')
        router.refresh()
    } else {
        toast.error(res.error || 'Erro ao alterar status')
    }
  }

  const handleClearDatabase = async () => {
    setIsClearing(true)
    setShowClearDbModal(false)
    const res = await dangerouslyClearAllClients()
    setIsClearing(false)
    
    if (res.success) {
        toast.success(res.message || 'Limpeza concluída!')
        router.refresh()
    } else {
        toast.error(res.error || 'Erro ao limpar banco de dados')
    }
  }

  const handleCreateVip = async () => {
    if (!vipForm.email) return
    setIsCreatingVip(true)
    const res = await createVipClient(vipForm)
    setIsCreatingVip(false)
    if (res.success) {
      toast.success('Cliente VIP criado! Email de convite enviado.')
      setShowVipModal(false)
      setVipForm({ email: '', full_name: '', plan: 'agent' })
      router.refresh()
    } else {
      toast.error(res.error || 'Erro ao criar cliente VIP')
    }
  }

  const filteredTenants = initialData.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.users?.some((u: any) => u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-400 group-focus-within:text-rose-500 transition-colors">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome do workspace ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/50 transition-all font-medium text-zinc-900 dark:text-zinc-100 shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVipModal(true)}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 px-4 py-2.5 rounded-xl border border-amber-200 dark:border-amber-900/30 transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <Star className="w-4 h-4" />
            Criar Cliente VIP
          </button>

          <button
            onClick={() => setShowClearDbModal(true)}
            disabled={isClearing}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-900/30 transition-all active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Limpar Base de Dados
          </button>

          <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 bg-white dark:bg-zinc-900/50 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/5 shadow-sm">
            <Activity className="w-4 h-4 text-rose-500" />
            Total: <span className="text-zinc-900 dark:text-white">{filteredTenants.length} Workspaces</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-xs text-zinc-500 uppercase font-bold tracking-wider border-b border-zinc-200 dark:border-white/5">
              <tr>
                <th scope="col" className="px-6 py-4">Workspace / Dono</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-center">Plano</th>
                <th scope="col" className="px-6 py-4">Usuários</th>
                <th scope="col" className="px-6 py-4">Criação</th>
                <th scope="col" className="px-6 py-4 text-right border-l border-zinc-100 dark:border-white/5">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 mx-auto max-w-sm">
                        <Search className="w-8 h-8 text-zinc-400 mb-3" />
                        <p className="text-zinc-500 font-medium">Nenhum workspace ou cliente encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const isSuspended = tenant.status === 'suspended'
                  const adminUser = tenant.users?.find((u: any) => u.role === 'admin') || tenant.users?.[0]
                  const Initials = tenant.name ? tenant.name.substring(0, 2).toUpperCase() : 'WS'

                  return (
                    <tr 
                      key={tenant.id} 
                      className={`group transition-all duration-200 ${
                        isSuspended 
                          ? 'bg-red-50/30 dark:bg-red-950/20 hover:bg-red-50/50 dark:hover:bg-red-950/30' 
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSuspended 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' 
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                          }`}>
                              {Initials}
                          </div>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {tenant.name || 'Workspace Sem Nome'}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5 max-w-[200px] truncate">
                              {adminUser?.email || 'Sem dono atribuído'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isSuspended 
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                          {isSuspended ? 'Suspenso' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                          tenant.is_vip 
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' 
                            : 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10'
                        }`}>
                          {tenant.is_vip ? '★ VIP' : (
                            tenant.plan === 'agent' ? 'Solo' : 
                            tenant.plan === 'agent_annual' ? 'Solo Anual' : 
                            tenant.plan === 'team' ? 'Team' : 
                            tenant.plan === 'sandbox' ? 'Sandbox' : 
                            tenant.plan || 'Sandbox'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                          <div className="p-1 px-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] flex items-center gap-1.5">
                             <Users className="w-3 h-3 text-zinc-400" />
                             {tenant.users?.length || 0}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[11px] font-medium text-zinc-500">
                         {tenant.created_at ? formatDate(tenant.created_at) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right border-l border-zinc-100 dark:border-white/5">
                        <div className="flex items-center justify-end gap-2">
                           <button 
                            onClick={() => handleToggleStatusRequest(tenant.id, tenant.status, tenant.name)}
                            disabled={loadingId === tenant.id}
                            title={isSuspended ? "Reativar" : "Suspender"}
                            className={`p-2 rounded-lg border transition-all active:scale-95 cursor-pointer ${
                              isSuspended 
                                ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/30 dark:hover:bg-emerald-900/20' 
                                : 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20'
                            }`}
                          >
                            {loadingId === tenant.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSuspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />)}
                          </button>
                          
                          <button 
                            onClick={() => router.push(`/admin/clientes/${tenant.id}`)}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-white/5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
                          >
                             <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create VIP Client Modal */}
      {showVipModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">Criar Cliente VIP</h3>
                <p className="text-xs text-zinc-500 font-medium">Acesso sem pagamento · Status VIP Ativo</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="cliente@email.com"
                  value={vipForm.email}
                  onChange={e => setVipForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Nome do cliente (opcional)"
                  value={vipForm.full_name}
                  onChange={e => setVipForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Plano
                </label>
                <select
                  value={vipForm.plan}
                  onChange={e => setVipForm(f => ({ ...f, plan: e.target.value as any }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                >
                  <option value="agent">Agent Solo (Mensal)</option>
                  <option value="agent_annual">Agent Solo (Anual)</option>
                  <option value="team">Team / Agency</option>
                </select>
              </div>

              <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-xl p-3">
                <Star className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  O cliente receberá um email de convite para criar sua senha e acessar o dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowVipModal(false); setVipForm({ email: '', full_name: '', plan: 'agent' }) }}
                disabled={isCreatingVip}
                className="flex-1 py-3 text-sm font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateVip}
                disabled={isCreatingVip || !vipForm.email}
                className="flex-1 py-3 text-sm font-black text-white bg-amber-500 hover:bg-amber-400 rounded-2xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingVip ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Criar & Enviar Convite</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {confirmModal?.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-6 rounded-3xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                      confirmModal.currentStatus === 'suspended' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                      {confirmModal.currentStatus === 'suspended' ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white mb-2">
                      {confirmModal.currentStatus === 'suspended' ? 'Reativar Workspace?' : 'Suspender Workspace?'}
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-6 leading-relaxed">
                      {confirmModal.currentStatus === 'suspended' 
                          ? `Deseja reativar o acesso de ${confirmModal.tenantName}? O Proprietário e os agentes poderão logar novamente.`
                          : `CUIDADO: Ao suspender ${confirmModal.tenantName}, todos os agentes deste workspace perderão acesso imediatamente. Continuar?`}
                  </p>
                  
                  <div className="flex gap-3 justify-end font-bold">
                      <button 
                          onClick={() => setConfirmModal(null)} 
                          className="px-5 py-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer active:scale-95"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={executeToggleStatus} 
                          className={`px-5 py-2.5 text-white rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer ${
                              confirmModal.currentStatus === 'suspended' 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                                  : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                          }`}
                      >
                          Confirmar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* DANGEROUS: Clear Database Modal */}
      {showClearDbModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-900/30 p-8 rounded-[2.5rem] shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-500 flex items-center justify-center mx-auto mb-6 border-2 border-red-100 dark:border-red-900/20">
                      <Trash2 className="w-10 h-10" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-4 tracking-tight">
                      Limpar Base de Dados?
                  </h3>
                  
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-8 leading-relaxed px-4">
                      Esta ação irá <span className="text-red-600 dark:text-red-400 font-black">REMOVER PERMANENTEMENTE</span> todos os clientes, agentes, leads e configurações do sistema. <br/><br/>
                      <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded font-bold">Apenas os Super Administradores serão mantidos.</span>
                  </p>
                  
                  <div className="flex flex-col gap-3 font-bold">
                      <button 
                          onClick={handleClearDatabase} 
                          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl transition-all shadow-xl shadow-red-600/20 active:scale-95 cursor-pointer uppercase tracking-widest text-xs font-black"
                      >
                          Sim, Limpar Tudo Agora
                      </button>
                      <button 
                          onClick={() => setShowClearDbModal(false)} 
                          className="w-full py-4 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-2xl transition-colors cursor-pointer uppercase tracking-widest text-xs font-black"
                      >
                          Cancelar e Manter Dados
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  )
}
