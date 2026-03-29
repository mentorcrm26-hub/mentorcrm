/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { signup } from '../actions';
import { cookies } from 'next/headers';
import SignupForm from './signup-form';

const translations = {
    pt: {
        sandbox: { title: 'EXPLORAR O SANDBOX', subtitle: 'Sem cartão. Dados simulados para você explorar à vontade.' },
        agent:   { title: 'SOLICITAR ACESSO TRIAL', subtitle: 'Inicie sua experiência de 3 dias com precisão total.' },
        team:    { title: 'SOLICITAR ACESSO TEAM', subtitle: 'Nossa equipe entrará em contato em até 24h para configurar seu workspace.' },
        fullName: 'NOME COMPLETO',
        namePlaceholder: 'Seu Nome',
        emailLabel: 'EMAIL PROFISSIONAL',
        emailPlaceholder: 'voce@exemplo.com',
        phoneLabel: 'TELEFONE (US)',
        phonePlaceholder: '(XXX) XXX-XXXX',
        passwordLabel: 'CRIAR SENHA',
        passwordPlaceholder: 'Mínimo de 6 caracteres',
        terms: 'Concordo com os Termos de Serviço e Política de Privacidade.',
        submit: { sandbox: 'CRIAR CONTA SANDBOX', agent: 'SOLICITAR ACESSO AGORA', team: 'SOLICITAR ACESSO TEAM' },
        alreadyHaveAccount: 'JÁ POSSUI CONTA?',
        loginLink: 'Acessar Painel',
        defaultError: 'Erro ao criar conta. Tente novamente.'
    },
    en: {
        sandbox: { title: 'EXPLORE THE SANDBOX', subtitle: 'No credit card required. Explore with mock data at your own pace.' },
        agent:   { title: 'START YOUR 3-DAY TRIAL', subtitle: 'Full access for 3 days. No credit card required.' },
        team:    { title: 'REQUEST TEAM ACCESS', subtitle: 'Our team will contact you within 24h to set up your workspace.' },
        fullName: 'FULL NAME',
        namePlaceholder: 'Your Name',
        emailLabel: 'PROFESSIONAL EMAIL',
        emailPlaceholder: 'you@example.com',
        phoneLabel: 'PHONE (US)',
        phonePlaceholder: '(XXX) XXX-XXXX',
        passwordLabel: 'CREATE PASSWORD',
        passwordPlaceholder: 'Minimum 6 characters',
        terms: 'I agree to the Terms of Service and Privacy Policy.',
        submit: { sandbox: 'CREATE SANDBOX ACCOUNT', agent: 'REQUEST ACCESS NOW', team: 'REQUEST TEAM ACCESS' },
        alreadyHaveAccount: 'ALREADY HAVE AN ACCOUNT?',
        loginLink: 'Login to Dashboard',
        defaultError: 'Error creating account. Try again.'
    },
    es: {
        sandbox: { title: 'EXPLORAR EL SANDBOX', subtitle: 'Sin tarjeta. Datos simulados para explorar a tu ritmo.' },
        agent:   { title: 'SOLICITAR ACCESO TRIAL', subtitle: 'Inicie su experiencia de 3 días con precisión total.' },
        team:    { title: 'SOLICITAR ACCESO TEAM', subtitle: 'Nuestro equipo le contactará en 24h para configurar su workspace.' },
        fullName: 'NOMBRE COMPLETO',
        namePlaceholder: 'Su Nombre',
        emailLabel: 'EMAIL PROFESIONAL',
        emailPlaceholder: 'usted@ejemplo.com',
        phoneLabel: 'TELÉFONO (US)',
        phonePlaceholder: '(XXX) XXX-XXXX',
        passwordLabel: 'CREAR CONTRASEÑA',
        passwordPlaceholder: 'Mínimo de 6 caracteres',
        terms: 'Acepto los Términos de Servicio y la Política de Privacidad.',
        submit: { sandbox: 'CREAR CUENTA SANDBOX', agent: 'SOLICITAR ACCESO AHORA', team: 'SOLICITAR ACCESO TEAM' },
        alreadyHaveAccount: '¿YA TIENE UNA CUENTA?',
        loginLink: 'Acceder al Panel',
        defaultError: 'Error al crear la cuenta. Intente de nuevo.'
    }
};

type Language = keyof typeof translations;

type Plan = 'sandbox' | 'agent' | 'team';

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; msg?: string; plan?: string }>
}) {
    const p = await searchParams;
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Language | undefined;
    const lang: Language = (localeCookie && translations[localeCookie]) ? localeCookie : 'en';
    const t = translations[lang];

    const validPlans: Plan[] = ['sandbox', 'agent', 'team'];
    const plan: Plan = validPlans.includes(p?.plan as Plan) ? (p.plan as Plan) : 'agent';

    const planInfo = t[plan];
    const submitLabel = t.submit[plan];

    return (
        <div className="glass-strong p-10 md:p-14 rounded-[3.5rem] shadow-[0_32px_100px_rgba(0,12,36,0.5)] relative overflow-hidden group border-white/10 animate-fade-up">
            <div className="mb-10 text-center flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2 group mb-12">
                    <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-display font-black text-xl">M</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-white">
                        MENTOR<span className="text-brand-300">CRM</span>
                    </span>
                </Link>
                <h1 className="text-xs font-display font-black tracking-[0.4em] uppercase text-brand-300 mb-3">{planInfo.title}</h1>
                <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-white/30">{planInfo.subtitle}</p>
            </div>

            {p?.error && (
                <div className="mb-8 flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-red-500 leading-relaxed">{p.msg || t.defaultError}</p>
                </div>
            )}

            <SignupForm
                fullName={t.fullName}
                namePlaceholder={t.namePlaceholder}
                emailLabel={t.emailLabel}
                emailPlaceholder={t.emailPlaceholder}
                phoneLabel={t.phoneLabel}
                passwordLabel={t.passwordLabel}
                passwordPlaceholder={t.passwordPlaceholder}
                terms={t.terms}
                submit={submitLabel}
                plan={plan}
            />

            <div className="mt-10 pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] font-display font-black uppercase tracking-widest text-white/20 mb-6">{t.alreadyHaveAccount}</p>
                <div className="flex flex-col items-center gap-4">
                    <Link href="/login" className="group text-[10px] font-display font-black uppercase tracking-widest text-brand-300 flex items-center justify-center gap-2 hover:text-white transition-colors">
                        {t.loginLink}
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="mt-12 text-center flex items-center justify-center gap-6 opacity-40">
                <span className="text-[9px] font-display font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> ELITE ENCRYPTION
                </span>
                <div className="h-1 w-1 bg-white/10 rounded-full"></div>
                <span className="text-[9px] font-display font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> SECURE ACCESS
                </span>
            </div>
        </div>
    )
}
