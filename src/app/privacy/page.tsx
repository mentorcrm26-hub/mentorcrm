import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, Eye } from 'lucide-react'
import { cookies } from 'next/headers'

const translations = {
    pt: {
        back: 'VOLTAR',
        title: 'PRIVACIDADE',
        lastUpdate: 'ÚLTIMA ATUALIZAÇÃO: 21 DE MARÇO, 2026',
        section1Title: '1. COLETA DE DADOS',
        section1Content: 'Coletamos informações profissionais básicas como nome e email para o funcionamento da plataforma. Dados de leads processados são de propriedade exclusiva do usuário.',
        section2Title: '2. TRATAMENTO E SEGURANÇA',
        section2Content: 'Utilizamos criptografia ponta a ponta e bancos de dados isolados para garantir que sua operação e seus leads estejam sempre protegidos.',
        section3Title: '3. COMPARTILHAMENTO',
        section3Content: 'O Mentor CRM nunca comercializa dados de usuários ou de leads. O compartilhamento ocorre apenas com serviços essenciais (como API de WhatsApp) mediante sua configuração.',
        footer: 'Dúvidas sobre privacidade? Entre em contato com dpo@mentor-crm.com'
    },
    en: {
        back: 'BACK',
        title: 'PRIVACY POLICY',
        lastUpdate: 'LAST UPDATED: MARCH 21, 2026',
        section1Title: '1. DATA COLLECTION',
        section1Content: 'We collect basic professional information such as name and email for platform operation. Processed lead data is the exclusive property of the user.',
        section2Title: '2. PROCESSING AND SECURITY',
        section2Content: 'We use end-to-end encryption and isolated databases to ensure that your financial operation and your leads are always protected.',
        section3Title: '3. SHARING',
        section3Content: 'Mentor CRM never sells user or lead data. Sharing only occurs with essential services (like WhatsApp API) through your configuration.',
        footer: 'Privacy questions? Contact dpo@mentor-crm.com'
    },
    es: {
        back: 'VOLVER',
        title: 'POLÍTICA DE PRIVACIDAD',
        lastUpdate: 'ÚLTIMA ACTUALIZACIÓN: 21 DE MARZO, 2026',
        section1Title: '1. RECOLECCIÓN DE DATOS',
        section1Content: 'Recopilamos información profesional básica como nombre y correo electrónico para el funcionamiento de la plataforma. Los datos de leads procesados son propiedad exclusiva del usuario.',
        section2Title: '2. TRATAMIENTO Y SEGURIDAD',
        section2Content: 'Utilizamos cifrado de extremo a extremo y bases de datos aisladas para garantizar que su operación y sus leads estén siempre protegidos.',
        section3Title: '3. COMPARTIR DATOS',
        section3Content: 'Mentor CRM nunca comercializa datos de usuarios o de leads. El intercambio ocurre solo con servicios esenciales (como API de WhatsApp) mediante su configuración.',
        footer: '¿Dudas sobre privacidad? Contacte con dpo@mentor-crm.com'
    }
}

export default async function PrivacyPage() {
    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as keyof typeof translations | undefined
    const lang = (localeCookie && translations[localeCookie]) ? localeCookie : 'en'
    const t = translations[lang]

    return (
        <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 selection:bg-mentor-blue/10 selection:text-mentor-blue">
            <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover:text-mentor-blue group-hover:-translate-x-1 transition-all" />
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase">{t.back}</span>
                    </Link>
                    <img src="/logo.png" alt="Mentor CRM" className="h-20 w-auto" />
                </div>
            </nav>

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-16">
                        <div className="h-16 w-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/10">
                            <ShieldCheck className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t.title}</h1>
                        <p className="text-[10px] font-black tracking-[0.3em] text-zinc-400">{t.lastUpdate}</p>
                    </div>

                    <div className="space-y-12">
                        <section className="bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                <Eye className="h-5 w-5 text-mentor-blue" />
                                {t.section1Title}
                            </h2>
                            <p className="text-zinc-500 leading-relaxed font-medium">{t.section1Content}</p>
                        </section>

                        <section className="bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                <Lock className="h-5 w-5 text-emerald-500" />
                                {t.section2Title}
                            </h2>
                            <p className="text-zinc-500 leading-relaxed font-medium">{t.section2Content}</p>
                        </section>

                        <section className="bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-orange-500" />
                                {t.section3Title}
                            </h2>
                            <p className="text-zinc-500 leading-relaxed font-medium">{t.section3Content}</p>
                        </section>
                    </div>

                    <footer className="mt-20 pt-10 border-t border-zinc-100">
                        <p className="text-xs text-zinc-400 text-center font-medium leading-relaxed">
                            {t.footer}
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
