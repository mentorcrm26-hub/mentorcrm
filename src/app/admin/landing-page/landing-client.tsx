'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateLandingConfig } from './actions'
import { Save, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export function LandingPageConfigClient({ initialConfig }: { initialConfig: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    plan_agent_name: initialConfig.plan_agent_name || '',
    plan_agent_price: initialConfig.plan_agent_price || '',
    plan_agent_price_yearly: initialConfig.plan_agent_price_yearly || '',
    plan_agent_cta: initialConfig.plan_agent_cta || '',
    plan_agent_features: Array.isArray(initialConfig.plan_agent_features) 
        ? initialConfig.plan_agent_features.join('\n') 
        : '',
    
    plan_team_name: initialConfig.plan_team_name || '',
    plan_team_price: initialConfig.plan_team_price || '',
    plan_team_meta: initialConfig.plan_team_meta || '',
    plan_team_cta: initialConfig.plan_team_cta || '',
    plan_team_features: Array.isArray(initialConfig.plan_team_features) 
        ? initialConfig.plan_team_features.join('\n') 
        : '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    // Tratando as listas de strings (textarea para array JSON)
    const payload = {
      ...formData,
      plan_agent_features: formData.plan_agent_features.split('\n').map((i: string) => i.trim()).filter(Boolean),
      plan_team_features: formData.plan_team_features.split('\n').map((i: string) => i.trim()).filter(Boolean)
    }

    const { success, error } = await updateLandingConfig(payload)
    
    setIsSaving(false)
    if (success) {
      toast.success('Landing page atualizada! As alterações já estão valendo na Home do Site.')
    } else {
      toast.error(error || 'Erro desconhecido ao comunicar com o servidor.')
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      <div className="flex justify-end mb-4">
          <Link target="_blank" href="/" className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-bold transition-all text-sm group">
              <span>Abrir Landing Page</span>
              <ExternalLink className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Agent Plan */}
        <div className="bg-white dark:bg-zinc-950 p-8 border hover:border-indigo-500/50 border-zinc-200 dark:border-white/5 rounded-3xl shadow-sm transition-colors relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            Card: AGENT (Solo)
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nome do Plano</label>
              <input name="plan_agent_name" value={formData.plan_agent_name} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Preço Mensal</label>
                    <input name="plan_agent_price" value={formData.plan_agent_price} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Sufixo / Anual</label>
                    <input name="plan_agent_price_yearly" value={formData.plan_agent_price_yearly} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
                </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Funcionalidades (1 por linha)</label>
              <textarea name="plan_agent_features" rows={6} value={formData.plan_agent_features} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none font-mono" placeholder="Leads Ilimitados&#10;Analytics Avançado" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Texto do Botão (CTA)</label>
              <input name="plan_agent_cta" value={formData.plan_agent_cta} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500/50 outline-none" />
            </div>
          </div>
        </div>

        {/* Team Plan */}
        <div className="bg-white dark:bg-zinc-950 p-8 border hover:border-rose-500/50 border-zinc-200 dark:border-white/5 rounded-3xl shadow-sm transition-colors relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
          
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            Card: TEAM (Agência)
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Nome do Plano</label>
              <input name="plan_team_name" value={formData.plan_team_name} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Preço Mensal</label>
                    <input name="plan_team_price" value={formData.plan_team_price} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-rose-500/50 outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Meta Info (Limites)</label>
                    <input name="plan_team_meta" value={formData.plan_team_meta} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none" />
                </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Funcionalidades (1 por linha)</label>
              <textarea name="plan_team_features" rows={6} value={formData.plan_team_features} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none resize-none font-mono" placeholder="3 Conexões WhatsApp&#10;Gestão de Equipe" />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Texto do Botão (CTA)</label>
              <input name="plan_team_cta" value={formData.plan_team_cta} onChange={handleChange} className="w-full mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500/50 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-8 border-t border-zinc-200 dark:border-white/10">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white px-8 py-4 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-rose-500/20 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Salvando Sincronização...' : 'Salvar Alterações na Landing Page'}
        </button>
      </div>
    </form>
  )
}
