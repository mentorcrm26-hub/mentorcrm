'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, CheckCircle2, KanbanSquare, Calendar, MessageSquare, Briefcase, Globe, ShieldCheck, Zap, Layers, BarChart3, Database, Workflow } from 'lucide-react';

const translations = {
  pt: {
    login: 'Entrar',
    trial: 'Teste Grátis',
    badge: 'STEALTH CRM FOR FINANCE',
    headline: 'Domine seus leads financeiros com precisão absoluta.',
    subheadline: 'Construído para Agentes de elite. Organize leads, automatize fluxos multicanal e acelere fechamentos com inteligência preditiva.',
    cta: 'Inicie sua ascensão',
    preview: 'Dashboard Interface',
    featuresTitle: 'Performance sem concessões',
    featuresSub: 'Arquitetura de alto desempenho para o mercado financeiro.',
    feat1Title: 'Fluxo Assíncrono',
    feat1Desc: 'Gestão visual de pipelines que acompanha a velocidade do mercado.',
    feat2Title: 'Motor de Automação',
    feat2Desc: 'Sequências inteligentes em canais críticos: WhatsApp, SMS e Voz.',
    feat3Title: 'Inteligência Temporal',
    feat3Desc: 'Lembretes preditivos e automações sazonais orientadas a dados.',
    pricingTitle: 'Acesso Mentor',
    pricingDesc: 'A infraestrutura completa para sua operação.',
    pItem1: 'Pipeline Ilimitado',
    pItem2: 'Nexus Multicanal',
    pItem3: 'Automações Customizadas',
    pItem4: 'Suporte Elite 24/7',
    onePlan: 'PLANO ÚNICO. PODER TOTAL.',
    trialBadge: 'V3.0',
    createAccount: 'Adquirir Licença',
    trialDesc: 'Teste beta disponível por 3 dias. Vagas limitadas.',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE',
    terms: 'Termos de Serviço',
    privacy: 'Política de Privacidade'
  },
  en: {
    login: 'Log in',
    trial: 'Free Trial',
    badge: 'STEALTH CRM FOR FINANCE',
    headline: 'Master financial leads with absolute precision.',
    subheadline: 'Built for elite Agents. Organize leads, automate multichannel workflows, and accelerate closures with predictive intelligence.',
    cta: 'Start your ascent',
    preview: 'Dashboard Interface',
    featuresTitle: 'Uncompromising Performance',
    featuresSub: 'High-performance architecture for the financial market.',
    feat1Title: 'Asynchronous Flow',
    feat1Desc: 'Visual pipeline management that matches market speed.',
    feat2Title: 'Automation Engine',
    feat2Desc: 'Intelligent sequences across critical channels: WhatsApp, SMS, and Voice.',
    feat3Title: 'Temporal Intelligence',
    feat3Desc: 'Predictive reminders and data-driven seasonal automations.',
    pricingTitle: 'Mentor Access',
    pricingDesc: 'The complete infrastructure for your operation.',
    pItem1: 'Unlimited Pipeline',
    pItem2: 'Multichannel Nexus',
    pItem3: 'Custom Automations',
    pItem4: '24/7 Elite Support',
    onePlan: 'ONE PLAN. FULL POWER.',
    trialBadge: 'V3.0',
    createAccount: 'Get License',
    trialDesc: 'Beta trial available for 3 days. Limited slots.',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy'
  },
  es: {
    login: 'Acceso',
    trial: 'Prueba Gratis',
    badge: 'STEALTH CRM PARA FINANZAS',
    headline: 'Domine sus potenciales financieros con precisión absoluta.',
    subheadline: 'Construido para Agentes de élite. Organice leads, automatice flujos multicanal y acelere cierres con inteligencia predictiva.',
    cta: 'Inicie su ascenso',
    preview: 'Interfaz de Dashboard',
    featuresTitle: 'Rendimiento sin concesiones',
    featuresSub: 'Arquitectura de alto rendimiento para el mercado financiero.',
    feat1Title: 'Flujo Asíncrono',
    feat1Desc: 'Gestión visual de flujos que iguala la velocidad del mercado.',
    feat2Title: 'Motor de Automatización',
    feat2Desc: 'Secuencias inteligentes en canales críticos: WhatsApp, SMS y Voz.',
    feat3Title: 'Inteligencia Temporal',
    feat3Desc: 'Recordatorios predictivos y automatizaciones estacionales guiadas por datos.',
    pricingTitle: 'Acceso Mentor',
    pricingDesc: 'La infraestructura completa para su operación.',
    pItem1: 'Pipeline Ilimitado',
    pItem2: 'Nexus Multicanal',
    pItem3: 'Automatizaciones a Medida',
    pItem4: 'Soporte de Élite 24/7',
    onePlan: 'PLAN ÚNICO. PODER TOTAL.',
    trialBadge: 'V3.0',
    createAccount: 'Obtener Licencia',
    trialDesc: 'Prueba beta por 3 días. Cupos limitados.',
    footer: 'MENTOR CRM // ARCHITECTURE FOR PERFORMANCE',
    terms: 'Términos de Servicio',
    privacy: 'Política de Privacidad'
  }
};

type Language = 'pt' | 'en' | 'es';

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('pt');
  const t = translations[lang];

  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F9F9F9] selection:bg-emerald-500/30 font-sans flex flex-col overflow-x-hidden">
      {/* Background Noise/Grid Texture */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
              <Workflow className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tighter uppercase">Mentor CRM</span>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-100 transition-colors uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation">
                <Globe className="h-3.5 w-3.5" />
                <span>{lang}</span>
              </button>
              <div className="absolute right-0 top-full mt-3 w-40 origin-top-right border border-white/[0.08] bg-[#111] p-1 shadow-2xl backdrop-blur-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {(['pt', 'en', 'es'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000`; }}
                    className="block w-full px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-800 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation"
                  >
                    {l === 'pt' ? 'Português' : l === 'en' ? 'English' : 'Español'}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation">
              {t.login}
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-9 items-center justify-center border border-white px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation"
            >
              {t.trial}
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 z-10">
        {/* ASYMMETRIC HERO SECTION */}
        <section className="relative pt-32 lg:pt-48 pb-16 lg:pb-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-start">

              {/* Left Column: 90% Vertical Tension */}
              <motion.div
                style={{ opacity, scale }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full lg:w-3/5"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold tracking-[0.2em] text-emerald-400 mb-8 uppercase">
                  <Zap className="h-3 w-3" />
                  {t.badge}
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold leading-[0.95] tracking-tighter mb-8 max-w-2xl">
                  {t.headline.split(' ').map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + (i * 0.05) }}
                      className={word === 'precisão' || word === 'precision' || word === 'precisión' ? 'text-emerald-500 block lg:inline' : 'inline-block mr-3'}
                    >
                      {word}
                    </motion.span>
                  ))}
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="max-w-xl text-lg text-[#A1A1A1] mb-12 leading-relaxed"
                >
                  {t.subheadline}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Link
                    href="/demo"
                    className="group relative inline-flex h-14 items-center gap-4 border border-emerald-500/50 bg-emerald-500/5 px-10 text-xs font-bold uppercase tracking-widest text-emerald-400 transition-colors hover:bg-emerald-500 hover:text-black overflow-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      {t.cta}
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Column: Interactive Dashboard Mockup - BLEEDING OFF */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full lg:w-1/2 lg:absolute right-[-100px] top-64 pointer-events-none"
              >
                <div className="relative p-1 bg-zinc-900 border border-white/[0.05] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] rotate-2 hover:rotate-0 transition-transform duration-1000">
                  <div className="bg-[#0b0b0b] w-full aspect-[4/3] relative overflow-hidden flex flex-col">
                    {/* Mockup Header */}
                    <div className="h-10 border-b border-white/[0.05] px-4 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                      </div>
                      <div className="w-1/3 h-2 bg-zinc-900 opacity-50"></div>
                    </div>
                    {/* Mockup Content */}
                    <div className="flex-1 p-6 grid grid-cols-4 gap-4">
                      <div className="col-span-1 space-y-4">
                        <div className="h-4 w-full bg-emerald-500/20"></div>
                        <div className="h-32 w-full bg-zinc-900 border border-white/[0.03]"></div>
                        <div className="h-32 w-full bg-zinc-900 border border-white/[0.03]"></div>
                      </div>
                      <div className="col-span-3 space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-20 bg-emerald-500/5 border border-emerald-500/20"></div>
                          <div className="h-20 bg-zinc-900 border border-white/[0.03]"></div>
                          <div className="h-20 bg-zinc-900 border border-white/[0.03]"></div>
                        </div>
                        <div className="flex-1 bg-zinc-900 border border-white/[0.03] p-4 flex flex-col gap-3">
                          {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-4 bg-zinc-800/40 w-full" style={{ width: `${90 - (i * 10)}%` }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Interaction Glow */}
                    <div className="absolute right-[10%] top-[20%] w-[30%] h-[40%] bg-emerald-500/10 blur-[120px]"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FRAGMENTED FEATURES */}
        <section className="mx-auto mt-24 lg:mt-64 max-w-[1400px] px-6 lg:px-8 pb-32">
          <div className="mb-24 flex flex-col lg:flex-row justify-between items-end gap-10 border-b border-white/[0.08] pb-12">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase mb-4">{t.featuresTitle}</h2>
              <p className="text-zinc-500 uppercase text-xs tracking-widest font-bold">{t.featuresSub}</p>
            </div>
            <div className="hidden lg:block text-[8rem] font-bold text-white/[0.03] leading-none select-none -mb-16">PERFORMANCE</div>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: <KanbanSquare className="h-6 w-6 text-emerald-400" />,
                title: t.feat1Title,
                desc: t.feat1Desc,
                index: '01'
              },
              {
                icon: <Workflow className="h-6 w-6 text-emerald-400" />,
                title: t.feat2Title,
                desc: t.feat2Desc,
                index: '02'
              },
              {
                icon: <Calendar className="h-6 w-6 text-emerald-400" />,
                title: t.feat3Title,
                desc: t.feat3Desc,
                index: '03'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative flex flex-col p-8 border border-white/[0.05] bg-zinc-900/10 hover:bg-zinc-900/40 transition-colors duration-500"
              >
                <div className="absolute top-4 right-4 text-xs font-bold text-zinc-700 font-mono tracking-widest">{feature.index}</div>
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center bg-zinc-900 border border-white/[0.08] group-hover:border-emerald-500/50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#F9F9F9]">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* NUMERICAL DATA / BAR CHART CONCEPT */}
        <section className="bg-zinc-950 py-32 border-y border-white/[0.05]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
            {[
              { label: 'Latency', value: '14ms', icon: <Zap className="w-4 h-4" /> },
              { label: 'Uptime', value: '99.9%', icon: <Layers className="w-4 h-4" /> },
              { label: 'Scale', value: '10M+', icon: <Database className="w-4 h-4" /> },
              { label: 'ROI Avg', value: '+42%', icon: <BarChart3 className="w-4 h-4" /> },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-3 p-8 border border-white/[0.05] bg-zinc-900/10 relative group hover:bg-zinc-900/40 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-0 bg-emerald-500 group-hover:h-full transition-all duration-300"></div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  <span className="p-1.5 bg-zinc-900 border border-white/[0.08] text-emerald-500">{stat.icon}</span>
                  {stat.label}
                </div>
                <div className="text-4xl font-bold tracking-tighter text-white group-hover:text-emerald-500 transition-colors">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING (STEALTH CARD) */}
        <section className="mx-auto mt-48 max-w-5xl px-6 lg:px-8 mb-48">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative border border-white/[0.08] bg-zinc-900/20 p-12 lg:p-20 overflow-hidden"
          >
            <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-16 relative z-10">
              <div className="max-w-md">
                <div className="text-[10px] font-bold text-emerald-500 tracking-[0.3em] uppercase mb-4">{t.trialBadge} AVAILABLE</div>
                <h3 className="text-4xl lg:text-6xl font-bold tracking-tighter text-white mb-6 uppercase">{t.pricingTitle}</h3>
                <p className="text-zinc-500 mb-8 uppercase text-xs tracking-widest leading-loose">{t.pricingDesc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[t.pItem1, t.pItem2, t.pItem3, t.pItem4].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-auto flex flex-col items-center bg-zinc-950 p-10 border border-white/[0.08] shadow-2xl">
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mb-8">{t.onePlan}</p>
                <Link
                  href="/signup"
                  className="w-full lg:min-w-[240px] inline-flex h-14 items-center justify-center bg-white px-8 text-xs font-extrabold uppercase tracking-widest text-black transition-colors hover:bg-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation"
                >
                  {t.createAccount}
                </Link>
                <p className="mt-6 text-[9px] text-zinc-600 uppercase tracking-widest text-center">{t.trialDesc}</p>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/[0.08] py-16 text-center text-zinc-600 bg-[#050505] z-10 flex flex-col items-center">
        <div className="flex justify-center mb-8 opacity-20">
          <ShieldCheck className="h-10 w-10" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6">© {new Date().getFullYear()} {t.footer}</p>
        <div className="flex justify-center items-center gap-6">
          <Link href="/terms" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation">
            {t.terms}
          </Link>
          <span className="text-zinc-800">•</span>
          <Link href="/privacy" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none touch-manipulation">
            {t.privacy}
          </Link>
        </div>
      </footer>
    </div>
  );
}
