'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { submitTeamContact } from './actions'

export function TeamContactForm() {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const form = e.currentTarget
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
            team_size: (form.elements.namedItem('team_size') as HTMLSelectElement).value,
            message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
        }

        const res = await submitTeamContact(data)
        setLoading(false)

        if (res.success) {
            setSuccess(true)
        } else {
            setError(res.error || 'Erro ao enviar. Tente novamente.')
        }
    }

    if (success) {
        return (
            <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto" />
                <p className="text-white font-display font-black text-lg tracking-tight">
                    Solicitação Enviada!
                </p>
                <p className="text-white/40 text-xs font-display font-black uppercase tracking-widest">
                    Nossa equipe entrará em contato em até 24h para configurar seu workspace Team.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
                <p className="text-xs font-display font-black uppercase tracking-widest text-white/40">
                    Preencha o formulário e nossa equipe entra em contato em até 24h.
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 font-display font-black uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    Nome Completo
                </label>
                <input
                    name="name"
                    required
                    placeholder="Seu nome"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors"
                />
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    Email Profissional
                </label>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder="voce@agencia.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors"
                />
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    WhatsApp / Telefone
                </label>
                <input
                    name="phone"
                    required
                    placeholder="(XXX) XXX-XXXX"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors"
                />
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    Tamanho da Equipe
                </label>
                <select
                    name="team_size"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white focus:outline-none focus:border-brand-400 transition-colors"
                >
                    <option value="" className="bg-brand-900">Selecione...</option>
                    <option value="2-3" className="bg-brand-900">2–3 agentes</option>
                    <option value="4-6" className="bg-brand-900">4–6 agentes</option>
                    <option value="7-10" className="bg-brand-900">7–10 agentes</option>
                    <option value="10+" className="bg-brand-900">Mais de 10 agentes</option>
                </select>
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    Mensagem (opcional)
                </label>
                <textarea
                    name="message"
                    rows={3}
                    placeholder="Conte um pouco sobre sua agência ou necessidade..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-full text-xs font-display font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(0,112,204,0.5)] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                ) : (
                    <>Solicitar Acesso Team <ArrowRight className="w-4 h-4" /></>
                )}
            </button>
        </form>
    )
}
