'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, Globe, UserCheck } from 'lucide-react'

const translations = {
    pt: {
        back: 'VOLTAR',
        title: 'PRIVACIDADE',
        lastUpdate: 'ÚLTIMA ATUALIZAÇÃO: 25 DE MARÇO, 2026',
        section1Title: '1. COLETA DE DADOS',
        section1Content: 'Coletamos informações profissionais básicas como nome, email e dados de faturamento para o funcionamento da plataforma. Dados de leads processados via CRM são de propriedade exclusiva do usuário; o Mentor CRM atua apenas como processador desses dados.',
        section2Title: '2. TRATAMENTO E SEGURANÇA',
        section2Content: 'Utilizamos criptografia ponta a ponta (AES-256) e bancos de dados isolados. Seus dados são armazenados em servidores de alta segurança com monitoramento 24/7 para evitar acessos não autorizados.',
        section3Title: '3. COMPARTILHAMENTO',
        section3Content: 'O Mentor CRM nunca comercializa dados de usuários ou de leads de clientes. O compartilhamento ocorre estritamente com serviços essenciais para a operação (como APIs de pagamento e infraestrutura de nuvem) e apenas os dados estritamente necessários são transmitidos.',
        section4Title: '4. SERVIÇOS DE TERCEIROS',
        section4Content: 'Nossa plataforma integra-se com APIs externas como Evolution API e Meta (WhatsApp). O uso desses serviços está sujeito aos termos de privacidade dessas empresas. Recomendamos revisar as políticas de privacidade desses provedores independentes.',
        section5Title: '5. RETENÇÃO E EXCLUSÃO',
        section5Content: 'Manteremos seus dados pessoais apenas pelo tempo necessário para cumprir as finalidades para as quais os coletamos. Você pode solicitar a exclusão total dos seus dados e dos leads da sua conta a qualquer momento através do suporte.',
        section6Title: '6. SEUS DIREITOS (LGPD/GDPR)',
        section6Content: 'Você tem o direito de acessar, corrigir, portar ou excluir seus dados. Além disso, pode retirar o consentimento para comunicações de marketing a qualquer momento. Operamos em conformidade com as principais diretrizes globais de proteção de dados.',
        footer: 'Dúvidas sobre privacidade? Entre em contato com dpo@mentorcrm.site'
    },
    en: {
        back: 'BACK',
        title: 'PRIVACY POLICY',
        lastUpdate: 'LAST UPDATED: MARCH 25, 2026',
        section1Title: '1. DATA COLLECTION',
        section1Content: 'We collect basic professional information such as name, email, and billing data for platform operation. Lead data processed via CRM is the exclusive property of the user; Mentor CRM acts solely as a data processor.',
        section2Title: '2. PROCESSING AND SECURITY',
        section2Content: 'We use end-to-end encryption (AES-256) and isolated databases. Your data is stored on high-security servers with 24/7 monitoring to prevent unauthorized access.',
        section3Title: '3. SHARING',
        section3Content: 'Mentor CRM never sells user or client lead data. Sharing occurs strictly with services essential for operation (such as payment APIs and cloud infrastructure), and only strictly necessary data is transmitted.',
        section4Title: '4. THIRD-PARTY SERVICES',
        section4Content: 'Our platform integrates with external APIs such as Evolution API and Meta (WhatsApp). Use of these services is subject to the privacy terms of those companies. We recommend reviewing the privacy policies of these independent providers.',
        section5Title: '5. RETENTION AND DELETION',
        section5Content: 'We will keep your personal data only as long as necessary to fulfill the purposes for which we collected it. You can request the full deletion of your data and account leads at any time through support.',
        section6Title: '6. YOUR RIGHTS (GDPR)',
        section6Content: 'You have the right to access, correct, port, or delete your data. Additionally, you can withdraw consent for marketing communications at any time. We operate in compliance with major global data protection guidelines.',
        footer: 'Privacy questions? Contact dpo@mentorcrm.site'
    },
    es: {
        back: 'VOLVER',
        title: 'POLÍTICA DE PRIVACIDAD',
        lastUpdate: 'ÚLTIMA ACTUALIZACIÓN: 25 DE MARZO, 2026',
        section1Title: '1. RECOLECCIÓN DE DATOS',
        section1Content: 'Recopilamos información profesional básica como nombre y correo electrónico para el funcionamiento de la plataforma. Los datos de leads procesados son propiedad exclusiva del usuario.',
        section2Title: '2. TRATAMIENTO Y SEGURIDAD',
        section2Content: 'Utilizamos cifrado de extremo a extremo y bases de datos aisladas para garantizar que su operación y sus leads estén siempre protegidos.',
        section3Title: '3. COMPARTIR DATOS',
        section3Content: 'Mentor CRM nunca comercializa datos de usuarios o de leads. El intercambio ocurre solo con servicios esenciales (como API de WhatsApp) mediante su configuración.',
        section4Title: '4. SERVICIOS DE TERCEROS',
        section4Content: 'Nuestra plataforma se integra con APIs externas como Evolution API y Meta. El uso de estos servicios está sujeto a los términos de estas empresas.',
        section5Title: '5. RETENCIÓN Y ELIMINACIÓN',
        section5Content: 'Mantendremos sus datos solo por el tiempo necesario. Puede solicitar la eliminación de sus datos en cualquier momento.',
        section6Title: '6. SUS DERECHOS',
        section6Content: 'Tiene derecho a acceder, corregir o eliminar sus datos. Operamos de acuerdo con las directrices globales de protección de datos.',
        footer: '¿Dudas sobre privacidad? Contacte con dpo@mentorcrm.site'
    }
}

export default function PrivacyPage() {
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
                        <div className="h-20 w-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-emerald-500/20 shadow-2xl">
                            <ShieldCheck className="h-10 w-10 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl md:text-display font-display font-extrabold text-white mb-6 uppercase tracking-tight italic">{t.title}</h1>
                        <p className="text-[10px] font-display font-black tracking-[0.4em] text-white/30 uppercase">{t.lastUpdate}</p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { icon: <Eye className="h-6 w-6 text-brand-300" />, title: (t as any).section1Title, content: (t as any).section1Content },
                            { icon: <Lock className="h-6 w-6 text-emerald-400" />, title: (t as any).section2Title, content: (t as any).section2Content },
                            { icon: <ShieldCheck className="h-6 w-6 text-brand-300" />, title: (t as any).section3Title, content: (t as any).section3Content },
                            { icon: <Globe className="h-6 w-6 text-brand-400" />, title: (t as any).section4Title, content: (t as any).section4Content },
                            { icon: <Database className="h-6 w-6 text-amber-400" />, title: (t as any).section5Title, content: (t as any).section5Content },
                            { icon: <UserCheck className="h-6 w-6 text-emerald-400" />, title: (t as any).section6Title, content: (t as any).section6Content }
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
