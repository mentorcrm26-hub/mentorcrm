'use client'

import { useState, useEffect } from 'react'
import { getStripeBalance, getLatestPayments, issueRefund, requestPayout, createStripePrice, getActiveSubscriptions, cancelStripeSubscription, generatePaymentLink } from './actions'
import { Loader2, DollarSign, ArrowRightLeft, AlertCircle, RefreshCcw, Banknote, CreditCard, Link, Pencil, UsersRound, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export function StripeClient({ productData }: { productData: any[] }) {
    const [balance, setBalance] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])
    const [subscriptions, setSubscriptions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [refundModal, setRefundModal] = useState<{ isOpen: boolean, chargeId: string, amount: number } | null>(null)
    const [payoutModal, setPayoutModal] = useState(false)
    const [payoutAmount, setPayoutAmount] = useState('')

    const [priceModal, setPriceModal] = useState<{isOpen: boolean, productId: string, productName: string} | null>(null)
    const [newPrice, setNewPrice] = useState('')
    const [newInterval, setNewInterval] = useState<'month'|'year'>('month')

    const fetchDashboard = async () => {
        setLoading(true)
        const [balRes, payRes, subRes] = await Promise.all([
            getStripeBalance(),
            getLatestPayments(15),
            getActiveSubscriptions(20)
        ])
        if (balRes.success) setBalance(balRes.data)
        if (payRes.success) setPayments(payRes.data)
        if (subRes.success) setSubscriptions(subRes.data)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboard()
    }, [])

    const executeRefund = async () => {
        if (!refundModal) return
        const { chargeId, amount } = refundModal
        setRefundModal(null)
        
        toast.promise(issueRefund(chargeId), {
            loading: 'Processando Estorno no Stripe...',
            success: (d) => {
                fetchDashboard()
                return 'Estorno Processado com Sucesso!'
            },
            error: (e) => `Falha no estorno: ${e.message}`,
        })
    }

    const executePayout = async () => {
        const amountNum = parseFloat(payoutAmount)
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Valor Inválido para Saque')
            return
        }
        
        setPayoutModal(false)
        setPayoutAmount('')
        
        const cents = Math.round(amountNum * 100)
        toast.promise(requestPayout(cents), {
            loading: 'Solicitando Saque (Payout) na Stripe...',
            success: () => 'Saque Efetuado! Dependendo do banco cai em até 2 dias úteis.',
            error: (e) => `Falha ao solicitar saque: ${e}`
        })
    }

    const handleGenerateLink = async (priceId: string) => {
        const res = await generatePaymentLink(priceId)
        if (res.success && res.data) {
            navigator.clipboard.writeText(res.data)
            toast.success('Link de Pagamento copiado para a Área de Transferência!')
        } else {
            toast.error('Falha ao gerar link: ' + res.error)
        }
    }

    const handleCreatePrice = async () => {
        if (!priceModal) return
        const amt = parseFloat(newPrice)
        if (isNaN(amt) || amt <= 0) return toast.error('Valor inválido')
        const cents = Math.round(amt * 100)
        
        toast.promise(createStripePrice(priceModal.productId, cents, newInterval), {
            loading: 'Substituindo valor padrão do Produto na Stripe...',
            success: () => {
                setPriceModal(null)
                setNewPrice('')
                return 'Preço criado e atualizado. A Landing Page e Checkouts já assumiram o novo valor!'
            },
            error: (e) => `Falha: ${e}`
        })
    }

    const handleCancelSub = async (subId: string) => {
        if (!confirm('Cortar a Assinatura agora? O cliente perderá acesso na próxima cobrança imediatamente.')) return
        toast.promise(cancelStripeSubscription(subId), {
            loading: 'Inativando Assinatura na Stripe...',
            success: () => {
                fetchDashboard()
                return 'Assinatura cancelada com sucesso.'
            },
            error: (e) => `Erro ao cancelar: ${e}`
        })
    }

    // Format currency USD function
    const formatUSD = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 text-rose-500 animate-spin" /></div>
    }

    const availableUSD = balance?.available?.find((b: any) => b.currency === 'usd')?.amount || 0
    const pendingUSD = balance?.pending?.find((b: any) => b.currency === 'usd')?.amount || 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Balance Widget */}
            <div className="bg-gradient-to-br from-zinc-900 to-black dark:border-white/10 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <DollarSign className="w-48 h-48 -rotate-12" />
                </div>
                
                <h2 className="text-zinc-400 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Conta Stripe & Saques
                </h2>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div>
                        <p className="text-zinc-400 font-medium mb-1">Saldo Disponível para Saque</p>
                        <h3 className="text-5xl font-black tracking-tighter text-emerald-400">{formatUSD(availableUSD)}</h3>
                        
                        <div className="flex items-center gap-2 mt-4 text-sm font-semibold bg-zinc-800/50 w-fit px-3 py-1.5 rounded-lg border border-zinc-700/50 text-amber-400">
                            <ClockIcon className="w-4 h-4" />
                            Pendente em transito: {formatUSD(pendingUSD)}
                        </div>
                    </div>

                    <button 
                        onClick={() => setPayoutModal(true)}
                        disabled={availableUSD <= 0}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 w-fit cursor-pointer"
                    >
                        Solicitar Saque <ArrowRightLeft className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latests Payments (Logs & Refunds) */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-500" /> Histórico & Reembolsos
                        </h3>
                        <button onClick={fetchDashboard} className="p-2 text-zinc-500 hover:text-rose-500 transition-colors">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {payments.length === 0 ? (
                            <p className="text-sm font-medium text-zinc-500 italic">Nenhum pagamento encontrado ou falha de acesso à API Stripe.</p>
                        ) : (
                            payments.map((p) => (
                                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <strong className="text-zinc-900 dark:text-white font-extrabold">{formatUSD(p.amount)}</strong>
                                            {p.status === 'succeeded' ? (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-900/20">Aprovado</span>
                                            ) : p.status === 'failed' ? (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-900/20">Falhou</span>
                                            ) : (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800">Pendente</span>
                                            )}
                                            {p.refunded && (
                                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900/50 dark:bg-purple-900/20">Estornado</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 font-medium">{p.receipt_email || 'Email Desconhecido'} - {new Date(p.created * 1000).toLocaleString()}</p>
                                        {p.failure_message && (
                                            <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                                <AlertCircle className="w-3 h-3" /> {p.failure_message}
                                            </p>
                                        )}
                                    </div>

                                    {!p.refunded && p.status === 'succeeded' && (
                                        <button 
                                            onClick={() => setRefundModal({ isOpen: true, chargeId: p.id, amount: p.amount })}
                                            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors w-fit sm:w-auto cursor-pointer"
                                        >
                                            Estornar (Refund)
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Products Viewer */}
                <div className="bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm h-fit">
                    <h3 className="font-bold text-lg dark:text-white mb-6">Seus Produtos na Stripe</h3>
                    <div className="space-y-6">
                        {productData.length === 0 ? (
                            <p className="text-sm font-medium text-zinc-500 italic">Você ainda não tem produtos ou API Stripe desconfigurada.</p>
                        ) : (
                            productData.map((prod) => (
                                <div key={prod.id} className="pb-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-zinc-900 dark:text-white">{prod.name}</h4>
                                        <button onClick={() => setPriceModal({ isOpen:true, productId: prod.id, productName: prod.name })} className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 flex items-center gap-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                            <Pencil className="w-3 h-3" /> Alterar Valor Padrão
                                        </button>
                                    </div>
                                    <ul className="space-y-2">
                                        {prod.prices.map((price: any) => (
                                            <li key={price.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    <strong className="text-zinc-900 dark:text-white text-base">
                                                        {formatUSD(price.amount)} <span className="text-zinc-400 text-xs font-medium">/{price.interval || 'único'}</span>
                                                    </strong>
                                                </div>
                                                <button onClick={() => handleGenerateLink(price.id)} className="flex items-center gap-2 text-xs font-bold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition cursor-pointer">
                                                    <Link className="w-3 h-3" /> Copiar Link Venda
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Subscriptions */}
                <div className="lg:col-span-3 bg-white dark:bg-zinc-950 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-lg dark:text-white mb-6 flex items-center gap-2">
                        <UsersRound className="w-5 h-5 text-emerald-500" /> Assinaturas Ativas
                        <span className="ml-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">{subscriptions.length} Ativos</span>
                    </h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-800 text-sm font-bold text-zinc-500">
                                    <th className="pb-3 pl-2">Cliente</th>
                                    <th className="pb-3">Valor / Ciclo</th>
                                    <th className="pb-3">Renovação</th>
                                    <th className="pb-3">Ações (Kill-Switch)</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {subscriptions.map(sub => (
                                    <tr key={sub.id} className="border-b border-zinc-50 dark:border-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors">
                                        <td className="py-4 pl-2 font-medium text-zinc-900 dark:text-zinc-200">
                                            {sub.customer_email}
                                            {sub.cancel_at_period_end && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-bold uppercase tracking-widest">Cancela no Fim</span>}
                                        </td>
                                        <td className="py-4 font-bold text-zinc-700 dark:text-zinc-400">
                                            {formatUSD(sub.amount)} <span className="font-normal text-xs text-zinc-400">/{sub.interval}</span>
                                        </td>
                                        <td className="py-4 text-zinc-500">
                                            {sub.current_period_end 
                                                ? new Date(sub.current_period_end * 1000).toLocaleDateString()
                                                : sub.created ? new Date(sub.created * 1000).toLocaleDateString() : '--/--/----'}
                                        </td>
                                        <td className="py-4">
                                            {!sub.cancel_at_period_end && (
                                                <button onClick={() => handleCancelSub(sub.id)} className="text-xs flex items-center gap-1 font-bold text-red-500 hover:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded cursor-pointer transition-colors border border-red-200 dark:border-red-900/30" title="Aviso: Estornar um pagamento na Stripe não cancela a assinatura ativa automaticamente. Você precisa Cortar o Acesso aqui.">
                                                    <XCircle className="w-3 h-3" /> Cortar Acesso
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {subscriptions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-zinc-500 font-medium italic">Nenhuma assinatura ativa retornada pela base da Stripe.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Refund Modal */}
            {refundModal?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-6 h-6" /> Confirmar Estorno
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-6">
                            Tem certeza que deseja REEMBOLSAR <strong>{formatUSD(refundModal.amount)}</strong> e devolver ao cliente na Stripe? Essa ação é irreversível.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setRefundModal(null)} className="px-4 py-2 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                            <button onClick={executeRefund} className="px-4 py-2 font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-md shadow-red-500/20 active:scale-95 cursor-pointer">Sim, Estornar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payout Modal */}
            {payoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mb-2 flex items-center gap-2">
                            <ArrowRightLeft className="w-6 h-6" /> Solicitar Saque
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-4">
                            Quanto deseja sacar (em Dólares)? O valor irá para sua conta bancária conectada na Stripe.
                        </p>
                        <input 
                            type="number" 
                            step="0.01"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            placeholder="Ex: 150.00"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 mb-6"
                        />
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setPayoutModal(false)} className="px-4 py-2 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                            <button onClick={executePayout} className="px-4 py-2 font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer">Confirmar Saque</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Edit Modal */}
            {priceModal?.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-500 mb-2 flex items-center gap-2">
                            <Pencil className="w-6 h-6" /> Novo Preço: {priceModal.productName}
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium mb-4">
                            Digite o novo valor. A Stripe criará uma nova etiqueta de cobrança e aplicará como default.
                        </p>
                        <div className="flex gap-2 mb-4">
                            <input 
                                type="number" step="0.01"
                                value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                                placeholder="Ex: 50.00"
                                className="w-2/3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                            />
                            <select 
                                value={newInterval} onChange={(e: any) => setNewInterval(e.target.value)}
                                className="w-1/3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-3 font-bold focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="month">Mês</option>
                                <option value="year">Ano</option>
                            </select>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setPriceModal(null)} className="px-4 py-2 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                            <button onClick={handleCreatePrice} className="px-4 py-2 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer">Salvar Preço</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ClockIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  )
}
