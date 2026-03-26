'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, ShieldCheck, FileText, Ban, CreditCard, Gavel } from 'lucide-react'

const translations = {
    pt: {
        back: 'VOLTAR',
        title: 'TERMOS DE SERVIÇO',
        lastUpdate: 'ÚLTIMA ATUALIZAÇÃO: 25 DE MARÇO, 2026',
        section1Title: '1. ACEITAÇÃO DOS TERMOS',
        section1Content: 'Ao acessar o Mentor CRM, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. O uso da plataforma é restrito a fins profissionais de gestão de vendas e leads. Caso não concorde com algum destes termos, você está proibido de usar ou acessar este site.',
        section2Title: '2. LICENÇA DE USO (TRIAL)',
        section2Content: 'O período de teste (Trial) é concedido por 3 dias e limitado a 3 contatos. Esta é a concessão de uma licença, não uma transferência de título. É expressamente proibido o uso de automações abusivas, extração massiva de dados (scraping) ou qualquer tentativa de engenharia reversa do software durante este período.',
        section3Title: '3. RESPONSABILIDADE',
        section3Content: 'O Mentor CRM não se responsabiliza pelo conteúdo das mensagens enviadas por seus usuários, pela entrega técnica via APIs de terceiros (como WhatsApp) ou pelo fechamento de negócios. Somos uma ferramenta de facilitação e automação fornecida "como está", sem garantias explícitas ou implícitas.',
        section4Title: '4. ASSINATURAS E PAGAMENTOS',
        section4Content: 'As assinaturas são renovadas automaticamente a cada mês ou ano, dependendo do plano escolhido. O cancelamento pode ser feito a qualquer momento através do painel, mas não haverá estorno de períodos já utilizados por serviços já prestados.',
        section5Title: '5. USOS PROIBIDOS',
        section5Content: 'Você não pode usar o Mentor CRM para: enviar SPAM, assediar indivíduos, coletar dados sem consentimento ou violar as diretrizes oficiais da Meta/WhatsApp. Qualquer violação resultará em suspensão imediata sem aviso previdencial.',
        section6Title: '6. LEI APLICÁVEL',
        section6Content: 'Estes termos e condições são regidos e interpretados de acordo com as leis vigentes e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.',
        footer: 'Dúvidas sobre os termos? Entre em contato com compliance@mentorcrm.site'
    },
    en: {
        back: 'BACK',
        title: 'TERMS OF SERVICE',
        lastUpdate: 'LAST UPDATED: MARCH 25, 2026',
        section1Title: '1. ACCEPTANCE OF TERMS',
        section1Content: 'By accessing Mentor CRM, you agree to comply with these terms of service and all applicable laws and regulations. Platform use is restricted to professional sales and lead management purposes. If you do not agree with any of these terms, you are prohibited from using or accessing this site.',
        section2Title: '2. LICENSE (TRIAL)',
        section2Content: 'The trial period is granted for 3 days and limited to 3 contacts. This is the grant of a license, not a transfer of title. Abusive automation, mass data extraction (scraping), or any attempt to reverse engineer the software during this period is strictly prohibited.',
        section3Title: '3. RESPONSIBILITY',
        section3Content: 'Mentor CRM is not responsible for the content of messages sent by its users, technical delivery via third-party APIs (such as WhatsApp), or the closing of deals. We are a facilitation and automation tool provided "as is", without explicit or implied warranties.',
        section4Title: '4. SUBSCRIPTIONS & PAYMENTS',
        section4Content: 'Subscriptions automatically renew each month or year, depending on the chosen plan. Cancellation can be done at any time through the dashboard, but there will be no refunds for periods already used.',
        section5Title: '5. PROHIBITED USES',
        section5Content: 'You may not use Mentor CRM to: send SPAM, harass individuals, collect data without consent, or violate official Meta/WhatsApp guidelines. Any violation will result in immediate suspension without notice.',
        section6Title: '6. GOVERNING LAW',
        section6Content: 'These terms and conditions are governed by and construed in accordance with current laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.',
        footer: 'Questions about terms? Contact compliance@mentorcrm.site'
    },
    es: {
        back: 'VOLVER',
        title: 'TÉRMINOS DE SERVICIO',
        lastUpdate: 'LAST UPDATED: MARCH 25, 2026',
        section1Title: '1. ACEPTACIÓN DE LOS TÉRMINOS',
        section1Content: 'Al acceder al Mentor CRM, usted acepta cumplir con estos términos de servicio e con todas las leyes y regulaciones aplicables. El uso de la plataforma está restringido a fines profesionales de gestión de ventas y leads. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.',
        section2Title: '2. LICENCIA DE USO (TRIAL)',
        section2Content: 'El período de prueba (Trial) se concede por 3 días y está limitado a 3 contactos. Esta es la concesión de una licencia, no uma transferencia de título. Está prohibido o uso de automatizaciones abusivas, extracción masiva de datos (scraping) o cualquier intento de ingeniería inversa.',
        section3Title: '3. RESPONSABILIDAD',
        section3Content: 'Mentor CRM no se responsabiliza por el contenido de los mensajes enviados por sus usuarios ni por el cierre de negocios. Somos uma herramienta de facilitación y automatización proporcionada "tal cual", sin garantías explícitas o implícitas.',
        section4Title: '4. SUSCRIPCIONES Y PAGOS',
        section4Content: 'Las suscripciones se renuevan automáticamente cada mes o año. La cancelación se puede realizar en cualquier momento, pero no habrá reembolsos por periodos ya utilizados.',
        section5Title: '5. USOS PROHIBIDOS',
        section5Content: 'No puede usar Mentor CRM para: enviar SPAM, acosar individuos, recopilar datos sin consentimiento o violar las pautas de Meta/WhatsApp. Cualquier violación resultará en suspensión inmediata.',
        section6Title: '6. LEY APLICABLE',
        section6Content: 'Estos términos y condiciones se rigen e interpretan de acuerdo con las leyes vigentes y usted se somete irrevocablemente a la jurisdicción exclusiva de los tribunales.',
        footer: '¿Dudas sobre los términos? Contacte con compliance@mentorcrm.site'
    }
}

export default function TermsPage() {
    const [scrolled, setScrolled] = useState(false);
    const [lang, setLang] = useState<keyof typeof translations>('en');

    useEffect(() => {
        // Language detection
        const locale = document.cookie
            .split('; ')
            .find((row) => row.startsWith('NEXT_LOCALE='))
            ?.split('=')[1] as keyof typeof translations | undefined;
        if (locale && translations[locale]) {
            setLang(locale);
        }

        // Scroll listener
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const t = translations[lang];

    return (
        <div className="min-h-screen w-full bg-brand-900 text-white selection:bg-brand-500/20 selection:text-brand-300 relative overflow-hidden">
            {/* ─── ANIMATED BACKGROUND ─── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#000C24_0%,#001333_40%,#001F50_70%,#000C24_100%)]" />
                <div className="absolute inset-0 opacity-45 animate-mesh-shift" 
                    style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 15% 40%, rgba(0,85,164,0.45) 0%, transparent 65%),
                        radial-gradient(ellipse 60% 50% at 85% 15%, rgba(0,51,128,0.35) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 70% at 60% 85%, rgba(0,112,204,0.25) 0%, transparent 55%),
                        radial-gradient(ellipse 40% 40% at 40% 60%, rgba(51,153,230,0.1) 0%, transparent 50%)
                    `,
                    backgroundSize: '200% 200%'
                    }}
                />
                <div className="absolute inset-0 bg-[url('https://grain-y.com/assets/grain.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1200px] transition-all duration-500 ease-out ${scrolled ? 'top-4' : 'top-8'}`}>
                <div className={`
                    px-10 rounded-full flex items-center justify-between gap-6 shadow-2xl transition-all duration-500
                    ${scrolled 
                        ? 'bg-brand-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-16' 
                        : 'glass border-white/5 h-20'
                    }
                `}>
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className={`text-brand-300 group-hover:-translate-x-1 transition-all ${scrolled ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        <span className={`font-display font-black tracking-[0.3em] uppercase ${scrolled ? 'text-[10px]' : 'text-xs'}`}>{t.back}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className={`bg-brand-500 rounded-lg flex items-center justify-center shadow-lg transition-all ${scrolled ? 'h-8 w-8' : 'h-10 w-10'}`}>
                            <span className={`text-white font-display font-black ${scrolled ? 'text-lg' : 'text-xl'}`}>M</span>
                        </div>
                        <span className={`font-display font-bold tracking-tight text-white hidden md:inline transition-all ${scrolled ? 'text-lg' : 'text-xl'}`}>
                            MENTOR<span className="text-brand-300">CRM</span>
                        </span>
                    </div>
                </div>
            </nav>

            <main className="pt-48 pb-32 px-6 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-20 text-center animate-fade-up">
                        <div className="h-20 w-20 bg-brand-500/20 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-brand-500/20 shadow-2xl">
                            <Scale className="h-10 w-10 text-brand-300" />
                        </div>
                        <h1 className="text-4xl md:text-display font-display font-extrabold text-white mb-6 uppercase tracking-tight italic">{t.title}</h1>
                        <p className="text-[10px] font-display font-black tracking-[0.4em] text-white/30 uppercase">{t.lastUpdate}</p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { icon: <FileText className="h-6 w-6 text-brand-300" />, title: (t as any).section1Title, content: (t as any).section1Content },
                            { icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />, title: (t as any).section2Title, content: (t as any).section2Content },
                            { icon: <Scale className="h-6 w-6 text-brand-300" />, title: (t as any).section3Title, content: (t as any).section3Content },
                            { icon: <CreditCard className="h-6 w-6 text-brand-400" />, title: (t as any).section4Title, content: (t as any).section4Content },
                            { icon: <Ban className="h-6 w-6 text-red-400" />, title: (t as any).section5Title, content: (t as any).section5Content },
                            { icon: <Gavel className="h-6 w-6 text-amber-400" />, title: (t as any).section6Title, content: (t as any).section6Content }
                        ].map((section, idx) => (
                            <section key={idx} className="glass-strong p-12 rounded-[3.5rem] animate-fade-up border-white/5" style={{ animationDelay: `${idx * 100}ms` }}>
                                <h2 className="text-2xl font-display font-black mb-8 tracking-tight text-white flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                        {section.icon}
                                    </div>
                                    {section.title}
                                </h2>
                                <p className="text-white/50 text-lg leading-relaxed font-display font-medium">{section.content}</p>
                            </section>
                        ))}
                    </div>

                    <footer className="mt-32 pt-16 border-t border-white/5 text-center animate-fade-up" style={{ animationDelay: '400ms' }}>
                        <p className="text-xs text-white/30 font-display font-bold uppercase tracking-widest leading-relaxed">
                            {t.footer}
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
