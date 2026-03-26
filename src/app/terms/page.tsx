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

            <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl">
                <div className="glass px-10 h-20 flex items-center justify-between rounded-full border-white/5 shadow-2xl">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="h-5 w-5 text-brand-300 group-hover:-translate-x-1 transition-all" />
                        <span className="text-xs font-display font-black tracking-[0.3em] uppercase">{t.back}</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="text-white font-display font-black text-xl">M</span>
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-white hidden md:inline">
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
                            { icon: <FileText className="h-6 w-6 text-brand-300" />, title: t.section1Title, content: t.section1Content },
                            { icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />, title: t.section2Title, content: t.section2Content },
                            { icon: <Scale className="h-6 w-6 text-brand-300" />, title: t.section3Title, content: t.section3Content }
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
