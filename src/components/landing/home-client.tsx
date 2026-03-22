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

const translations = {
  pt: {
    badge: 'ARQUITETURA DE ELITE EM GESTÃO DE LEADS',
    heroLine1: 'Domine sua operação de',
    heroLine2: 'leads com precisão.',
    subHero: 'A plataforma definitiva para agências e times de vendas de alta performance. Capture, distribua e converta com tecnologia preditiva e automação multicanal.',
    cta: 'INICIE SUA OPERAÇÃO',
    login: 'ENTRAR',
    demo: 'TESTE GRÁTIS',

    // Sections
    navFeatures: 'Recursos',
    navSolutions: 'Soluções',
    navAutomation: 'Automação',
    navSecurity: 'Segurança',

    feat1Title: 'Pipeline de Precisão',
    feat1Desc: 'Visualize seu fluxo de vendas com clareza absoluta através de colunas dinâmicas e tags inteligentes de alta resolução.',
    feat2Title: 'Automação sem Atrito',
    feat2Desc: 'O sistema trabalha enquanto você foca no fechamento. Agendamentos e lembretes automáticos via WhatsApp.',
    feat3Title: 'Inteligência de Dados',
    feat3Desc: 'Métricas que importam. Conversão por canal, performance de agentes e projeção de receita em tempo real.',

    // New Content
    captureTitle: 'ATRAÇÃO MULTICANAL SEM ATRITO',
    captureDesc: 'Capture leads exatamente onde eles estão. Integre instantaneamente com WhatsApp, Meta Ads, Landing Pages e APIs customizadas.',
    distTitle: 'DISTRIBUIÇÃO INTELIGENTE',
    distDesc: 'Elimine o tempo de espera. Nossa lógica de roteamento entrega o lead certo para o agente de melhor performance no exato momento do interesse.',

    statsTitle: 'MÉTRICAS QUE IMPULSIONAM O CRESCIMENTO',
    stat1: 'Leads Processados',
    stat1Val: '+2.4M',
    stat2: 'Taxa de Conversão',
    stat2Val: '28%',
    stat3: 'Tempo de Resposta',
    stat3Val: '< 2min',

    securityTitle: 'SEGURANÇA DE NÍVEL EMPRESARIAL',
    securityDesc: 'Sua base de dados é seu maior ativo. Protegemos tudo com criptografia ponta a ponta e isolamento total de dados.',

    createAccount: 'INICIE SUA OPERAÇÃO',
    footer: '© 2026 MENTOR CRM. PRECISION-ENGINEERED FOR GROWTH.'
  }
};

export function HomeClient() {
  const [activeTab, setActiveTab] = useState(0);
  const t = translations.pt;

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
            {['Features', 'Solutions', 'Automation', 'Security'].map((link) => (
              <Link
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-mentor-blue transition-colors relative group"
              >
                {link}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-mentor-blue transition-all group-hover:w-full"></span>
              </Link>
            ))}
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
            </motion.div>
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

        {/* SECTION: MULTI-CHANNEL INBOUND */}
        <section id="features" className="py-40 px-6 bg-white relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div>
              <h2 className="text-[10px] font-black tracking-[0.5em] text-mentor-blue uppercase mb-6">{t.captureTitle}</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 leading-tight">
                Capture cada oportunidade, <br />de qualquer <span className="text-zinc-400">canal.</span>
              </h3>
              <p className="text-lg text-zinc-500 font-medium leading-relaxed mb-12">
                {t.captureDesc}
              </p>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: <MessageSquare />, label: 'WhatsApp Direct' },
                  { icon: <Globe />, label: 'Web Forms 2.0' },
                  { icon: <Target />, label: 'Meta Ads Sync' },
                  { icon: <Layers />, label: 'API Integrations' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-mentor-blue group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-800">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/5 rounded-[4rem] blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="relative bg-zinc-50 border border-zinc-200 rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-video flex items-center justify-center">
                <img src="/logo.png" alt="Visual" className="w-[40%] opacity-10 mix-blend-multiply" />
                <div className="absolute bottom-8 left-8 right-8 h-32 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest leading-none mb-2">Novo Lead Recebido</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">WhatsApp Business API</p>
                    </div>
                  </div>
                  <div className="h-10 px-6 bg-zinc-900 rounded-full flex items-center text-[9px] font-black text-white uppercase tracking-widest">Atribuir</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: DISTRIBUTION LOGIC */}
        <section id="automation" className="py-40 px-6">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <h2 className="text-[10px] font-black tracking-[0.5em] text-mentor-blue uppercase mb-6">{t.distTitle}</h2>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-10 max-w-3xl">
              Elimine o tempo de espera. <br />Atribua leads com <span className="italic font-light">inteligência.</span>
            </h3>
            <p className="text-lg text-zinc-500 font-medium leading-relaxed mb-16 max-w-2xl">
              {t.distDesc}
            </p>

            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: 'Filas Dinâmicas', icon: <Users />, desc: 'Organize leads por região, produto ou valor estipulado.' },
                { title: 'Round-Robin', icon: <Workflow />, desc: 'Distribuição justa e balanceada entre todo o seu time.' },
                { title: 'Priority Route', icon: <Zap />, desc: 'Leads VIP entregues instantaneamente para seus top closers.' }
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

        {/* STATS: DATA COMMAND */}
        <section id="solutions" className="py-40 px-6 bg-zinc-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_20%_30%,#0055A4_0%,transparent_50%)]"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col items-center text-center mb-20">
              <h2 className="text-[10px] font-black tracking-[0.5em] text-blue-400 uppercase mb-6">{t.statsTitle}</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">Decisões baseadas em <span className="text-blue-500">evidências.</span></h3>
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
                <h3 className="text-3xl font-bold tracking-tight mb-6">Seus dados são seu maior <span className="italic font-light">patrimônio.</span></h3>
                <p className="text-zinc-500 font-medium leading-relaxed max-w-xl">
                  {t.securityDesc} Integridade total, backups redundantes e conformidade com padrões globais de privacidade.
                </p>
                <div className="flex gap-8 mt-10">
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> End-to-end Encryption
                  </span>
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Isolated Environments
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
              A era da gestão intuitiva <br /><span className="text-mentor-blue">começa hoje.</span>
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
            <Link href="/terms" className="hover:text-mentor-blue transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-mentor-blue transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-mentor-blue transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
