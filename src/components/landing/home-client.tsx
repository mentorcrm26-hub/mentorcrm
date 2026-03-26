'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Zap,
  Workflow,
  BarChart3,
  Globe,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  Users,
  Target,
  Layers,
  CheckCircle2,
  MousePointer2,
  Lock
} from 'lucide-react';
import { LocaleSelector } from './locale-selector';

const translations = {
  en: {
    badge: 'CRM BUILT FOR LIFE PLANNERS',
    heroLine1: 'Your Referrals Deserve a Better',
    heroLine2: 'System Than a Spreadsheet.',
    subHero: 'Mentor CRM helps Life Planners track, follow up, and close — without dropping the ball. Track every prospect across all your carriers and know exactly who to call today.',
    cta: 'Start Tracking Your Prospects Free',
    login: 'LOGIN',
    demo: 'WATCH 2-MIN DEMO',
    navFeatures: 'Features',
    navSolutions: 'How It Works',
    navAutomation: 'Niche',
    navSecurity: 'Security',
    feat1Title: 'Precision Pipeline',
    feat1Desc: 'See your entire pipeline at a glance — from first contact to policy issued.',
    feat2Title: 'Automated Sequences',
    feat2Desc: 'Automated follow-up sequences that keep you top-of-mind without manual work.',
    feat3Title: 'Follow-up Reminders',
    feat3Desc: 'Set reminders so you never go more than X days without touching a warm prospect.',
    captureTitle: 'RELATIONSHIP-FIRST CAPTURE',
    captureHeadline: <>Capture referrals from anywhere, <br/>so no prospect gets <span className="text-zinc-400">lost.</span></>,
    captureDesc: 'Integrate with your referral sources. Instantly record names, phone numbers, and products needed in less than 30 seconds.',
    newLeadLabel: 'New Referral Received',
    assignLabel: 'Track',
    distTitle: 'BUILT FOR LIFE PLANNERS',
    distHeadline: <>Finally, a CRM that understands <br/>how <span className="italic font-light">you actually work.</span></>,
    distDesc: 'Designed for independent professionals, not call centers. Relationship tracking that follows your specific workflow.',
    card1Title: 'Referral-Centric',
    card1Desc: 'Built around tracking relationships and referrals, not cold lead volume.',
    card2Title: 'Multi-Carrier Support',
    card2Desc: 'Tag prospects by carrier (National Life, Pacific Life, etc.) and product type.',
    card3Title: 'Consistent Follow-up',
    card3Desc: 'Keep yourself in front of prospects at the right time to hit your monthly goals.',
    statsTitle: 'NICHE RESULTS',
    statsHeadline: <>Serving Life Planners across <span className="text-blue-500">the United States.</span></>,
    stat1: 'Closed Policies',
    stat1Val: '+45k',
    stat2: 'First Month Increase',
    stat2Val: '35%',
    stat3: 'Admin Time Saved',
    stat3Val: '10h/wk',
    securityTitle: 'U.S. SECURE STORAGE & COMPLIANCE',
    securityHeadline: <>Regulated-industry <span className="italic font-light">standards.</span></>,
    securityDesc: 'Mentor CRM stores your prospect data securely in the United States, with end-to-end encryption. Compatible with FINRA/DOI standards and your carrier portals.',
    finalCtaHeadline: <>Stop losing policies to <br/><span className="text-mentor-blue">your spreadsheet.</span></>,
    createAccount: 'Start Tracking Your Prospects Free',
    footer: '© 2026 MENTOR CRM. SERVING LIFE PLANNERS IN THE USA.',
    terms: 'Terms',
    privacy: 'Privacy',
    support: 'English Support',
    badge1: 'GDPR & CCPA Compliant',
    badge2: 'FINRA Compatible',
    howItWorksTitle: 'HOW IT WORKS',
    howStep1: 'Add a Referral',
    howStep1Desc: 'A referral comes in. Add name, phone, and product needed. 30 seconds.',
    howStep2: 'Set your Sequence',
    howStep2Desc: 'Mentor CRM reminds you on day 3, 7, 14 — automatically.',
    howStep3: 'Track your Stage',
    howStep3Desc: 'See who\'s ready to schedule, who needs one more call.',
    howStep4: 'Close and Record',
    howStep4Desc: 'Log the policy and carrier. Keep the relationship active for future referrals.',
    socialTitle: 'TRUSTED BY LIFE PLANNERS',
    socialQuote: '"I used to track my prospects on a spreadsheet. After switching to Mentor CRM, I closed 3 policies in my first month just by following up with people I had forgotten about."',
    socialAuthor: '[Nome], Life Planner',
    socialMeta: 'Representing National Life & Pacific Life'
  },
  pt: {
    badge: 'CRM CONSTRUÍDO PARA LIFE PLANNERS',
    heroLine1: 'Suas Indicações Merecem um Sistema',
    heroLine2: 'Melhor que uma Planilha.',
    subHero: 'Mentor CRM ajuda Life Planners a rastrear, fazer follow-up e fechar — sem perder oportunidades. Acompanhe cada prospect entre todas as suas seguradoras.',
    cta: 'Comece a Rastrear Prospects Grátis',
    login: 'ENTRAR',
    demo: 'ASSISTIR DEMO 2-MIN',
    navFeatures: 'Recursos',
    navSolutions: 'Como Funciona',
    navAutomation: 'Nicho',
    navSecurity: 'Segurança',
    feat1Title: 'Pipeline de Precisão',
    feat1Desc: 'Visualize todo o seu pipeline num relance — do primeiro contato à apólice emitida.',
    feat2Title: 'Sequências Automáticas',
    feat2Desc: 'Sequências de follow-up que mantêm você na mente do cliente sem esforço manual.',
    feat3Title: 'Lembretes de Follow-up',
    feat3Desc: 'Configure lembretes para nunca passar mais de X dias sem falar com um prospect quente.',
    captureTitle: 'RELACIONAMENTO PRIMEIRO',
    captureHeadline: <>Capture indicações de qualquer lugar, <br/>para nenhum prospect ser <span className="text-zinc-400">esquecido.</span></>,
    captureDesc: 'Integre com suas fontes de indicação. Registre nomes, telefones e produtos em menos de 30 segundos.',
    newLeadLabel: 'Nova Indicação Recebida',
    assignLabel: 'Rastrear',
    distTitle: 'FEITO PARA LIFE PLANNERS',
    distHeadline: <>Finalmente, um CRM que entende <br/>como <span className="italic font-light">você realmente trabalha.</span></>,
    distDesc: 'Desenvolvido para profissionais independentes, não call centers. Rastreio de relacionamento que segue seu fluxo real.',
    card1Title: 'Foco em Indicações',
    card1Desc: 'Construído para rastrear relacionamentos e indicações, não volume de leads frios.',
    card2Title: 'Suporte Multi-Seguradora',
    card2Desc: 'Marque prospects por seguradora (National Life, Pacific Life, etc) e tipo de produto.',
    card3Title: 'Follow-up Consistente',
    card3Desc: 'Mantenha-se presente para os prospects no momento certo para bater suas metas mensais.',
    statsTitle: 'RESULTADOS NO NICHO',
    statsHeadline: <>Atendendo Life Planners <span className="text-blue-500">nos Estados Unidos.</span></>,
    stat1: 'Apólices Fechadas',
    stat1Val: '+45k',
    stat2: 'Aumento no 1º Mês',
    stat2Val: '35%',
    stat3: 'Tempo Admin Salvo',
    stat3Val: '10h/sem',
    securityTitle: 'ARMAZENAMENTO SEGURO NOS EUA',
    securityHeadline: <>Padrões de <span className="italic font-light">indústria regulada.</span></>,
    securityDesc: 'Mentor CRM armazena seus dados nos EUA com criptografia ponta a ponta. Compatível com padrões FINRA/DOI e portais de seguradoras.',
    finalCtaHeadline: <>Pare de perder apólices para <br/><span className="text-mentor-blue">sua planilha.</span></>,
    createAccount: 'Comece a Rastrear Prospects Grátis',
    footer: '© 2026 MENTOR CRM. ATENDENDO LIFE PLANNERS NOS EUA.',
    terms: 'Termos',
    privacy: 'Privacidade',
    support: 'Suporte em Inglês',
    badge1: 'Conformidade GDPR & CCPA',
    badge2: 'Compatível com FINRA',
    howItWorksTitle: 'COMO FUNCIONA',
    howStep1: 'Adicione uma Indicação',
    howStep1Desc: 'Uma indicação chega. Adicione nome, telefone e produto. 30 segundos.',
    howStep2: 'Defina sua Sequência',
    howStep2Desc: 'O Mentor CRM lembra você no dia 3, 7, 14 — automaticamente.',
    howStep3: 'Acompanhe o Estágio',
    howStep3Desc: 'Veja quem está pronto para agendar, quem precisa de mais uma chamada.',
    howStep4: 'Feche e Registre',
    howStep4Desc: 'Registre a apólice e seguradora. Mantenha o relacionamento ativo para indicações futuras.',
    socialTitle: 'CONFIADO POR LIFE PLANNERS',
    socialQuote: '"Eu usava uma planilha. Após mudar para o Mentor CRM, fechei 3 apólices no meu primeiro mês apenas fazendo follow-up com pessoas que eu tinha esquecido."',
    socialAuthor: '[Nome], Life Planner',
    socialMeta: 'Representando National Life & Pacific Life'
  },
  es: {
    badge: 'CRM CONSTRUIDO PARA LIFE PLANNERS',
    heroLine1: 'Tus Referencias Merecen un Sistema',
    heroLine2: 'Mejor que una Hoja de Cálculo.',
    subHero: 'Mentor CRM ayuda a los Life Planners a rastrear, seguir y cerrar — sin perder oportunidades. Rastrea cada prospecto en todas tus compañías.',
    cta: 'Comienza a Rastrear Prospectos Gratis',
    login: 'ENTRAR',
    demo: 'VER DEMO 2-MIN',
    navFeatures: 'Recursos',
    navSolutions: 'Cómo Funciona',
    navAutomation: 'Nicho',
    navSecurity: 'Seguridad',
    feat1Title: 'Pipeline de Precisión',
    feat1Desc: 'Visualiza todo tu pipeline de un vistazo — desde el primer contacto hasta la póliza emitida.',
    feat2Title: 'Secuencias Automáticas',
    feat2Desc: 'Secuencias de seguimiento que te mantienen en la mente del cliente sin esfuerzo manual.',
    feat3Title: 'Recordatorios de Seguimiento',
    feat3Desc: 'Configura recordatorios para no pasar más de X días sin hablar con un prospecto caliente.',
    captureTitle: 'RELACIONES PRIMERO',
    captureHeadline: <>Captura referencias de cualquier lugar, <br/>para que ningún prospecto se <span className="text-zinc-400">pierda.</span></>,
    captureDesc: 'Integra con tus fuentes de referencia. Registra nombres, teléfonos y productos en menos de 30 segundos.',
    newLeadLabel: 'Nueva Referencia Recibida',
    assignLabel: 'Rastrear',
    distTitle: 'HECHO PARA LIFE PLANNERS',
    distHeadline: <>Finalmente, un CRM que entiende <br/>cómo <span className="italic font-light">realmente trabajas.</span></>,
    distDesc: 'Desarrollado para profesionales independientes, no call centers. Rastreo de relaciones que sigue tu flujo real.',
    card1Title: 'Foco en Referencias',
    card1Desc: 'Construido para rastrear relaciones y referencias, no volumen de leads fríos.',
    card2Title: 'Soporte Multi-Compañía',
    card2Desc: 'Marca prospectos por compañía (National Life, Pacific Life, etc) y tipo de producto.',
    card3Title: 'Seguimiento Consistente',
    card3Desc: 'Mantente presente en el momento adecuado para alcanzar tus metas mensuales.',
    statsTitle: 'RESULTADOS EN EL NICHO',
    statsHeadline: <>Sirviendo a Life Planners en <span className="text-blue-500">los Estados Unidos.</span></>,
    stat1: 'Pólizas Cerradas',
    stat1Val: '+45k',
    stat2: 'Aumento en 1º Mes',
    stat2Val: '35%',
    stat3: 'Tiempo Admin Ahorrado',
    stat3Val: '10h/sem',
    securityTitle: 'ALMACENAMIENTO SEGURO EN EE.UU.',
    securityHeadline: <>Estándares de la <span className="italic font-light">industria regulada.</span></>,
    securityDesc: 'Mentor CRM almacena tus datos en EE.UU. con cifrado de extremo a extremo. Compatible con estándares FINRA/DOI y portales de compañías.',
    finalCtaHeadline: <>Deja de perder pólizas por culpa de <br/><span className="text-mentor-blue">tu hoja de cálculo.</span></>,
    createAccount: 'Comienza a Rastrear Prospectos Gratis',
    footer: '© 2026 MENTOR CRM. SIRVIENDO A LIFE PLANNERS EN EE.UU.',
    terms: 'Términos',
    privacy: 'Privacidad',
    support: 'Soporte en Inglés',
    badge1: 'Conformidad GDPR & CCPA',
    badge2: 'Compatible con FINRA',
    howItWorksTitle: 'CÓMO FUNCIONA',
    howStep1: 'Añade una Referencia',
    howStep1Desc: 'Llega una referencia. Añade nombre, teléfono y producto. 30 segundos.',
    howStep2: 'Define tu Secuencia',
    howStep2Desc: 'Mentor CRM te recuerda en el día 3, 7, 14 — automáticamente.',
    howStep3: 'Sigue el Estado',
    howStep3Desc: 'Mira quién está listo para agendar, quién necesita una llamada más.',
    howStep4: 'Cierra y Registra',
    howStep4Desc: 'Registra la póliza y la compañía. Mantén la relación activa para futuras referencias.',
    socialTitle: 'CONFIADO POR LIFE PLANNERS',
    socialQuote: '"Usaba una hoja de cálculo. Después de cambiar a Mentor CRM, cerré 3 pólizas en mi primer mes solo haciendo seguimiento con personas que había olvidado."',
    socialAuthor: '[Nome], Life Planner',
    socialMeta: 'Representando a National Life & Pacific Life'
  }
};

export function HomeClient() {
  const [activeTab, setActiveTab] = useState(0);
  const [lang, setLang] = useState<keyof typeof translations>('en');

  useEffect(() => {
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1] as keyof typeof translations | undefined;
    if (locale && translations[locale]) {
      setLang(locale);
    }
  }, []);

  const t = translations[lang];

  return (
    <div className="relative min-h-screen w-full bg-zinc-50 text-zinc-900 overflow-x-hidden selection:bg-mentor-blue/10 selection:text-mentor-blue font-sans">

      {/* Background Subtle Atmosphere */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-mentor-teal/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grain-y.com/assets/grain.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Nav: Refactored Global Menu */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)] px-8 py-3 rounded-[2rem] flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Mentor CRM" className="h-15 w-auto" />
          </Link>

          {/* Center Menu */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {[t.navFeatures, t.navSolutions, t.navAutomation, t.navSecurity].map((link, i) => {
              const ids = ['features', 'solutions', 'niche', 'security'];
              return (
                <Link
                  key={link}
                  href={`#${ids[i]}`}
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-mentor-blue transition-colors relative group"
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-mentor-blue transition-all group-hover:w-full"></span>
                </Link>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-mentor-blue transition-colors">
              {t.login}
            </Link>
            <Link
              href="/login"
              className="h-10 px-6 bg-zinc-900 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-mentor-blue transition-all rounded-full flex items-center justify-center whitespace-nowrap shadow-lg"
            >
              {t.demo}
            </Link>
            
            <div className="h-6 w-[1px] bg-zinc-200 hidden sm:block mx-1" />
            
            <LocaleSelector />
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">

        {/* HERO: CRYSTAL COMMAND CENTER */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
          <div className="max-w-7xl w-full text-center relative z-10">

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-zinc-200 shadow-sm"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.4em] text-zinc-800 uppercase leading-none">{t.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(3rem,9vw,6.5rem)] font-bold leading-[0.9] tracking-tight text-zinc-900 mb-10"
            >
              {t.heroLine1} <br />
              <span className="text-mentor-blue italic font-light">{t.heroLine2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed mb-16"
            >
              {t.subHero}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center justify-center gap-6"
            >
              <Link
                href="/login"
                className="group relative inline-flex h-20 items-center gap-6 px-12 bg-zinc-900 text-[11px] font-black uppercase tracking-[0.4em] text-white hover:bg-mentor-blue transition-all duration-500 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                <span>{t.cta}</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                href="#"
                className="group relative inline-flex h-20 items-center gap-6 px-12 bg-white border border-zinc-200 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-900 hover:border-mentor-blue transition-all duration-500 rounded-[2.5rem] shadow-sm"
              >
                <span>{t.demo}</span>
                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-mentor-blue transition-colors">
                  <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-white" />
                </div>
              </Link>
            </motion.div>
          </div>

          {/* AS SEEN ON / TRUSTED BY LOGOS */}
          <div className="absolute bottom-10 left-0 w-full overflow-hidden opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center justify-center gap-12 md:gap-24 px-6 animate-pulse">
                <span className="text-xl font-black tracking-tighter">National Life Group</span>
                <span className="text-xl font-bold tracking-tight">PACIFIC LIFE</span>
                <span className="text-xl font-serif italic">Transamerica</span>
                <span className="text-xl font-black">Prudential</span>
             </div>
          </div>


          {/* Floating UI Elements Decoration */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 right-[5%] bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-2xl shadow-xl hidden xl:block"
            >
              <div className="flex gap-4 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Zap className="h-4 w-4 text-mentor-blue" /></div>
                <div className="space-y-1">
                  <div className="h-2 w-20 bg-zinc-200 rounded" />
                  <div className="h-2 w-12 bg-zinc-100 rounded" />
                </div>
              </div>
              <div className="h-[2px] w-full bg-zinc-100" />
            </motion.div>
          </div>
        </section>



        {/* SECTION: NICHE - BUILT FOR LIFE PLANNERS */}
        <section id="niche" className="py-40 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-mentor-blue uppercase mb-6">{t.distTitle}</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-10 max-w-3xl">
              {t.distHeadline}
            </h3>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed mb-16 max-w-2xl">
              {t.distDesc}
            </p>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: t.card1Title, icon: <Users />, desc: t.card1Desc },
                { title: t.card2Title, icon: <Workflow />, desc: t.card2Desc },
                { title: t.card3Title, icon: <Zap />, desc: t.card3Desc }
              ].map((card, i) => (
                <div key={i} className="bg-white/70 backdrop-blur-2xl border border-white/60 p-12 rounded-[3rem] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-500 text-left">
                  <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                    <div className="text-mentor-blue">{card.icon}</div>
                  </div>
                  <h4 className="text-lg font-bold mb-4 tracking-tight">{card.title}</h4>
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: SOCIAL PROOF / TESTIMONIAL */}
        <section className="py-40 px-6 bg-white overflow-hidden">
          <div className="max-w-5xl mx-auto">
             <div className="flex flex-col items-center text-center space-y-12">
                <div className="h-1 bg-zinc-100 w-24 rounded-full" />
                <h2 className="text-[10px] font-black tracking-[0.5em] text-zinc-400 uppercase">{t.socialTitle}</h2>
                <p className="text-2xl md:text-3xl font-medium italic leading-relaxed text-zinc-800">
                  {t.socialQuote}
                </p>
                <div className="flex flex-col items-center">
                   <div className="h-16 w-16 rounded-full bg-zinc-200 mb-4 overflow-hidden">
                      <img src="https://ui-avatars.com/api/?name=Life+Planner&background=0055A4&color=fff" alt="Life Planner" className="w-full h-full object-cover" />
                   </div>
                   <span className="text-sm font-black uppercase tracking-widest">{t.socialAuthor}</span>
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{t.socialMeta}</span>
                </div>
             </div>
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section id="solutions" className="py-40 px-6 bg-zinc-50">
           <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center text-center mb-20">
                <h2 className="text-[10px] font-black tracking-[0.5em] text-mentor-blue uppercase mb-6">{t.howItWorksTitle}</h2>
                <h3 className="text-4xl md:text-5xl font-bold tracking-tight">4 steps to a consistent pipeline</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                 {[
                   { title: t.howStep1, desc: t.howStep1Desc, icon: "01" },
                   { title: t.howStep2, desc: t.howStep2Desc, icon: "02" },
                   { title: t.howStep3, desc: t.howStep3Desc, icon: "03" },
                   { title: t.howStep4, desc: t.howStep4Desc, icon: "04" }
                 ].map((step, i) => (
                   <div key={i} className="relative group p-8 bg-white border border-zinc-100 rounded-[2rem] shadow-sm hover:shadow-lg transition-all">
                      <span className="text-6xl font-black text-zinc-50 group-hover:text-mentor-blue/5 transition-colors absolute top-4 right-8 select-none">{step.icon}</span>
                      <h4 className="text-lg font-bold mb-4 relative z-10">{step.title}</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-medium relative z-10">{step.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* SECTION: FEATURES AS BENEFITS */}
        <section id="features" className="py-40 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-20">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-mentor-blue uppercase mb-6">{t.navFeatures}</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Relationship tracking, automated.</h3>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
             {[
               { title: t.feat1Title, desc: t.feat1Desc, icon: <BarChart3 /> },
               { title: t.feat2Title, desc: t.feat2Desc, icon: <Workflow /> },
               { title: t.feat3Title, desc: t.feat3Desc, icon: <Zap /> }
             ].map((feat, i) => (
               <div key={i} className="flex flex-col items-center text-center group">
                 <div className="h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-8 group-hover:bg-mentor-blue group-hover:text-white transition-all shadow-sm">
                   {feat.icon}
                 </div>
                 <h4 className="text-xl font-bold mb-4 tracking-tight">{feat.title}</h4>
                 <p className="text-zinc-500 font-medium leading-relaxed">{feat.desc}</p>
               </div>
             ))}
          </div>
        </section>

        {/* STATS: DATA COMMAND */}
        <section id="stats" className="py-40 px-6 bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_20%_30%,#0055A4_0%,transparent_50%)]"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center mb-20">
              <h2 className="text-[10px] font-black tracking-[0.5em] text-blue-400 uppercase mb-6">{t.statsTitle}</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">{t.statsHeadline}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
              {[
                { label: t.stat1, val: t.stat1Val },
                { label: t.stat2, val: t.stat2Val },
                { label: t.stat3, val: t.stat3Val }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mb-6 shadow-[0_0_10px_#0055A4]" />
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-4">{stat.label}</h4>
                  <p className="text-7xl font-light tracking-tighter text-white">{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECURITY: TRUST ASSET */}
        <section id="security" className="py-40 px-6">
          <div className="max-w-5xl mx-auto bg-white border border-zinc-200 rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-blue-500/5 -rotate-12 translate-x-1/2 rounded-full"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
              <div className="h-32 w-32 bg-zinc-900 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl">
                <Lock className="h-12 w-12 text-white" />
              </div>
              <div>
                <h2 className="text-[10px] font-black tracking-[0.5em] text-mentor-blue uppercase mb-6">{t.securityTitle}</h2>
                <h3 className="text-3xl font-bold tracking-tight mb-6">{t.securityHeadline}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed max-w-xl">
                  {t.securityDesc}
                </p>
                <div className="flex gap-8 mt-10">
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> {t.badge1}
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t.badge2}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA: THE CALL TO ACTION */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-10">
              {t.finalCtaHeadline}
            </h2>
            <Link
              href="/login"
              className="group relative inline-flex h-20 items-center justify-center px-16 bg-zinc-900 text-[11px] font-black uppercase tracking-[0.5em] text-white hover:bg-mentor-blue transition-all duration-500 rounded-full shadow-2xl"
            >
              {t.createAccount}
            </Link>
          </div>
        </section>

      </main>

      <footer className="py-20 px-6 border-t border-zinc-200 relative z-10 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex flex-col items-center md:items-start gap-6">
            <img src="/logo.png" alt="Mentor CRM" className="h-20 w-auto opacity-80" />
            <p className="text-[10px] font-bold text-zinc-400 tracking-[0.3em] uppercase">{t.footer}</p>
          </div>

          <div className="flex gap-12 text-[13px] font-bold text-zinc-500 tracking-[0.2em] uppercase">
            <Link href="/terms" className="hover:text-mentor-blue transition-colors">{t.terms}</Link>
            <Link href="/privacy" className="hover:text-mentor-blue transition-colors">{t.privacy}</Link>
            <Link href="#" className="hover:text-mentor-blue transition-colors">{t.support}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
