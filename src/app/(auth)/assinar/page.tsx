import Link from 'next/link'
import { ArrowRight, Check, Shield, Zap, Users } from 'lucide-react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { TeamContactForm } from './team-contact-form'

type Locale = 'en' | 'pt' | 'es'

const T = {
    en: {
        badgeMonthly: 'MONTHLY',
        badgeAnnual: 'ANNUAL — SAVE 31%',
        badgeTeam: '3 AGENTS INCLUDED',
        periodMonthly: '/mo',
        periodAnnual: '/year',
        priceNoteMonthly: 'Monthly billing. Cancel anytime.',
        priceNoteAnnual: 'Equivalent to $40.83/month. Single annual charge.',
        priceNoteTeam: 'Personalized onboarding included. Setup done by our team.',
        featuresMonthly: [
            'Unlimited Leads in CRM',
            'Email & SMS Automations',
            'Advanced Analytics',
            'Integrated Live Chat',
            'Priority Support',
            '1 WhatsApp connection via Evolution API',
        ],
        featuresAnnual: [
            'Everything in monthly plan',
            'Unlimited Leads in CRM',
            'Email & SMS Automations',
            'Advanced Analytics',
            'Integrated Live Chat',
            'Priority Support',
        ],
        featuresTeam: [
            '3 agents/users in workspace',
            'Unlimited Leads in CRM',
            '3 WhatsApp connections',
            'Automations & Smart Automations',
            'Ranking & Stats per agent',
            'Lead Distribution',
            'Priority Onboarding',
        ],
        ctaLabel: 'PROCEED TO PAYMENT',
        securePayment: 'Secure payment via Stripe. Your data is encrypted.',
        preferAnnual: 'Prefer to pay annually?',
        seeAnnual: 'See annual plan →',
        preferMonthly: 'Prefer monthly?',
        seeMonthly: 'See monthly plan →',
        backToSite: '← Back to site',
    },
    pt: {
        badgeMonthly: 'MENSAL',
        badgeAnnual: 'ANUAL — ECONOMIZE 31%',
        badgeTeam: '3 AGENTES INCLUSOS',
        periodMonthly: '/mês',
        periodAnnual: '/ano',
        priceNoteMonthly: 'Cobrança mensal. Cancele a qualquer momento.',
        priceNoteAnnual: 'Equivalente a $40,83/mês. Cobrança única anual.',
        priceNoteTeam: 'Onboarding personalizado incluído. Setup feito pela nossa equipe.',
        featuresMonthly: [
            'Leads ilimitados no CRM',
            'Automações de email e SMS',
            'Analytics avançado',
            'Live Chat integrado',
            'Suporte prioritário',
            '1 conexão WhatsApp via Evolution API',
        ],
        featuresAnnual: [
            'Tudo do plano mensal',
            'Leads ilimitados no CRM',
            'Automações de email e SMS',
            'Analytics avançado',
            'Live Chat integrado',
            'Suporte prioritário',
        ],
        featuresTeam: [
            '3 agentes/usuários no workspace',
            'Leads ilimitados no CRM',
            '3 conexões WhatsApp',
            'Automações e Smart Automations',
            'Ranking e Stats por agente',
            'Distribuição de leads',
            'Onboarding com prioridade',
        ],
        ctaLabel: 'PROSSEGUIR PARA PAGAMENTO',
        securePayment: 'Pagamento seguro via Stripe. Seus dados são criptografados.',
        preferAnnual: 'Prefere pagar anual?',
        seeAnnual: 'Ver plano anual →',
        preferMonthly: 'Prefere mensal?',
        seeMonthly: 'Ver plano mensal →',
        backToSite: '← Voltar para o site',
    },
    es: {
        badgeMonthly: 'MENSUAL',
        badgeAnnual: 'ANUAL — AHORRA 31%',
        badgeTeam: '3 AGENTES INCLUIDOS',
        periodMonthly: '/mes',
        periodAnnual: '/año',
        priceNoteMonthly: 'Facturación mensual. Cancela cuando quieras.',
        priceNoteAnnual: 'Equivalente a $40.83/mes. Cargo anual único.',
        priceNoteTeam: 'Onboarding personalizado incluido. Configuración hecha por nuestro equipo.',
        featuresMonthly: [
            'Leads ilimitados en CRM',
            'Automatizaciones de email y SMS',
            'Analytics avanzado',
            'Live Chat integrado',
            'Soporte prioritario',
            '1 conexión WhatsApp vía Evolution API',
        ],
        featuresAnnual: [
            'Todo del plan mensual',
            'Leads ilimitados en CRM',
            'Automatizaciones de email y SMS',
            'Analytics avanzado',
            'Live Chat integrado',
            'Soporte prioritario',
        ],
        featuresTeam: [
            '3 agentes/usuarios en workspace',
            'Leads ilimitados en CRM',
            '3 conexiones WhatsApp',
            'Automatizaciones y Smart Automations',
            'Ranking y Stats por agente',
            'Distribución de leads',
            'Onboarding con prioridad',
        ],
        ctaLabel: 'PROCEDER AL PAGO',
        securePayment: 'Pago seguro vía Stripe. Tus datos están encriptados.',
        preferAnnual: '¿Prefieres pagar anual?',
        seeAnnual: 'Ver plan anual →',
        preferMonthly: '¿Prefieres mensual?',
        seeMonthly: 'Ver plan mensual →',
        backToSite: '← Volver al sitio',
    },
}

export default async function AssinarPage({
    searchParams,
}: {
    searchParams: Promise<{ plan?: string }>
}) {
    const { plan } = await searchParams
    const validPlans = ['agent_monthly', 'agent_annual', 'team'] as const
    type PlanKey = typeof validPlans[number]

    if (!plan || !validPlans.includes(plan as PlanKey)) {
        redirect('/assinar?plan=agent_monthly')
    }

    const cookieStore = await cookies()
    const locale = (cookieStore.get('NEXT_LOCALE')?.value ?? 'en') as Locale
    const t = T[locale] ?? T.en

    const PLAN_CONFIG = {
        agent_monthly: {
            name: 'AGENT SOLO',
            badge: t.badgeMonthly,
            price: '$59',
            period: t.periodMonthly,
            priceNote: t.priceNoteMonthly,
            features: t.featuresMonthly,
            icon: Zap,
            ctaLabel: t.ctaLabel,
            ctaHref: '/api/stripe/public-checkout?plan=agent_monthly',
        },
        agent_annual: {
            name: 'AGENT SOLO',
            badge: t.badgeAnnual,
            price: '$490',
            period: t.periodAnnual,
            priceNote: t.priceNoteAnnual,
            features: t.featuresAnnual,
            icon: Shield,
            ctaLabel: t.ctaLabel,
            ctaHref: '/api/stripe/public-checkout?plan=agent_annual',
        },
        team: {
            name: 'TEAM / AGENCY',
            badge: t.badgeTeam,
            price: '$99',
            period: t.periodMonthly,
            priceNote: t.priceNoteTeam,
            features: t.featuresTeam,
            icon: Users,
            ctaLabel: null,
            ctaHref: null,
        },
    }

    const config = PLAN_CONFIG[plan as PlanKey]
    const Icon = config.icon
    const isTeam = plan === 'team'

    return (
        <div className="glass-strong p-10 md:p-14 rounded-[3.5rem] shadow-[0_32px_100px_rgba(0,12,36,0.5)] relative overflow-hidden border-white/10 animate-fade-up w-full max-w-lg">

            {/* Header */}
            <div className="mb-10 text-center flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2 group mb-12">
                    <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-display font-black text-xl">M</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-white">
                        MENTOR<span className="text-brand-300">CRM</span>
                    </span>
                </Link>

                <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-brand-300" />
                    <span className="text-[10px] font-display font-black tracking-[0.4em] uppercase text-brand-300">
                        {config.name}
                    </span>
                </div>

                <span className="text-[9px] font-display font-black uppercase tracking-[0.3em] text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {config.badge}
                </span>
            </div>

            {/* Price */}
            {!isTeam && (
                <div className="text-center mb-10">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-6xl font-display font-extrabold text-white tracking-tighter italic">
                            {config.price}
                        </span>
                        <span className="text-white/40 font-bold text-lg">{config.period}</span>
                    </div>
                    <p className="text-[10px] text-white/30 font-display font-black uppercase tracking-widest mt-2">
                        {config.priceNote}
                    </p>
                </div>
            )}

            {/* Features */}
            <div className="space-y-3 mb-10">
                {config.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/80">
                        <Check className="h-4 w-4 text-brand-400 shrink-0" />
                        {feat}
                    </div>
                ))}
            </div>

            {/* CTA or Contact Form */}
            {!isTeam ? (
                <>
                    <a
                        href={config.ctaHref!}
                        className="w-full block py-5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-full text-center text-xs font-display font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(0,112,204,0.5)] active:scale-95 transition-all shadow-xl mb-4"
                    >
                        {config.ctaLabel}
                        <ArrowRight className="inline-block ml-2 h-4 w-4" />
                    </a>
                    <p className="text-center text-[9px] text-white/20 font-display font-black uppercase tracking-widest">
                        {t.securePayment}
                    </p>

                    {/* Switch between monthly/annual */}
                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        {plan === 'agent_monthly' ? (
                            <p className="text-[10px] text-white/30 font-display font-black uppercase tracking-widest">
                                {t.preferAnnual}{' '}
                                <Link href="/assinar?plan=agent_annual" className="text-brand-300 hover:text-white transition-colors">
                                    {t.seeAnnual}
                                </Link>
                            </p>
                        ) : (
                            <p className="text-[10px] text-white/30 font-display font-black uppercase tracking-widest">
                                {t.preferMonthly}{' '}
                                <Link href="/assinar?plan=agent_monthly" className="text-brand-300 hover:text-white transition-colors">
                                    {t.seeMonthly}
                                </Link>
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <TeamContactForm locale={locale} />
            )}

            {/* Back link */}
            <div className="mt-8 text-center">
                <Link href="/" className="text-[9px] text-white/20 font-display font-black uppercase tracking-widest hover:text-white/40 transition-colors">
                    {t.backToSite}
                </Link>
            </div>
        </div>
    )
}
