'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState } from 'react'
import { updateAdminSettings } from './actions'
import { toast } from 'sonner'
import { Server, Key, Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface Setting {
    id: string
    key_name: string
    key_value: string
}

export function EvolutionSettingsForm({ initialSettings }: { initialSettings: Setting[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [values, setValues] = useState({
        apiUrl: initialSettings.find(s => s.id === 'evolution_api_url')?.key_value || '',
        apiKey: initialSettings.find(s => s.id === 'evolution_api_key')?.key_value || '',
        globalInstance: initialSettings.find(s => s.id === 'evolution_global_instance')?.key_value || 'Global'
    })

    const handleSave = async () => {
        setIsSubmitting(true)
        const toastId = toast.loading('Salvando configurações globais...')

        const data = [
            { id: 'evolution_api_url', key_name: 'WhatsApp Gateway URL', key_value: values.apiUrl },
            { id: 'evolution_api_key', key_name: 'WhatsApp Gateway API Key', key_value: values.apiKey },
            { id: 'evolution_global_instance', key_name: 'WhatsApp Default Channel', key_value: values.globalInstance }
        ]

        const res = await updateAdminSettings(data)

        if (res.success) {
            toast.success('Configurações de WhatsApp salvas com sucesso!', { id: toastId })
        } else {
            toast.error(res.error || 'Erro ao salvar configurações', { id: toastId })
        }
        setIsSubmitting(false)
    }

    return (
        <div className="grid gap-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">WhatsApp Gateway</h3>
                            <p className="text-sm text-zinc-500 font-medium">Configure as credenciais globais para envio de mensagens automáticas.</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Server className="w-4 h-4 text-zinc-400" /> API Base URL
                            </label>
                            <input
                                value={values.apiUrl}
                                onChange={(e) => setValues(prev => ({ ...prev, apiUrl: e.target.value }))}
                                placeholder="https://api.evolution.com"
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Key className="w-4 h-4 text-zinc-400" /> Global API Key
                            </label>
                            <input
                                type="password"
                                value={values.apiKey}
                                onChange={(e) => setValues(prev => ({ ...prev, apiKey: e.target.value }))}
                                placeholder="••••••••••••••••"
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-zinc-400" /> WhatsApp Channel Name
                            </label>
                            <input
                                value={values.globalInstance}
                                onChange={(e) => setValues(prev => ({ ...prev, globalInstance: e.target.value }))}
                                placeholder="Global"
                                className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Aviso de Segurança</p>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium leading-relaxed">
                                Estas credenciais dão acesso total ao seu servidor de WhatsApp. Elas são compartilhadas por todos os usuários do sistema para os disparos inteligentes agendados.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95"
                    >
                        {isSubmitting ? 'Salvando...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Salvar Credenciais
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
