'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle2, Trash2, X, Plus, QrCode, RefreshCw, Smartphone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    createAdminWhatsAppInstance,
    getAdminWhatsAppQRCode,
    checkAdminWhatsAppStatus,
    disconnectAdminWhatsApp,
} from './actions'

export function AdminWhatsAppCard({ initialData }: { initialData: any | null }) {
    const [integration, setIntegration] = useState(initialData)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [isConfirmDisconnectOpen, setIsConfirmDisconnectOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [pollingActive, setPollingActive] = useState(false)
    const [name, setName] = useState('')
    const [number, setNumber] = useState('')

    const isConnected = integration?.status === 'connected'

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (pollingActive && integration?.instanceName) {
            interval = setInterval(async () => {
                const res = await checkAdminWhatsAppStatus(integration.instanceName)
                if (res.success && res.state === 'open') {
                    setIntegration((prev: any) => ({ ...prev, status: 'connected' }))
                    setPollingActive(false)
                    setIsQRModalOpen(false)
                    toast.success('WhatsApp do admin conectado!')
                }
            }, 5000)
        }
        return () => clearInterval(interval)
    }, [pollingActive, integration])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const res = await createAdminWhatsAppInstance(name, number)
        setIsLoading(false)
        if (res.success && res.data) {
            setIntegration(res.data)
            setIsCreateModalOpen(false)
            toast.success('Conexão configurada! Escaneie o QR code.')
            handleGetQR(res.data.instanceName)
        } else {
            toast.error(res.error || 'Erro ao criar conexão')
        }
    }

    const handleGetQR = async (instanceName: string) => {
        setIsLoading(true)
        const res = await getAdminWhatsAppQRCode(instanceName)
        setIsLoading(false)
        if (res.success) {
            setQrCode(res.qrcode ?? null)
            setIsQRModalOpen(true)
            setPollingActive(true)
        } else {
            toast.error(res.error || 'Erro ao obter QR Code')
        }
    }

    const handleDisconnect = async () => {
        setIsConfirmDisconnectOpen(false)
        setIsLoading(true)
        const res = await disconnectAdminWhatsApp(integration.instanceName)
        setIsLoading(false)
        if (res.success) {
            setIntegration(null)
            toast.success('WhatsApp desconectado')
        } else {
            toast.error(res.error || 'Erro ao desconectar')
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 shrink-0">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-white">WhatsApp do Admin</h3>
                            <p className="text-xs text-zinc-500">
                                {isConnected
                                    ? `Conectado · ${integration?.instanceName}`
                                    : integration
                                    ? 'Aguardando conexão...'
                                    : 'Nenhuma instância configurada'}
                            </p>
                        </div>
                    </div>
                    {isConnected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Conectado
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Desconectado
                        </span>
                    )}
                </div>

                <p className="text-sm text-zinc-500 mb-5">
                    Conecte o seu WhatsApp pessoal ou comercial. O sistema enviará notificações automáticas toda vez que uma nova solicitação do plano Team chegar.
                </p>

                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <button
                            onClick={() => setIsConfirmDisconnectOpen(true)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" /> Desconectar
                        </button>
                    ) : integration ? (
                        <>
                            <button
                                onClick={() => handleGetQR(integration.instanceName)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                                Escanear QR
                            </button>
                            <button
                                onClick={() => setIsConfirmDisconnectOpen(true)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" /> Conectar WhatsApp
                        </button>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Nova Conexão WhatsApp</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nome da Instância</label>
                                <input
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/50"
                                    placeholder="ex: Admin Mentor CRM"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Número do WhatsApp</label>
                                <input
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-500/50"
                                    placeholder="ex: 4077473001"
                                    value={number}
                                    onChange={e => setNumber(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-zinc-400">Apenas dígitos. O código +1 será adicionado automaticamente a números de 10 dígitos.</p>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Conectando...</> : 'Conectar Agora'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            {isQRModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Conectar WhatsApp</h2>
                            <button onClick={() => { setIsQRModalOpen(false); setPollingActive(false) }} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-3xl inline-block border-8 border-zinc-100 dark:border-zinc-900">
                            {qrCode ? (
                                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
                            ) : (
                                <div className="w-64 h-64 flex items-center justify-center">
                                    <RefreshCw className="w-10 h-10 animate-spin text-zinc-300" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-3 text-left bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                            <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">Instruções:</p>
                                <p className="text-xs text-zinc-500">1. Abra o WhatsApp no seu celular</p>
                                <p className="text-xs text-zinc-500">2. Toque em Dispositivos Conectados</p>
                                <p className="text-xs text-zinc-500">3. Aponte a câmera para este código</p>
                            </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold animate-pulse">
                            Aguardando conexão...
                        </p>
                    </div>
                </div>
            )}

            {/* Confirm Disconnect Modal */}
            {isConfirmDisconnectOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto mb-6">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Desconectar WhatsApp?</h3>
                        <p className="text-sm text-zinc-500 mb-8">As notificações automáticas de novas solicitações Team serão desativadas.</p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sim, Desconectar'}
                            </button>
                            <button
                                onClick={() => setIsConfirmDisconnectOpen(false)}
                                className="text-zinc-500 hover:text-zinc-700 text-sm font-bold py-3 cursor-pointer"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
