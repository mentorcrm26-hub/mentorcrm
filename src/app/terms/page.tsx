import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Scale, ShieldCheck, FileText } from 'lucide-react'
import { cookies } from 'next/headers'

const translations = {
    pt: {
        back: 'VOLTAR',
        title: 'TERMOS DE SERVIÇO',
        lastUpdate: 'ÚLTIMA ATUALIZAÇÃO: 21 DE MARÇO, 2026',
        section1Title: '1. ACEITAÇÃO DOS TERMOS',
        section1Content: 'Ao acessar o Mentor CRM, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. O uso da plataforma é restrito a fins profissionais de gestão de vendas e leads.',
        section2Title: '2. LICENÇA DE USO (TRIAL)',
        section2Content: 'O período de teste (Trial) é concedido por 3 dias e limitado a 3 contatos. É proibido o uso de automações abusivas ou extração massiva de dados durante este período.',
        section3Title: '3. RESPONSABILIDADE',
        section3Content: 'O Mentor CRM não se responsabiliza pelo conteúdo das mensagens enviadas por seus usuários ou pelo fechamento de negócios. Somos uma ferramenta de facilitação e automação.',
        footer: 'Dúvidas sobre os termos? Entre em contato com compliance@mentor-crm.com'
    },
    en: {
        back: 'BACK',
        title: 'TERMS OF SERVICE',
        lastUpdate: 'LAST UPDATED: MARCH 21, 2026',
        section1Title: '1. ACCEPTANCE OF TERMS',
        section1Content: 'By accessing Mentor CRM, you agree to comply with these terms of service and all applicable laws and regulations. Platform use is restricted to professional sales and lead management purposes.',
        section2Title: '2. LICENSE (TRIAL)',
        section2Content: 'The trial period is granted for 3 days and limited to 3 contacts. Abusive automation or mass data extraction during this period is prohibited.',
        section3Title: '3. RESPONSIBILITY',
        section3Content: 'Mentor CRM is not responsible for the content of messages sent by its users or for the closing of deals. We are a facilitation and automation tool.',
        footer: 'Questions about terms? Contact compliance@mentor-crm.com'
    },
    es: {
        back: 'VOLVER',
        title: 'TÉRMINOS DE SERVICIO',
        lastUpdate: 'ÚLTIMA ACTUALIZACIÓN: 21 DE MARZO, 2026',
        section1Title: '1. ACEPTACIÓN DE LOS TÉRMINOS',
        section1Content: 'Al acceder al Mentor CRM, usted acepta cumplir con estos términos de servicio e con todas las leyes y regulaciones aplicables. El uso de la plataforma está restringido a fines profesionales de gestión de ventas y leads.',
        section2Title: '2. LICENCIA DE USO (TRIAL)',
        section2Content: 'El período de prueba (Trial) se concede por 3 días y está limitado a 3 contactos. Está prohibido el uso de automatizaciones abusivas o la extracción masiva de datos durante este período.',
        section3Title: '3. RESPONSABILIDAD',
        section3Content: 'Mentor CRM no se responsabiliza por el contenido de los mensajes enviados por sus usuarios ni por el cierre de negocios. Somos una herramienta de facilitación y automatización.',
        footer: '¿Dudas sobre los términos? Contacte con compliance@mentor-crm.com'
    }
}

export default async function TermsPage() {
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
                        <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/10">
                            <Scale className="h-8 w-8 text-mentor-blue" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t.title}</h1>
                        <p className="text-[10px] font-black tracking-[0.3em] text-zinc-400">{t.lastUpdate}</p>
                    </div>

                    <div className="space-y-12">
                        <section className="bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                <FileText className="h-5 w-5 text-mentor-blue" />
                                {t.section1Title}
                            </h2>
                            <p className="text-zinc-500 leading-relaxed font-medium">{t.section1Content}</p>
                        </section>

                        <section className="bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                {t.section2Title}
                            </h2>
                            <p className="text-zinc-500 leading-relaxed font-medium">{t.section2Content}</p>
                        </section>

                        <section className="bg-white border border-zinc-100 p-10 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-xl font-bold mb-6 tracking-tight flex items-center gap-3">
                                <Scale className="h-5 w-5 text-orange-500" />
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
