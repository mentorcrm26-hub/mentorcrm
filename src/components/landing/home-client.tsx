'use client';

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


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
  Lock,
  Star,
  Clock,
  AlertCircle,
  Plus,
  Check,
  ChevronDown,
  Shield,
  Play,
  Facebook,
  Instagram
} from 'lucide-react';
import { LocaleSelector } from './locale-selector';
import { PublicMobileNav } from './public-mobile-nav';

const translations = {
  en: {
    navFeatures: 'Features',
    navHowItWorks: 'How It Works',
    navPricing: 'Pricing',
    navStartFree: 'Start Free — No Card Needed',
    badge: 'Built for Life Planners and Insurance Professionals',
    heroHeadline: 'Stop Losing Policies to a Spreadsheet',
    heroSub: 'Mentor CRM gives Life Planners a referral-tracking system that follows up automatically — so the only reason a prospect doesn\'t close is because they said no, not because you forgot them.',
    heroCtaPrimary: 'EXPLORE THE SANDBOX',
    heroCtaSecondary: 'Watch the 2-Minute Walkthrough →',
    heroSocial: '★★★★★ 4.9/5 from 150 Life Planners | 45,000+ policies tracked | No credit card required',
    
    // Pain Section
    painTitle: 'The Spreadsheet Is Where Referrals Go to Die',
    painCard1Title: '"You forgot to follow up — again."',
    painCard1Desc: 'A warm referral from three months ago. You meant to call. It\'s still in row 47 of your spreadsheet with no follow-up date. They bought from someone else.',
    painCard2Title: '"Your pipeline is a lie."',
    painCard2Desc: 'You have no idea which prospects are ready to schedule, which ones went cold, or how many policies you have in progress. You\'re guessing.',
    painCard3Title: '"You\'re spending 10 hours a week on admin."',
    painCard3Desc: 'Updating spreadsheets. Writing reminder emails to yourself. None of that closes policies.',
    painClosing: 'If you are running your referral business on a spreadsheet, you are not running a business. You are running a memory contest — and memory always loses.',

    // Stats Bar
    statPolicies: '45,000+ Policies Tracked Inside Mentor CRM',
    statIncrease: '35% Avg. Increase in Closings — First Month',
    statTime: '10 hrs Per Week Saved on Admin Work',
    statRating: '4.9★ Average Rating from 150 Life Planners',

    // How It Works
    howTitle: 'HOW IT WORKS',
    howStep1: '01 — Add Your Referral — 30 Seconds',
    howStep1Desc: 'Takes less time than typing a row in your spreadsheet.',
    howStep2: '02 — Your Follow-Up Sequence Starts Automatically',
    howStep2Desc: 'Triggers reminders Day 3, 7 and 14. You don\'t need to remember.',
    howStep3: '03 — See Exactly Who Is Ready to Schedule',
    howStep3Desc: 'Cold, warm, scheduled, pending policy. No more guessing.',
    howStep4: '04 — Close and Log in 15 Seconds',
    howStep4Desc: 'Mark policy issued, log carrier, record product type.',

    // Features
    featTitle: 'Relationship tracking, automated.',
    feat1Title: 'Track Relationships, Not Cold Leads',
    feat1Desc: 'Every contact is tied to who sent them and what they need.',
    feat2Title: 'Tag Every Prospect by Carrier and Product',
    feat2Desc: 'National Life, Pacific Life, Transamerica, Prudential — or custom.',
    feat3Title: 'Never Let a Warm Prospect Go Cold',
    feat3Desc: 'Set max days between touches. Mentor CRM brings them to the top automatically.',
    feat4Title: 'A Real Pipeline — Not a Color-Coded Spreadsheet',
    feat4Desc: 'See close rate, carrier conversion, and where your revenue is coming from.',
    feat5Title: 'Follow-Up Sequences That Run Without You',
    feat5Desc: 'Pre-built for Days 3, 7, 14, 30. Custom by product type.',
    feat6Title: 'Never Go More than X Days Without a Touch',
    feat6Desc: 'You define the rule. The system ensures you follow it.',

    // Testimonials
    testTitle: 'What Life Planners Are Saying',
    testSub: 'These are not CRM power users. These are independent Life Planners who wanted to stop losing referrals.',
    test1: '"I used to track my prospects in a spreadsheet and I was constantly letting warm prospects go cold on follow-ups. After switching to Mentor CRM, I closed 3 policies in my first month — just by following up with people I had already forgotten about."',
    test1Author: 'James R.',
    test1Meta: 'Life Planner | National Life & Pacific Life | Florida',
    test2: '"Before Mentor CRM, I had no idea what my pipeline looked like. Now I know exactly who to call every morning. I closed 5 policies last week alone."',
    test2Author: 'Sarah M.',
    test2Meta: 'Life Planner | Transamerica | Texas',
    test3: '"I was spending 10 hours a week updating my spreadsheet. Now it takes me 30 seconds after a call. I finally have my weekends back."',
    test3Author: 'Michael D.',
    test3Meta: 'Life Planner | Prudential | California',

    // Objection Killer
    objTitle: 'You\'re Probably Thinking One of These Things',
    obj1Q: '"I don\'t have time to learn a new system."',
    obj1A: 'Add your first referral in 30 seconds. No training, no onboarding call needed.',
    obj2Q: '"My spreadsheet already works."',
    obj2A: 'Your spreadsheet doesn\'t send reminders. It doesn\'t surface prospects automatically. You don\'t notice the loss — it just doesn\'t appear.',
    obj3Q: '"I\'ve tried CRMs before and they\'re too complicated."',
    obj3A: 'Mentor CRM wasn\'t built for teams of 50. It was built for you — a Life Planner with a referral business. It comes pre-structured.',
    obj4Q: '"What if I don\'t like it?"',
    obj4A: 'Start free. No card. If you use it for 30 days and don\'t close anything extra — email us and we\'ll show you what to adjust.',

    // Pricing
    priceTitle: 'PRICING & PLANS',
    priceSub: 'Start with a sandbox test-drive. No credit card required.',
    tier1Name: 'SANDBOX (DEMO)',
    tier1Price: '$0',
    tier1Feat1: 'Live Dashboard (Mocked)',
    tier1Feat2: 'Menu Simulation',
    tier1Feat3: 'Read-only Features',
    tier1Feat4: 'Visual Exploration',
    tier1Cta: 'EXPLORE THE SANDBOX',
    tier2Name: 'AGENT (SOLO)',
    tier2Price: '$59/mo',
    tier2PriceYearly: 'or $490/year',
    tier2Feat1: 'Unlimited Leads',
    tier2Feat2: 'Email & SMS Automation',
    tier2Feat3: '(SMS automation without support)',
    tier2Feat4: 'Advanced Analytics',
    tier2Feat5: 'Automations',
    tier2Cta: 'START 3-DAY REAL TRIAL',
    tier3Name: 'TEAM (AGENCY)',
    tier3Price: '$99/mo',
    tier3Meta: '(3 agents included)',
    tier3Feat1: '3 WhatsApp Connections',
    tier3Feat2: 'Automations',
    tier3Feat3: 'Ranking & Stats',
    tier3Feat4: 'Priority Onboarding',
    tier3Feat5: 'Lead Distribution',
    tier3Feat6: 'Email & SMS Automation (with support)',
    tier3Cta: 'TALK TO SALES / TEAM',
    mostPopular: 'Most Popular',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faq1Q: 'Is it really made for Life Planners or is it a generic CRM?',
    faq1A: 'It\'s built specifically for the referral-based workflow of Life Planners. No cold lead features, no call center queues, no unnecessary complexity.',
    faq2Q: 'I already use Salesforce/HubSpot. Why change?',
    faq2A: 'Generic CRMs need a dedicated admin to work well. Mentor CRM works on Day 1 because it\'s pre-built for your specific business model.',
    faq3Q: 'How does the Sandbox mode work?',
    faq3A: 'It allows you to explore the full power of Mentor CRM with pre-loaded mock data. You can see the dashboard, menus, and automations in action without needing to connect your real contacts until you are ready.',
    faq4Q: 'Can I import my current spreadsheet?',
    faq4A: 'Yes. We have a simple CSV import tool and a 1-page guide inside the app to help you migrate in minutes.',
    faq5Q: 'What does "FINRA Compatible" mean in practice?',
    faq5A: 'Our log structure aligns with common books-and-records requirements. It doesn\'t replace your firm\'s compliance system, but it makes record-keeping easier.',
    faq6Q: 'Does it connect with carrier portals?',
    faq6A: 'Not directly via API yet. You log your policy status manually in 15 seconds. Direct integrations are on our roadmap.',
    faq7Q: 'Is my data secure?',
    faq7A: 'Yes. U.S.-based servers, end-to-end encryption, and GDPR/CCPA compliance. You can export or delete your data at any time.',
    faq8Q: 'What if I have more than 3 people on my team?',
    faq8A: 'Our Team plan includes 3 seats. You can add more as needed. For large agencies, contact us for custom enterprise pricing.',

    // Final CTA
    finalTitle: 'The Referral You Got This Week Will Not Wait Forever',
    finalSub: 'Every day a warm prospect sits in your spreadsheet without a follow-up is a day closer to them buying from someone else. Start free. No card.',
    finalCta: 'Start Free — Build Your Pipeline in 10 Minutes',
    finalFoot: 'Joins 150+ Life Planners already using Mentor CRM. Cancel anytime.',

    // Footer
    login: 'Login',
    terms: 'Terms',
    privacy: 'Privacy',
    support: 'English Support',
    footerText: '© 2026 MENTOR CRM. SERVING LIFE PLANNERS IN THE USA.'
  },
  pt: {
    navFeatures: 'Recursos',
    navHowItWorks: 'Como Funciona',
    navPricing: 'Preços',
    navStartFree: 'Comece Grátis — Sem Cartão',
    badge: 'Feito para Life Planners e Profissionais de Seguros',
    heroHeadline: 'Pare de Perder Apólices para uma Planilha',
    heroSub: 'O Mentor CRM oferece aos Life Planners um sistema de rastreamento de indicações que faz follow-up automaticamente — para que a única razão de um prospect não fechar seja porque ele disse não, não porque você o esqueceu.',
    heroCtaPrimary: 'EXPLORAR O MODO SANDBOX',
    heroCtaSecondary: 'Assista à Demonstração de 2 Minutos →',
    heroSocial: '★★★★★ 4.9/5 de 150 Life Planners | 45.000+ apólices rastreadas | Sem cartão de crédito',
    
    painTitle: 'A Planilha é Onde as Indicações Morrem',
    painCard1Title: '"Você esqueceu do follow-up — de novo."',
    painCard1Desc: 'Uma indicação quente de três meses atrás. Você pretendia ligar. Ainda está na linha 47 da sua planilha sem data de retorno. Eles compraram de outra pessoa.',
    painCard2Title: '"Seu pipeline é uma mentira."',
    painCard2Desc: 'Você não tem ideia de quais prospects estão prontos para agendar, quais esfriaram ou quantas apólices estão em andamento. Você está chutando.',
    painCard3Title: '"Você gasta 10 horas por semana em admin."',
    painCard3Desc: 'Atualizando planilhas. Escrevendo lembretes para você mesmo. Nada disso fecha apólices.',
    painClosing: 'Se você gerencia seu negócio de indicações em uma planilha, você não gerencia um negócio. Você gerencia um concurso de memória — e a memória sempre perde.',

    statPolicies: '45.000+ Apólices Rastradas no Mentor CRM',
    statIncrease: '35% de Aumento Médio em Fechamentos — 1º Mês',
    statTime: '10 horas por semana economizadas em admin',
    statRating: '4.9★ Avaliação Média de 150 Life Planners',

    howTitle: 'COMO FUNCIONA',
    howStep1: '01 — Adicione sua Indicação — 30 Segundos',
    howStep1Desc: 'Leva menos tempo do que digitar uma linha na sua planilha.',
    howStep2: '02 — Sua Sequência de Follow-Up Começa Automaticamente',
    howStep2Desc: 'Dispara lembretes nos Dias 3, 7 e 14. Você não precisa lembrar.',
    howStep3: '03 — Veja Exatamente Quem Está Pronto para Agendar',
    howStep3Desc: 'Frio, morno, agendado, apólice pendente. Sem mais achismos.',
    howStep4: '04 — Feche e Registre em 15 Segundos',
    howStep4Desc: 'Marque apólice emitida, registre a seguradora e o tipo de produto.',

    featTitle: 'Rastreamento de relacionamento, automatizado.',
    feat1Title: 'Rastreie Relacionamentos, não Leads Frios',
    feat1Desc: 'Cada contato está ligado a quem o enviou e do que ele precisa.',
    feat2Title: 'Marque cada Prospect por Seguradora e Produto',
    feat2Desc: 'National Life, Pacific Life, Transamerica, Prudential — ou personalizado.',
    feat3Title: 'Nunca Deixe um Prospect Quente Esfriar',
    feat3Desc: 'Defina dias máximos entre contatos. O CRM os traz para o topo automaticamente.',
    feat4Title: 'Um Pipeline Real — Não uma Planilha Colorida',
    feat4Desc: 'Veja taxa de fechamento, conversão por seguradora e de onde vem sua receita.',
    feat5Title: 'Sequências de Follow-Up que Rodam sem Você',
    feat5Desc: 'Prontas para os Dias 3, 7, 14, 30. Customizadas por produto.',
    feat6Title: 'Nunca Fique Mais de X Dias sem um Contato',
    feat6Desc: 'Você define a regra. O sistema garante que você a cumpra.',

    testTitle: 'O Que os Life Planners Estão Dizendo',
    testSub: 'Estes não são usuários avançados de CRM. São Life Planners independentes que queriam parar de perder indicações.',
    test1: '"Eu costumava rastrear meus prospects em uma planilha e constantemente deixava prospects quentes esfriarem. Após mudar para o Mentor CRM, fechei 3 apólices no meu primeiro mês — apenas fazendo follow-up com pessoas que eu já tinha esquecido."',
    test1Author: 'James R.',
    test1Meta: 'Life Planner | National Life & Pacific Life | Flórida',
    test2: '"Antes do Mentor CRM, eu não tinha ideia de como era meu pipeline. Agora sei exatamente para quem ligar toda manhã. Fechei 5 apólices só na semana passada."',
    test2Author: 'Sarah M.',
    test2Meta: 'Life Planner | Transamerica | Texas',
    test3: '"Eu gastava 10 horas por semana atualizando minha planilha. Agora levo 30 segundos após uma chamada. Finalmente tenho meus fins de semana de volta."',
    test3Author: 'Michael D.',
    test3Meta: 'Life Planner | Prudential | Califórnia',

    objTitle: 'Você Provavelmente Está Pensando em Uma Dessas Coisas',
    obj1Q: '"Não tenho tempo para aprender um novo sistema."',
    obj1A: 'Adicione seu primeiro referral em 30 segundos. Sem treinamento, sem necessidade de chamada de integração.',
    obj2Q: '"Minha planilha já funciona."',
    obj2A: 'Sua planilha não envia lembretes. Ela não traz prospects automaticamente. Você não nota a perda — ela simplesmente não aparece.',
    obj3Q: '"Já tentei CRMs antes e eles são muito complicados."',
    obj3A: 'O Mentor CRM não foi feito para times de 50. Foi feito para você — um Life Planner com um negócio de indicações. Ele já vem estruturado.',
    obj4Q: '"E se eu não gostar?"',
    obj4A: 'Comece grátis. Sem cartão. Se usar por 30 dias e não fechar nada extra — mande um email e mostraremos o que ajustar.',

    priceTitle: 'PLANOS & PREÇOS',
    priceSub: 'Comece com um test-drive em modo sandbox. Sem cartão.',
    tier1Name: 'SANDBOX (DEMO)',
    tier1Price: '$0',
    tier1Feat1: 'Dashboard Vivo (Simulado)',
    tier1Feat2: 'Simulação de Menus',
    tier1Feat3: 'Visualização de Recursos',
    tier1Feat4: 'Exploração Visual',
    tier1Cta: 'EXPLORAR SANDBOX',
    tier2Name: 'AGENT (SOLO)',
    tier2Price: '$49/mês',
    tier2PriceYearly: 'ou $490/ano',
    tier2Feat1: 'Leads ilimitados',
    tier2Feat2: 'Automação email/sms',
    tier2Feat3: '(automação sms sem suporte)',
    tier2Feat4: 'Analíticos avançados',
    tier2Feat5: 'Automações',
    tier2Cta: 'INICIAR TESTE REAL (3 DIAS)',
    tier3Name: 'TEAM (AGÊNCIA)',
    tier3Price: '$99/mês',
    tier3Meta: '(3 agentes inclusos)',
    tier3Feat1: '3 Conexões de WhatsApp',
    tier3Feat2: 'Automações',
    tier3Feat3: 'Ranking e estatísticas',
    tier3Feat4: 'Onboarding Prioritário',
    tier3Feat5: 'Distribuição de Leads',
    tier3Feat6: 'Automação email e sms (com suporte)',
    tier3Cta: 'FALAR COM TIME / VENDAS',
    mostPopular: 'MAIS POPULAR',

    faqTitle: 'Perguntas Frequentes',
    faq1Q: 'É realmente feito para Life Planners ou é um CRM genérico?',
    faq1A: 'É feito especificamente para o fluxo baseado em indicações dos Life Planners. Sem recursos de cold leads, sem filas de call center, sem complexidade desnecessária.',
    faq2Q: 'Já uso Salesforce/HubSpot. Por que mudar?',
    faq2A: 'CRMs genéricos precisam de um admin dedicado para funcionar bem. O Mentor CRM funciona no Dia 1 porque é pré-construído para o seu modelo de negócio.',
    faq3Q: 'Como funciona o modo Sandbox?',
    faq3A: 'Ele permite que você explore todo o poder do Mentor CRM com dados fictícios pré-carregados. Você vê o dashboard, menus e automações em ação sem precisar conectar seus contatos reais até estar pronto.',
    faq4Q: 'Posso importar minha planilha atual?',
    faq4A: 'Sim. Temos uma ferramenta simples de importação CSV e um guia de 1 página dentro do app para ajudar na migração em minutos.',
    faq5Q: 'O que "Compatível com FINRA" significa na prática?',
    faq5A: 'Nossa estrutura de logs está alinhada com requisitos comuns de livros e registros. Não substitui o sistema de compliance da sua empresa, mas facilita o registro.',
    faq6Q: 'Conecta com portais de seguradoras?',
    faq6A: 'Não diretamente via API ainda. Você registra o status da apólice manualmente em 15 segundos. Integrações diretas estão em nosso roteiro.',
    faq7Q: 'Meus dados estão seguros?',
    faq7A: 'Sim. Servidores nos EUA, criptografia ponta a ponta e conformidade com GDPR/CCPA. Você pode exportar ou deletar seus dados a qualquer momento.',
    faq8Q: 'E se eu tiver mais de 3 pessoas no time?',
    faq8A: 'Nosso plano Team inclui 3 licenças. Você pode adicionar mais conforme necessário. Para grandes agências, entre em contato para preços personalizados.',

    finalTitle: 'A Indicação Que Você Recebeu Esta Semana Não Esperará Para Sempre',
    finalSub: 'Cada dia que um prospect quente fica na sua planilha sem follow-up é um dia mais perto de ele comprar de outra pessoa. Comece grátis. Sem cartão.',
    finalCta: 'Comece Grátis — Monte seu Pipeline em 10 Minutos',
    finalFoot: 'Junte-se a 150+ Life Planners que já usam o Mentor CRM. Cancele quando quiser.',

    login: 'Entrar',
    terms: 'Termos',
    privacy: 'Privacidade',
    support: 'Suporte em Inglês',
    footerText: '© 2026 MENTOR CRM. ATENDENDO LIFE PLANNERS NOS EUA.'
  },
  es: {
    navFeatures: 'Recursos',
    navHowItWorks: 'Cómo Funciona',
    navPricing: 'Precios',
    navStartFree: 'Comienza Gratis — Sin Tarjeta',
    badge: 'Hecho para Life Planners y Profesionales de Seguros',
    heroHeadline: 'Deja de Perder Pólizas por una Hoja de Cálculo',
    heroSub: 'Mentor CRM les da a los Life Planners un sistema de seguimiento de referencias que hace seguimiento automáticamente — para que la única razón por la que un prospecto no cierre sea porque dijo que no, no porque lo olvidaste.',
    heroCtaPrimary: 'EXPLORAR MODO SANDBOX',
    heroCtaSecondary: 'Mira la Demostración de 2 Minutos →',
    heroSocial: '★★★★★ 4.9/5 de 150 Life Planners | 45,000+ pólizas rastreadas | Sin tarjeta de crédito',
    
    painTitle: 'La Hoja de Cálculo es Donde las Referencias mueren',
    painCard1Title: '"Olvidaste el seguimiento — de nuevo."',
    painCard1Desc: 'Una referencia caliente de hace tres meses. Tenías la intención de llamar. Todavía está en la fila 47 con sin fecha de seguimiento. Compraron a otra persona.',
    painCard2Title: '"Tu pipeline es una mentira."',
    painCard2Desc: 'No tienes idea de qué prospectos están listos para agendar, cuáles se enfriaron o cuántas pólizas están en progreso. Estás adivinando.',
    painCard3Title: '"Pasas 10 horas a la semana en administración."',
    painCard3Desc: 'Actualizando hojas de cálculo. Escribiendo recordatorios para ti mismo. Nada de eso cierra pólizas.',
    painClosing: 'Si manejas tu negocio de referencias en una hoja de cálculo, no manejas un negocio. Manejas un concurso de memoria — y la memoria siempre pierde.',

    statPolicies: '45,000+ Pólizas Rastreadas en Mentor CRM',
    statIncrease: '35% de Aumento Promedio en Cierres — 1er Mes',
    statTime: '10 horas por semana ahorradas en administración',
    statRating: '4.9★ Calificación Promedio de 150 Life Planners',

    howTitle: 'CÓMO FUNCIONA',
    howStep1: '01 — Añade tu Referencia — 30 Segundos',
    howStep1Desc: 'Toma menos tiempo que escribir una fila en tu hoja de cálculo.',
    howStep2: '02 — Tu Secuencia de Seguimiento Comienza Automáticamente',
    howStep2Desc: 'Activa recordatorios los Días 3, 7 y 14. No necesitas recordar.',
    howStep3: '03 — Mira Exactamente Quién Está Listo para Agendar',
    howStep3Desc: 'Frío, tibio, agendado, póliza pendiente. No más suposiciones.',
    howStep4: '04 — Cierra y Registra en 15 Segundos',
    howStep4Desc: 'Marca póliza emitida, registra la compañía y el tipo de producto.',

    featTitle: 'Seguimiento de relaciones, automatizado.',
    feat1Title: 'Rastrea Relaciones, no Leads Fríos',
    feat1Desc: 'Cada contacto está vinculado a quién lo envió y qué necesita.',
    feat2Title: 'Marca cada Prospecto por Compañía y Producto',
    feat2Desc: 'National Life, Pacific Life, Transamerica, Prudential — o personalizado.',
    feat3Title: 'Nunca Dejes que un Prospecto Caliente se Enfríe',
    feat3Desc: 'Define días máximos entre contactos. El CRM los trae arriba automáticamente.',
    feat4Title: 'Un Pipeline Real — No una Hoja de Cálculo de Colores',
    feat4Desc: 'Mira tasa de cierre, conversión por compañía y de dónde provienen tus ingresos.',
    feat5Title: 'Secuencias de Seguimiento que Corren sin Ti',
    feat5Desc: 'Pre-construidas para los Días 3, 7, 14, 30. Personalizadas por producto.',
    feat6Title: 'Nunca Pases más de X Días sin un Contacto',
    feat6Desc: 'Tú defines la regla. El sistema asegura que la cumplas.',

    testTitle: 'Lo Que los Life Planners Están Diciendo',
    testSub: 'Estos no son usuarios avanzados de CRM. Son Life Planners independientes que querían dejar de perder referencias.',
    test1: '"Solía rastrear mis prospectos en una hoja de cálculo y constantemente dejaba que los prospectos calientes se enfriaran. Tras cambiar a Mentor CRM, cerré 3 pólizas en mi primer mes — solo haciendo seguimiento con personas que ya había olvidado."',
    test1Author: 'James R.',
    test1Meta: 'Life Planner | National Life & Pacific Life | Florida',
    test2: '"Antes de Mentor CRM, no tenía idea de cómo era mi pipeline. Ahora sé exactamente a quién llamar cada mañana. Cerré 5 pólizas solo la semana pasada."',
    test2Author: 'Sarah M.',
    test2Meta: 'Life Planner | Transamerica | Texas',
    test3: '"Pasaba 10 horas a la semana actualizando mi hoja de cálculo. Ahora me toma 30 segundos tras una llamada. Finalmente tengo mis fines de semana de vuelta."',
    test3Author: 'Michael D.',
    test3Meta: 'Life Planner | Prudential | California',

    objTitle: 'Probablemente Estás Pensando una de Estas Cosas',
    obj1Q: '"No tengo tiempo para aprender un nuevo sistema."',
    obj1A: 'Añade tu primera referencia en 30 segundos. Sin formación, sin necesidad de llamada de integración.',
    obj2Q: '"Mi hoja de cálculo ya funciona."',
    obj2A: 'Tu hoja de cálculo no envía recordatorios. No trae prospectos automáticamente. No notas la pérdida — simplemente no aparece.',
    obj3Q: '"He probado CRMs antes y son muy complicados."',
    obj3A: 'Mentor CRM no fue construido para equipos de 50. Fue construido para ti — un Life Planner con un negocio de referencias. Ya viene estructurado.',
    obj4Q: '"¿Y si no me gusta?"',
    obj4A: 'Comienza gratis. Sin tarjeta. Si lo usas por 30 días y no cierras nada extra — envíanos un email y te mostraremos qué ajustar.',

    priceTitle: 'PLANES & PRECIOS',
    priceSub: 'Comienza con un test-drive en modo sandbox. Sin tarjeta.',
    tier1Name: 'SANDBOX (DEMO)',
    tier1Price: '$0',
    tier1Feat1: 'Dashboard Vivo (Simulado)',
    tier1Feat2: 'Simulación de Menúes',
    tier1Feat3: 'Visualización de Recursos',
    tier1Feat4: 'Exploración Visual',
    tier1Cta: 'EXPLORAR SANDBOX',
    tier2Name: 'AGENT (SOLO)',
    tier2Price: '$49/mes',
    tier2PriceYearly: 'o $490/año',
    tier2Feat1: 'Leads ilimitados',
    tier2Feat2: 'Automatización de email/sms',
    tier2Feat3: '(automatización sms sin soporte)',
    tier2Feat4: 'Analíticos avanzados',
    tier2Feat5: 'Automatizaciones',
    tier2Cta: 'INICIAR PRUEBA REAL (3 DÍAS)',
    tier3Name: 'TEAM (AGENCIA)',
    tier3Price: '$99/mes',
    tier3Meta: '(3 agentes incluidos)',
    tier3Feat1: '3 Conexiones de WhatsApp',
    tier3Feat2: 'Automatizaciones',
    tier3Feat3: 'Ranking y estadísticas',
    tier3Feat4: 'Onboarding prioritario',
    tier3Feat5: 'Distribución de leads',
    tier3Feat6: 'Automatización de email y sms (con soporte)',
    tier3Cta: 'HABLAR CON VENTAS / EQUIPO',
    mostPopular: 'MÁS POPULAR',

    faqTitle: 'Preguntas Frecuentes',
    faq1Q: '¿Realmente está hecho para Life Planners o es un CRM genérico?',
    faq1A: 'Está construido específicamente para el flujo basado en referencias de los Life Planners. Sin funciones de leads fríos, sin colas de call center, sin complejidad innecesaria.',
    faq2Q: 'Ya uso Salesforce/HubSpot. ¿Por qué cambiar?',
    faq2A: 'Los CRMs genéricos necesitan un admin dedicado para funcionar bien. Mentor CRM funciona el Día 1 porque está pre-construído para tu modelo de negocio.',
    faq3Q: '¿Cómo funciona el modo Sandbox?',
    faq3A: 'Te permite explorar todo el poder de Mentor CRM con datos ficticios precargados. Puedes ver el dashboard, los menús y las automatizaciones en acción sin necesidad de conectar tus contactos reales hasta que estés listo.',
    faq4Q: '¿Puedo importar mi hoja de cálculo actual?',
    faq4A: 'Sí. Tenemos una herramienta simple de importación CSV e una guía de 1 página dentro de la app para ayudar en la migración en minutos.',
    faq5Q: '¿Qué significa "Compatible con FINRA" en la práctica?',
    faq5A: 'Nuestra estructura de registros se alinea con requisitos comunes de libros y registros. No reemplaza el sistema de cumplimiento de tu empresa, mas facilita el registro.',
    faq6Q: '¿Conecta con portales de compañías?',
    faq6A: 'No directamente vía API todavía. Registras el estado de la póliza manualmente en 15 segundos. Las integraciones directas estão en nuestra hoja de ruta.',
    faq7Q: '¿Están mis datos seguros?',
    faq7A: 'Sí. Servidores en EE.UU., cifrado de extremo a extremo y cumplimiento de GDPR/CCPA. Puedes exportar o borrar tus datos en cualquier momento.',
    faq8Q: '¿Qué si tengo más de 3 personas en el equipo?',
    faq8A: 'Nuestro plan Team incluye 3 licencias. Puedes añadir más según sea necesario. Para agencias grandes, contáctanos para precios personalizados.',

    finalTitle: 'La Referencia Que Recibiste Esta Semana No Esperará Para Siempre',
    finalSub: 'Cada día que un prospecto tibio se queda en tu hoja de cálculo sin seguimiento es un día más cerca de que compre a otra persona. Comienza gratis. Sin tarjeta.',
    finalCta: 'Comienza Gratis — Monta tu Pipeline en 10 Minutos',
    finalFoot: 'Únete a 150+ Life Planners que ya usan Mentor CRM. Cancela en cualquier momento.',

    login: 'Login',
    terms: 'Términos',
    privacy: 'Privacidad',
    support: 'Soporte en Inglés',
    footerText: '© 2026 MENTOR CRM. SIRVIENDO A LIFE PLANNERS EN EE.UU.'
  }
};

export function HomeClient({ dbConfig }: { dbConfig?: any }) {
  const [activeTab, setActiveTab] = useState(0);
  const [lang, setLang] = useState<keyof typeof translations>('en');
  const [scrolled, setScrolled] = useState(false);

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

  let t = translations[lang];

  if (dbConfig) {
      // Helper function to translate price strings from DB if language is not PT
      const translatePrice = (price?: string) => {
          if (!price) return undefined;
          if (lang === 'pt') return price;
          let p = price;
          if (lang === 'en') {
              p = p.replace('/mês', '/mo').replace(/mês/g, 'mo').replace('/ano', '/yr').replace(/ano/g, 'year').replace(/ou /g, 'or ');
          } else if (lang === 'es') {
              p = p.replace('/mês', '/mes').replace('/ano', '/año').replace('ou ', 'o ');
          }
          return p;
      };

      t = {
          ...t,
          // Only use DB overrides for names/CTA if we are in Portuguese
          // Otherwise, we'd be overriding EN translations with hardcoded PT database values.
          tier2Name: lang === 'pt' ? (dbConfig.plan_agent_name || t.tier2Name) : t.tier2Name,
          tier2Price: translatePrice(dbConfig.plan_agent_price) || t.tier2Price,
          tier2PriceYearly: translatePrice(dbConfig.plan_agent_price_yearly) || t.tier2PriceYearly,
          tier2Cta: lang === 'pt' ? (dbConfig.plan_agent_cta || t.tier2Cta) : t.tier2Cta,
          
          tier3Name: lang === 'pt' ? (dbConfig.plan_team_name || t.tier3Name) : t.tier3Name,
          tier3Price: translatePrice(dbConfig.plan_team_price) || t.tier3Price,
          tier3Meta: translatePrice(dbConfig.plan_team_meta) || t.tier3Meta,
          tier3Cta: lang === 'pt' ? (dbConfig.plan_team_cta || t.tier3Cta) : t.tier3Cta,
      } as any;
  }

  const agentFeatures = (dbConfig?.plan_agent_features?.length > 0 && lang === 'pt') 
      ? dbConfig.plan_agent_features 
      : [t.tier2Feat1, t.tier2Feat2, t.tier2Feat3, t.tier2Feat4, t.tier2Feat5].filter(Boolean);

  const teamFeatures = (dbConfig?.plan_team_features?.length > 0 && lang === 'pt')
      ? dbConfig.plan_team_features
      : [t.tier3Feat1, t.tier3Feat2, t.tier3Feat3, t.tier3Feat4, t.tier3Feat5, (t as any).tier3Feat6].filter(Boolean);


  return (
    <div className="relative min-h-screen w-full bg-brand-900 text-white/90 overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-300 font-sans">

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

      {/* ─── NAVIGATION ─── */}
      <nav className={`fixed inset-x-0 mx-auto z-50 w-[95%] max-w-[900px] transition-all duration-500 ease-out ${scrolled ? 'top-4' : 'top-6'}`}>
        <div className={`
          px-6 py-3 rounded-full flex items-center justify-between gap-6 shadow-2xl transition-all duration-500
          ${scrolled 
            ? 'bg-brand-900/90 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2.5' 
            : 'glass border-white/10'
          }
        `}>
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className={`
              bg-brand-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,112,204,0.5)] group-hover:scale-110 transition-transform
              ${scrolled ? 'h-7 w-7' : 'h-8 w-8'}
            `}>
              <span className={`text-white font-display font-black ${scrolled ? 'text-base' : 'text-lg'}`}>M</span>
            </div>
            <span className={`font-display font-bold tracking-tight text-white hidden sm:block ${scrolled ? 'text-base' : 'text-lg'}`}>
              MENTOR<span className="text-brand-300">CRM</span>
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: t.navFeatures, href: '#features' },
              { label: t.navHowItWorks, href: '#how-it-works' },
              { label: t.navPricing, href: '#pricing' }
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${scrolled ? 'text-white/50' : 'text-white/70'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:block text-sm font-medium text-white/50 hover:text-white transition-colors px-4">
              {t.login}
            </Link>
            <Link
              href="/login"
              className={`
                bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold rounded-full transition-all shadow-[0_4px_15px_rgba(0,112,204,0.4)] active:scale-95
                ${scrolled ? 'px-4 py-2' : 'px-5 py-2.5'}
              `}
            >
              {t.navStartFree}
            </Link>
            <div className="hidden xs:block">
              <LocaleSelector />
            </div>
            
            <PublicMobileNav t={t} lang={lang} />
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-20">

        {/* ─── SECTION 1: HERO ─── */}
        <section id="hero" className="relative pt-44 pb-24 px-6 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full mb-10 animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400 shadow-[0_0_8px_#66B8FF]"></span>
              </span>
              <span className="text-xs font-semibold text-brand-300 tracking-wide uppercase">{t.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold text-white mb-8 animate-fade-up [animation-delay:100ms] leading-[1.1]">
              {t.heroHeadline.split('Spreadsheet')[0]}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent italic shrink-0 block sm:inline">Spreadsheet</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/60 leading-relaxed max-w-2xl mx-auto mb-12 animate-fade-up [animation-delay:200ms]">
              {t.heroSub}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-up [animation-delay:300ms]">
              <Link 
                href="/login" 
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full font-bold text-white shadow-[0_8px_30px_rgba(0,112,204,0.5)] hover:shadow-[0_12px_45px_rgba(0,112,204,0.7)] transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                {t.heroCtaPrimary}
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="w-full sm:w-auto px-10 py-5 glass rounded-full font-bold text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Play className="h-5 w-5 fill-current" />
                {t.heroCtaSecondary}
              </button>
            </div>

            {/* Social Proof */}
            <div className="glass px-8 py-5 rounded-3xl inline-flex flex-wrap items-center justify-center gap-6 animate-fade-up [animation-delay:400ms]">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-medium text-white/50">
                <span className="text-white">4.9/5</span> from 150 Life Planners
              </p>
              <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
              <p className="text-sm font-medium text-white/50">
                <span className="text-white">45,000+</span> policies tracked
              </p>
            </div>
          </div>
        </section>


        {/* ─── SECTION 2: PAIN AMPLIFICATION ─── */}
        <section id="pain" className="py-32 px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-white mb-6 uppercase tracking-tight italic animate-fade-up">
              {t.painTitle}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-12">
              {[
                { title: t.painCard1Title, desc: t.painCard1Desc, icon: <AlertCircle className="h-8 w-8 text-red-500" /> },
                { title: t.painCard2Title, desc: t.painCard2Desc, icon: <BarChart3 className="h-8 w-8 text-white/40" /> },
                { title: t.painCard3Title, desc: t.painCard3Desc, icon: <Clock className="h-8 w-8 text-white/40" /> }
              ].map((card, i) => (
                <div key={i} className="glass-strong p-8 text-left group relative overflow-hidden transition-transform hover:-translate-y-2 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                  <div className="mb-6 group-hover:scale-110 transition-transform">{card.icon}</div>
                  <h3 className="text-xl font-display font-bold text-white mb-4 leading-tight">{card.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-center text-lg md:text-xl font-display font-light text-white/70 max-w-3xl mx-auto italic leading-relaxed animate-fade-up [animation-delay:400ms] border-l-2 border-brand-400 pl-8 text-left">
              "{t.painClosing}"
            </p>
          </div>
        </section>

        {/* ─── SECTION 3: STATS BAR ─── */}
        <section className="py-12 px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="glass-strong grid grid-cols-2 lg:grid-cols-4 gap-8 p-10 md:p-12 shadow-[0_30px_100px_rgba(0,12,36,0.5)]">
              {[
                { label: t.statPolicies, val: '45k+' },
                { label: t.statIncrease, val: '35%' },
                { label: t.statTime, val: '10h' },
                { label: t.statRating, val: '4.9★' }
              ].map((stat, i) => (
                <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <p className="text-4xl md:text-5xl font-display font-extrabold bg-gradient-to-br from-white to-brand-300 bg-clip-text text-transparent mb-2 tracking-tighter italic">
                    {stat.val}
                  </p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-tight">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: HOW IT WORKS ─── */}
        <section id="how-it-works" className="py-20 md:py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-sm font-display font-black tracking-[0.4em] text-brand-300 uppercase mb-6 animate-fade-up">{t.howTitle}</h2>
              <div className="h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent w-24 mx-auto rounded-full animate-fade-up [animation-delay:100ms]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: t.howStep1, desc: t.howStep1Desc },
                { title: t.howStep2, desc: t.howStep2Desc },
                { title: t.howStep3, desc: t.howStep3Desc },
                { title: t.howStep4, desc: t.howStep4Desc }
              ].map((step, i) => (
                <div key={i} className="relative group animate-fade-up" style={{ animationDelay: `${i * 100 + 200}ms` }}>
                  <div className="glass-strong p-8 rounded-[2rem] transition-all hover:bg-white/10 hover:-translate-y-2 h-full">
                    <div className="font-display text-5xl font-black text-white/5 mb-6 group-hover:text-brand-500/20 transition-colors">
                      {step.title.split('—')[0].trim()}
                    </div>
                    <h3 className="text-lg font-display font-bold text-white mb-4 leading-tight">{step.title.split('—')[1]?.trim() || step.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-brand-500/30 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: FEATURES ─── */}
        <section id="features" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20 text-center">
              <h2 className="text-sm font-display font-black tracking-[0.4em] text-brand-300 uppercase mb-4 animate-fade-up">{t.featTitle}</h2>
              <div className="h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent w-24 mx-auto rounded-full animate-fade-up [animation-delay:100ms]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                { title: t.feat1Title, desc: t.feat1Desc, icon: <Users /> },
                { title: t.feat2Title, desc: t.feat2Desc, icon: <Target /> },
                { title: t.feat3Title, desc: t.feat3Desc, icon: <Clock /> },
                { title: t.feat4Title, desc: t.feat4Desc, icon: <BarChart3 /> },
                { title: t.feat5Title, desc: t.feat5Desc, icon: <Workflow /> },
                { title: t.feat6Title, desc: t.feat6Desc, icon: <ShieldCheck /> }
              ].map((feat, i) => (
                <div key={i} className="glass-strong p-8 text-left group transition-all hover:-translate-y-2 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-14 w-14 bg-brand-500/20 text-brand-300 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                    {React.cloneElement(feat.icon as React.ReactElement<any>, { className: 'h-6 w-6' })}
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-4 tracking-tight leading-tight">{feat.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 6: TESTIMONIALS ─── */}
        <section className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-sm font-display font-black tracking-[0.34em] text-brand-300 uppercase mb-4 animate-fade-up">{t.testTitle}</h2>
            <p className="text-white/40 max-w-xl mx-auto mb-20 animate-fade-up [animation-delay:100ms]">{t.testSub}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { quote: t.test1, author: t.test1Author, meta: t.test1Meta },
                { quote: t.test2, author: t.test2Author, meta: t.test2Meta },
                { quote: t.test3, author: t.test3Author, meta: t.test3Meta }
              ].map((testi, i) => (
                <div key={i} className="glass-strong p-10 text-left flex flex-col justify-between animate-fade-up transition-all hover:-translate-y-2" style={{ animationDelay: `${i * 100 + 200}ms` }}>
                  <div>
                    <div className="flex gap-1 text-yellow-400 mb-6">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-white/80 font-sans italic leading-relaxed mb-10 text-lg">"{testi.quote}"</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-display font-bold shadow-lg shadow-brand-500/20 flex-shrink-0">
                      {testi.author[0]}
                    </div>
                    <div>
                      <p className="text-white font-display font-bold text-sm tracking-tight">{testi.author}</p>
                      <p className="text-white/30 text-[10px] font-bold uppercase tracking-wider mt-1">{testi.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: OBJECTION KILLER ─── */}
        <section className="py-32 px-6 relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-display font-black tracking-[0.4em] text-brand-300 uppercase mb-20 text-center animate-fade-up">{t.objTitle}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { q: t.obj1Q, a: t.obj1A },
                { q: t.obj2Q, a: t.obj2A },
                { q: t.obj3Q, a: t.obj3A },
                { q: t.obj4Q, a: t.obj4A }
              ].map((obj, i) => (
                <div key={i} className="glass-strong p-10 group animate-fade-up" style={{ animationDelay: `${i * 100 + 100}ms` }}>
                  <h3 className="text-xl font-display font-bold text-white mb-4 leading-tight group-hover:text-brand-300 transition-colors">{obj.q}</h3>
                  <p className="text-white/50 text-base leading-relaxed">{obj.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 6: COMPLIANCE & TRUST ─── */}
        <section className="py-24 px-6 relative">
          <div className="max-w-5xl mx-auto glass-strong p-12 md:p-20 rounded-[3rem] shadow-2xl overflow-hidden relative group animate-fade-up">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-500/5 -rotate-12 translate-x-1/2 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
              <div className="h-24 w-24 bg-brand-500 rounded-3xl flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(0,112,204,0.4)] group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-12 w-12 text-white" />
              </div>
              
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-display font-black text-white mb-4 animate-fade-up [animation-delay:100ms]">
                  Enterprise-Grade Security for Independent Planners
                </h2>
                <p className="text-white/60 font-sans text-lg max-w-xl mx-auto lg:mx-0 mb-10 animate-fade-up [animation-delay:200ms]">
                  Mentor CRM uses 256-bit encryption and U.S.-based servers. Our logs are pre-structured to help with FINRA books-and-records inquiries. Your client data is yours — export it any time.
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-8 animate-fade-up [animation-delay:300ms]">
                  <span className="flex items-center gap-3 text-brand-300 font-display font-black text-xs uppercase tracking-[0.2em]">
                    <CheckCircle2 className="h-5 w-5 text-brand-400" /> AES-256 Encrypted
                  </span>
                  <span className="flex items-center gap-3 text-brand-300 font-display font-black text-xs uppercase tracking-[0.2em]">
                    <CheckCircle2 className="h-5 w-5 text-brand-400" /> Daily Cloud Backups
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7: PRICING ─── */}
        <section id="pricing" className="py-24 md:py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-sm font-display font-black tracking-[0.4em] text-brand-300 uppercase mb-4 animate-fade-up">{t.priceTitle}</h2>
              <p className="text-white/40 font-display text-lg animate-fade-up [animation-delay:100ms]">{t.priceSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch md:items-end">
              {/* Tier 1 */}
              <div className="glass-strong p-8 md:p-10 flex flex-col animate-fade-up [animation-delay:200ms] hover:bg-white/5 transition-colors">
                <h3 className="text-xs font-display font-black tracking-[0.3em] text-white/40 uppercase mb-8">{t.tier1Name}</h3>
                <div className="mb-10">
                  <p className="text-5xl font-display font-extrabold text-white tracking-tighter">{t.tier1Price}</p>
                </div>
                <div className="space-y-4 mb-12 flex-1">
                  {[t.tier1Feat1, t.tier1Feat2, t.tier1Feat3, t.tier1Feat4].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-white/60">
                      <Check className="h-4 w-4 text-brand-400" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/signup?plan=sandbox" className="w-full py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-full text-center text-xs font-display font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(0,112,204,0.4)] transition-all active:scale-95">
                  {t.tier1Cta}
                </Link>
                <p className="text-center text-[9px] text-white/20 font-display font-black uppercase tracking-widest mt-3">Sem cartão. Dados simulados.</p>
              </div>

              {/* Tier 2 - Featured */}
              <div className="glass-strong p-10 md:p-12 border-2 border-brand-500 shadow-[0_30px_100px_rgba(0,112,204,0.3)] md:scale-105 relative z-10 flex flex-col animate-fade-up [animation-delay:300ms]">
                <div className="absolute top-0 right-8 md:right-12 -translate-y-1/2 bg-brand-500 text-white px-4 py-1.5 rounded-full text-[10px] font-display font-black uppercase tracking-widest shadow-lg animate-pulse">
                  {t.mostPopular}
                </div>
                <h3 className="text-xs font-display font-black tracking-[0.3em] text-brand-300 uppercase mb-8">{t.tier2Name}</h3>
                <div className="mb-10">
                  <p className="text-6xl font-display font-extrabold text-white tracking-tighter italic">{t.tier2Price}</p>
                  <p className="text-xs font-bold text-white/40 mt-1">{t.tier2PriceYearly}</p>
                </div>
                <div className="space-y-4 mb-12 flex-1">
                  {agentFeatures.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold text-white">
                      <Check className="h-4 w-4 text-brand-400" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/assinar?plan=agent_monthly" className="w-full py-5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-full text-center text-xs font-display font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(0,112,204,0.5)] active:scale-95 transition-all shadow-xl">
                  {t.tier2Cta}
                </Link>
                <Link href="/assinar?plan=agent_annual" className="w-full py-3 mt-3 glass border border-brand-500/30 text-brand-300 rounded-full text-center text-[10px] font-display font-black uppercase tracking-widest hover:bg-brand-500/10 active:scale-95 transition-all">
                  {t.tier2PriceYearly ? `Plano Anual — ${t.tier2PriceYearly}` : 'Ver Plano Anual'}
                </Link>
              </div>

              {/* Tier 3 */}
              <div className="glass-strong p-10 flex flex-col animate-fade-up [animation-delay:400ms] hover:bg-white/5 transition-colors">
                <h3 className="text-xs font-display font-black tracking-[0.3em] text-white/40 uppercase mb-8">{t.tier3Name}</h3>
                <div className="mb-10">
                  <p className="text-5xl font-display font-extrabold text-white tracking-tighter">{t.tier3Price}</p>
                  <p className="text-xs font-bold text-white/40 mt-1">{t.tier3Meta}</p>
                </div>
                <div className="space-y-4 mb-12 flex-1">
                  {teamFeatures.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-white/60">
                      <Check className="h-4 w-4 text-white/40" /> {f}
                    </div>
                  ))}
                </div>
                <Link href="/assinar?plan=team" className="w-full py-4 glass border border-white/10 rounded-full text-center text-xs font-display font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                  {t.tier3Cta}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 8: FAQ ─── */}
        <section className="py-32 px-6 relative">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-display font-black tracking-[0.4em] text-brand-300 uppercase mb-20 text-center animate-fade-up">{t.faqTitle}</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { q: t.faq1Q, a: t.faq1A },
                { q: t.faq2Q, a: t.faq2A },
                { q: t.faq3Q, a: t.faq3A },
                { q: t.faq4Q, a: t.faq4A },
                { q: t.faq5Q, a: t.faq5A },
                { q: t.faq6Q, a: t.faq6A },
                { q: t.faq7Q, a: t.faq7A },
                { q: t.faq8Q, a: t.faq8A }
              ].map((faq, i) => (
                <div key={i} className="glass-strong p-8 group animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-display font-bold text-white leading-tight group-hover:text-brand-300 transition-colors uppercase tracking-tight">{faq.q}</h3>
                    <Plus className="h-5 w-5 text-brand-500 flex-shrink-0 mt-1" />
                  </div>
                  <p className="mt-4 text-white/50 text-base leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 9: FINAL CTA ─── */}
        <section className="py-48 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,112,204,0.2),transparent_70%)]" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-display font-display font-extrabold text-white mb-8 animate-fade-up">
              {t.finalTitle}
            </h2>
            <p className="text-white/60 text-xl font-display mb-12 max-w-2xl mx-auto animate-fade-up [animation-delay:100ms]">
              {t.finalSub}
            </p>
            <div className="flex flex-col items-center gap-6 animate-fade-up [animation-delay:200ms]">
              <Link
                href="/login"
                className="px-14 py-6 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full font-display font-black text-xs text-white uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(0,112,204,0.5)] hover:shadow-[0_25px_60px_rgba(0,112,204,0.7)] hover:scale-110 active:scale-95 transition-all"
              >
                {t.finalCta}
              </Link>
              <p className="text-white/40 text-[10px] uppercase font-display font-black tracking-widest leading-loose">
                {t.finalFoot}
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-24 px-6 relative border-t border-white/5 bg-brand-900/50 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-20">
            <div className="flex flex-col items-center md:items-start gap-8">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-display font-black text-xl">M</span>
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-white">
                  MENTOR<span className="text-brand-300">CRM</span>
                </span>
              </Link>
              <p className="text-[10px] font-display font-black text-white/30 uppercase tracking-[0.2em] max-w-[250px] text-center md:text-left leading-relaxed">
                {t.footerText}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-12 text-[10px] font-display font-black text-white/40 uppercase tracking-widest">
              <Link href="/terms" className="hover:text-brand-300 transition-colors">{t.terms}</Link>
              <Link href="/privacy" className="hover:text-brand-300 transition-colors">{t.privacy}</Link>
              <Link href="/login" className="hover:text-brand-300 transition-colors">{t.login}</Link>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-display font-bold text-white/20 uppercase tracking-widest italic">
              © 2026 Mentor CRM. All rights reserved - By Inova Digital Marketing - <a href="https://inovamkt.io" target="_blank" rel="noopener noreferrer" className="hover:text-brand-300 transition-colors">inovamkt.io</a>
            </p>
            <div className="flex gap-6">
               <a href="#" className="text-white/20 hover:text-[#1877F2] transition-colors duration-300">
                 <Facebook className="h-5 w-5 fill-current" />
               </a>
               <a href="#" className="text-white/20 hover:text-[#E4405F] transition-colors duration-300">
                 <Instagram className="h-5 w-5" />
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
