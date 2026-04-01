'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { submitTeamContact } from './actions'

type Locale = 'en' | 'pt' | 'es'

const T = {
    en: {
        intro: 'Fill out the form and our team will get back to you within 24h.',
        labelName: 'Full Name',
        placeholderName: 'Your name',
        labelEmail: 'Professional Email',
        placeholderEmail: 'you@agency.com',
        labelPhone: 'WhatsApp / Phone',
        placeholderPhone: '(XXX) XXX-XXXX',
        labelTeamSize: 'Team Size',
        optionSelect: 'Select...',
        labelMessage: 'Message (optional)',
        placeholderMessage: 'Tell us a bit about your agency or needs...',
        submitBtn: 'Request Team Access',
        sending: 'Sending...',
        successTitle: 'Request Sent!',
        successDesc: 'Our team will reach out within 24h to set up your Team workspace.',
        errorFallback: 'Error sending. Please try again.',
    },
    pt: {
        intro: 'Preencha o formulário e nossa equipe entra em contato em até 24h.',
        labelName: 'Nome Completo',
        placeholderName: 'Seu nome',
        labelEmail: 'Email Profissional',
        placeholderEmail: 'voce@agencia.com',
        labelPhone: 'WhatsApp / Telefone',
        placeholderPhone: '(XXX) XXX-XXXX',
        labelTeamSize: 'Tamanho da Equipe',
        optionSelect: 'Selecione...',
        labelMessage: 'Mensagem (opcional)',
        placeholderMessage: 'Conte um pouco sobre sua agência ou necessidade...',
        submitBtn: 'Solicitar Acesso Team',
        sending: 'Enviando...',
        successTitle: 'Solicitação Enviada!',
        successDesc: 'Nossa equipe entrará em contato em até 24h para configurar seu workspace Team.',
        errorFallback: 'Erro ao enviar. Tente novamente.',
    },
    es: {
        intro: 'Completa el formulario y nuestro equipo te contactará en menos de 24h.',
        labelName: 'Nombre Completo',
        placeholderName: 'Tu nombre',
        labelEmail: 'Email Profesional',
        placeholderEmail: 'tu@agencia.com',
        labelPhone: 'WhatsApp / Teléfono',
        placeholderPhone: '(XXX) XXX-XXXX',
        labelTeamSize: 'Tamaño del Equipo',
        optionSelect: 'Selecciona...',
        labelMessage: 'Mensaje (opcional)',
        placeholderMessage: 'Cuéntanos un poco sobre tu agencia o necesidades...',
        submitBtn: 'Solicitar Acceso Team',
        sending: 'Enviando...',
        successTitle: '¡Solicitud Enviada!',
        successDesc: 'Nuestro equipo se pondrá en contacto en menos de 24h para configurar tu workspace Team.',
        errorFallback: 'Error al enviar. Inténtalo de nuevo.',
    },
}

function formatUSPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 10)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function TeamContactForm({ locale = 'en' }: { locale?: Locale }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [phone, setPhone] = useState('')

    const t = T[locale] ?? T.en

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const form = e.currentTarget
        const data = {
            name: (form.elements.namedItem('name') as HTMLInputElement).value,
            email: (form.elements.namedItem('email') as HTMLInputElement).value,
            phone: (form.elements.namedItem('phone_full') as HTMLInputElement).value || (form.elements.namedItem('phone') as HTMLInputElement).value,
            team_size: (form.elements.namedItem('team_size') as HTMLSelectElement).value,
            message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
        }

        const res = await submitTeamContact(data)
        setLoading(false)

        if (res.success) {
            setSuccess(true)
        } else {
            setError(res.error || t.errorFallback)
        }
    }

    if (success) {
        return (
            <div className="text-center py-8 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto" />
                <p className="text-white font-display font-black text-lg tracking-tight">
                    {t.successTitle}
                </p>
                <p className="text-white/40 text-xs font-display font-black uppercase tracking-widest">
                    {t.successDesc}
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
                <p className="text-xs font-display font-black uppercase tracking-widest text-white/40">
                    {t.intro}
                </p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-xs text-red-400 font-display font-black uppercase tracking-widest">
                    {error}
                </div>
            )}

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    {t.labelName}
                </label>
                <input
                    name="name"
                    required
                    placeholder={t.placeholderName}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors"
                />
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    {t.labelEmail}
                </label>
                <input
                    name="email"
                    type="email"
                    required
                    placeholder={t.placeholderEmail}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors"
                />
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    {t.labelPhone}
                </label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl focus-within:border-brand-400 transition-colors overflow-hidden">
                    <span className="pl-5 pr-2 text-sm font-display font-bold text-white/50 shrink-0">+1</span>
                    <input
                        name="phone"
                        required
                        value={phone}
                        onChange={e => setPhone(formatUSPhone(e.target.value))}
                        placeholder="(000) 000-0000"
                        className="flex-1 bg-transparent pr-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none"
                    />
                </div>
                {/* Hidden field with full value for the server action */}
                <input type="hidden" name="phone_full" value={phone ? `+1 ${phone}` : ''} />
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    {t.labelTeamSize}
                </label>
                <select
                    name="team_size"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white focus:outline-none focus:border-brand-400 transition-colors"
                >
                    <option value="" className="bg-brand-900">{t.optionSelect}</option>
                    <option value="2-3" className="bg-brand-900">2–3</option>
                    <option value="4-6" className="bg-brand-900">4–6</option>
                    <option value="7-10" className="bg-brand-900">7–10</option>
                    <option value="10+" className="bg-brand-900">10+</option>
                </select>
            </div>

            <div>
                <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                    {t.labelMessage}
                </label>
                <textarea
                    name="message"
                    rows={3}
                    placeholder={t.placeholderMessage}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-display text-white placeholder-white/20 focus:outline-none focus:border-brand-400 transition-colors resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-full text-xs font-display font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(0,112,204,0.5)] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> {t.sending}</>
                ) : (
                    <>{t.submitBtn} <ArrowRight className="w-4 h-4" /></>
                )}
            </button>
        </form>
    )
}
