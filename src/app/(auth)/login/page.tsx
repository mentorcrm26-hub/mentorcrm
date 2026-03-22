import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { login } from '../actions';
import { cookies } from 'next/headers';

const translations = {
    pt: {
        title: 'ACESSO AO SISTEMA',
        subtitle: 'Autentique sua sessão de gerenciamento.',
        emailLabel: 'IDENTIFICADOR (EMAIL)',
        emailPlaceholder: 'agente@mentor-crm.com',
        passwordLabel: 'CHAVE DE ACESSO (SENHA)',
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
    const lang: Language = (localeCookie && translations[localeCookie]) ? localeCookie : 'pt';
    const t = translations[lang];

    return (
        <div className="bg-white/70 backdrop-blur-[40px] border border-white/60 p-12 rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group">
            <div className="mb-12 text-center flex flex-col items-center">
                <Link href="/" className="mb-10 hover:opacity-80 transition-opacity">
                    <img src="/logo.png" alt="Mentor CRM" className="h-20 w-auto mix-blend-multiply" />
                </Link>
                <h1 className="text-sm font-black tracking-[0.4em] uppercase text-zinc-900 mb-3">{t.title}</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">{t.subtitle}</p>
            </div>

            {p?.error && (
                <div className="mb-8 flex items-center gap-4 bg-red-500/5 border border-red-500/10 p-5 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 leading-relaxed">{p.msg || t.defaultError}</p>
                </div>
            )}

            <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="email">{t.emailLabel}</label>
                    <input
                        className="border border-zinc-200 bg-zinc-50 px-6 py-5 text-sm text-zinc-900 placeholder-zinc-300 rounded-2xl focus:outline-none focus:border-mentor-blue/30 focus:bg-white transition-all shadow-sm"
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="password">{t.passwordLabel}</label>
                        <Link href="#" className="text-[9px] font-bold tracking-widest text-zinc-400 hover:text-mentor-blue transition-colors">{t.forgotPassword}</Link>
                    </div>
                    <input
                        className="border border-zinc-200 bg-zinc-50 px-6 py-5 text-sm text-zinc-900 placeholder-zinc-300 rounded-2xl focus:outline-none focus:border-mentor-blue/30 focus:bg-white transition-all shadow-sm"
                        id="password"
                        name="password"
                        type="password"
                        placeholder={t.passwordPlaceholder}
                        required
                    />
                </div>

                <div className="pt-4">
                    <button
                        formAction={login}
                        className="group relative flex w-full h-16 items-center justify-center bg-zinc-900 px-8 text-[11px] font-black uppercase tracking-[0.5em] text-white transition-all hover:bg-mentor-blue rounded-2xl shadow-xl shadow-zinc-200"
                    >
                        {t.submit}
                    </button>
                </div>
            </form>

            <div className="mt-12 pt-10 border-t border-zinc-100 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">{t.noAccount}</p>
                <Link href="/signup" className="group text-[10px] font-black uppercase tracking-widest text-zinc-900 flex items-center justify-center gap-2">
                    {t.createFree}
                    <ArrowRight className="h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
