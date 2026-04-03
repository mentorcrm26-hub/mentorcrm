/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { login } from '../actions';
import { cookies } from 'next/headers';

import { PasswordInput } from '@/components/ui/password-input';

const translations = {
    pt: {
        title: 'ACESSO AO SISTEMA',
        subtitle: 'Autentique sua sessão de gerenciamento.',
        emailLabel: 'IDENTIFICADOR (EMAIL)',
        emailPlaceholder: 'agente@mentor-crm.com',
        passwordLabel: 'CHAVE DE ACESO (SENHA)',
        forgotPassword: 'RECUPERAR ACESSO',
        passwordPlaceholder: '••••••••',
        submit: 'INICIAR SESSÃO',
        noAccount: 'NÃO POSSUI LICENÇA?',
        createFree: 'SOLICITAR TRIAL',
        defaultError: 'FALHA NA AUTENTICAÇÃO. VERIFIQUE AS CREDENCIAIS.'
    },
    en: {
        title: 'SYSTEM ACCESS',
        subtitle: 'Authenticate your management session.',
        emailLabel: 'IDENTIFIER (EMAIL)',
        emailPlaceholder: 'agent@mentor-crm.com',
        passwordLabel: 'ACCESS KEY (PASSWORD)',
        forgotPassword: 'RECOVER ACCESS',
        passwordPlaceholder: '••••••••',
        submit: 'START SESSION',
        noAccount: 'NO LICENSE?',
        createFree: 'REQUEST TRIAL',
        defaultError: 'AUTHENTICATION FAILED. CHECK CREDENTIALS.'
    },
    es: {
        title: 'ACCESO AL SISTEMA',
        subtitle: 'Autentique su sesión de gestión.',
        emailLabel: 'IDENTIFICADOR (EMAIL)',
        emailPlaceholder: 'agente@mentor-crm.com',
        passwordLabel: 'CLAVE DE ACCESO (CONTRASEÑA)',
        forgotPassword: 'RECUPERAR ACESSO',
        passwordPlaceholder: '••••••••',
        submit: 'INICIAR SESIÓN',
        noAccount: '¿NO TIENE LICENCIA?',
        createFree: 'SOLICITAR TRIAL',
        defaultError: 'FALLO NA AUTENTICACIÓN. VERIFIQUE LAS CREDENCIALES.'
    }
};

type Language = keyof typeof translations;

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; msg?: string }>
}) {
    const p = await searchParams;
    const cookieStore = await cookies();
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Language | undefined;
    const lang: Language = (localeCookie && translations[localeCookie]) ? localeCookie : 'en';
    const t = translations[lang];

    return (
        <div className="glass-strong p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-[0_32px_100px_rgba(0,12,36,0.5)] relative overflow-hidden group border-white/10 w-full max-w-md mx-auto">
            <div className="mb-12 text-center flex flex-col items-center">
                <Link href="/" className="flex items-center gap-2 group mb-12">
                    <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-display font-black text-xl">M</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-white">
                        MENTOR<span className="text-brand-300">CRM</span>
                    </span>
                </Link>
                <h1 className="text-xs font-display font-black tracking-[0.4em] uppercase text-brand-300 mb-3">{t.title}</h1>
                <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-white/30">{t.subtitle}</p>
            </div>

            {p?.error && (
                <div className="mb-8 flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-red-500 leading-relaxed">{p.msg || t.defaultError}</p>
                </div>
            )}

            <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="email">{t.emailLabel}</label>
                    <input
                        className="bg-white/5 border border-white/10 px-6 py-5 text-sm text-white placeholder-white/20 rounded-2xl focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner"
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="password">{t.passwordLabel}</label>
                        <Link href="/forgot-password" className="text-[9px] font-display font-black tracking-widest text-white/30 hover:text-brand-300 transition-colors uppercase">{t.forgotPassword}</Link>
                    </div>
                    <PasswordInput
                        className="py-5"
                        id="password"
                        name="password"
                        placeholder={t.passwordPlaceholder}
                        required
                    />
                </div>


                <div className="pt-4">
                    <button
                        formAction={login}
                        className="group relative flex w-full h-16 items-center justify-center bg-brand-500 hover:bg-brand-600 px-8 text-xs font-display font-black uppercase tracking-[0.4em] text-white transition-all rounded-2xl shadow-[0_10px_30px_rgba(0,112,204,0.4)] active:scale-95 cursor-pointer"
                    >
                        {t.submit}
                    </button>
                </div>
            </form>

            <div className="mt-12 pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] font-display font-black uppercase tracking-widest text-white/20 mb-6">{t.noAccount}</p>
                <Link href="/signup" className="group text-[10px] font-display font-black uppercase tracking-widest text-brand-300 flex items-center justify-center gap-2 hover:text-white transition-colors">
                    {t.createFree}
                    <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
