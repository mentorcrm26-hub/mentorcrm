/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, CheckCircle2, Trash2, X, Plus, QrCode, RefreshCw, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { createWhatsAppInstance, getWhatsAppQRCode, checkWhatsAppStatus, disconnectWhatsApp } from './whatsapp-actions'

export function WhatsAppIntegrationCard({ 
    initialData 
}: { 
    initialData?: any 
}) {
    const [integration, setIntegration] = useState(initialData)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isQRModalOpen, setIsQRModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [pollingActive, setPollingActive] = useState(false)
    const [isConfirmDisconnectOpen, setIsConfirmDisconnectOpen] = useState(false)

    // Form inputs
    const [name, setName] = useState('')
    const [number, setNumber] = useState('')

    const isConnected = integration?.credentials?.status === 'connected'

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (pollingActive && integration?.credentials?.instanceName) {
            interval = setInterval(async () => {
                const res = await checkWhatsAppStatus(integration.credentials.instanceName)
                if (res.success && res.state === 'open') {
                    setIntegration((prev: any) => ({
                        ...prev,
                        credentials: { ...prev.credentials, status: 'connected' }
                    }))
                    setPollingActive(false)
                    setIsQRModalOpen(false)
                    toast.success('WhatsApp connected successfully!')
                }
            }, 5000)
        }
        return () => clearInterval(interval)
    }, [pollingActive, integration])

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const res = await createWhatsAppInstance(name, number)
        setIsLoading(false)

        if (res.success) {
            setIntegration({ credentials: res.data })
            setIsCreateModalOpen(false)
            toast.success('Connection configured! Now open WhatsApp and scan the QR code.')
            handleGetQR(res.data.instanceName)
        } else {
            toast.error(res.error || 'Erro ao criar conexão')
        }
    }

    const handleGetQR = async (instanceName: string) => {
        setIsLoading(true)
        const res = await getWhatsAppQRCode(instanceName)
        setIsLoading(false)

        if (res.success) {
            setQrCode(res.qrcode)
            setIsQRModalOpen(true)
            setPollingActive(true)
        } else {
            toast.error(res.error || 'Failed to get QR Code')
        }
    }

    const handleDisconnect = async () => {
        setIsConfirmDisconnectOpen(false)
        setIsLoading(true)
        const res = await disconnectWhatsApp(integration.credentials.instanceName)
        setIsLoading(false)

        if (res.success) {
            setIntegration(null)
            toast.success('WhatsApp disconnected')
        } else {
            toast.error(res.error || 'Failed to disconnect')
        }
    }

    return (
        <>
            <div className="bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm group hover:border-emerald-500/30 transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    {isConnected ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            Disconnected
                        </span>
                    )}
                </div>
                <div className="flex flex-col flex-1">
                    <div className="mb-6">
                        <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">WhatsApp Automation</h4>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {isConnected 
                                ? `Connected to account ${integration?.credentials?.instanceName}`
                                : 'Connect your own WhatsApp number to send automated messages.'}
                        </p>
                    </div>

                    <div className="mt-auto space-y-2">
                        {isConnected ? (
                            <button
                                onClick={() => setIsConfirmDisconnectOpen(true)}
                                disabled={isLoading}
                                className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-900/50 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 h-10 px-4 py-2 gap-2 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4" /> Disconnect
                            </button>
                        ) : integration ? (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleGetQR(integration.credentials.instanceName)}
                                    disabled={isLoading}
                                    className="flex-1 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 h-10 px-4 py-2 gap-2 cursor-pointer"
                                >
                                    <QrCode className="w-4 h-4" /> Scan QR
                                </button>
                                <button
                                    onClick={() => setIsConfirmDisconnectOpen(true)}
                                    disabled={isLoading}
                                    title="Cancel Connection Setup"
                                    className="inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium transition-colors border border-red-200 dark:border-red-900/50 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 h-10 w-10 px-0 py-0 flex-col cursor-pointer"
                                >
                                    <Trash2 className="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 h-10 px-4 py-2 gap-2 cursor-pointer"
                            >
                                <Plus className="w-4 h-4" /> Connect WhatsApp
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Instance Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                        <div className="flex justify-between items-center p-5 border-b border-zinc-100 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">New WhatsApp Connection</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Account Name</label>
                                <input 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
                                    placeholder="ex: My WhatsApp Business"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">WhatsApp Number</label>
                                <input 
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm"
                                    placeholder="ex: 4077473001"
                                    value={number}
                                    onChange={e => setNumber(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-zinc-500">Note: Use digits only. The US country code (+1) will be added automatically to 10-digit numbers.</p>
                            </div>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {isLoading ? 'Connecting...' : 'Connect Now'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {isQRModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-8 text-center space-y-6">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">Connect your Phone</h2>
                            <button onClick={() => { setIsQRModalOpen(false); setPollingActive(false); }} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer">
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

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-left bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-bold">Instructions:</p>
                                    <p className="text-xs text-zinc-500">1. Open WhatsApp on your phone</p>
                                    <p className="text-xs text-zinc-500">2. Tap on Linked Devices</p>
                                    <p className="text-xs text-zinc-500">3. Point the camera at this code</p>
                                </div>
                            </div>
                            
                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold animate-pulse">
                                Waiting for connection...
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Disconnect Modal */}
            {isConfirmDisconnectOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-8 text-center animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mx-auto mb-6 shadow-sm border border-red-200 dark:border-red-800">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Disconnect WhatsApp?</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Are you sure you want to disable WhatsApp integration? Scheduled messages and real-time sync will stop immediately.
                        </p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleDisconnect}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white rounded-2xl py-3.5 text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Yes, Disconnect'}
                            </button>
                            <button 
                                onClick={() => setIsConfirmDisconnectOpen(false)}
                                disabled={isLoading}
                                className="w-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-bold py-3 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
