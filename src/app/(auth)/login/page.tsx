import Link from 'next/link'
import { Workflow, AlertCircle } from 'lucide-react'
import { login } from '../actions'
import { cookies } from 'next/headers'

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
    },
    es: {
        title: 'ACCESO AO SISTEMA',
        subtitle: 'Autentique su sesión de gestión.',
        emailLabel: 'IDENTIFICADOR (EMAIL)',
        emailPlaceholder: 'agente@mentor-crm.com',
        passwordLabel: 'CLAVE DE ACCESO (CONTRASEÑA)',
        forgotPassword: 'RECUPERAR ACCESO',
        passwordPlaceholder: '••••••••',
        submit: 'INICIAR SESIÓN',
        noAccount: '¿NO TIENE LICENCIA?',
        createFree: 'SOLICITAR PRUEBA',
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
    const lang: Language = (localeCookie && translations[localeCookie]) ? localeCookie : 'pt';
    const t = translations[lang];

    return (
        <div className="w-full relative z-10 flex flex-col p-10 bg-zinc-900/40 backdrop-blur-3xl border border-white/[0.08] shadow-2xl">
            <div className="mb-12 text-center flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center border border-emerald-500/40 bg-emerald-500/10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] mb-8">
                    <Workflow className="h-6 w-6 text-emerald-400" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] uppercase text-white mb-3">{t.title}</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.subtitle}</p>
            </div>

            {p?.error && (
                <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-4">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 leading-relaxed">{p.msg || t.defaultError}</p>
                </div>
            )}

            <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="email">{t.emailLabel}</label>
                    <input
                        className="border border-white/[0.08] bg-black/40 px-5 py-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
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
                        <Link href="#" className="text-[9px] font-bold tracking-widest text-zinc-600 hover:text-emerald-400 transition-colors">{t.forgotPassword}</Link>
                    </div>
                    <input
                        className="border border-white/[0.08] bg-black/40 px-5 py-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all"
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
                        className="group relative flex w-full h-14 items-center justify-center bg-white px-8 text-xs font-extrabold uppercase tracking-widest text-black transition-all hover:bg-emerald-500 hover:text-black focus:outline-none"
                    >
                        {t.submit}
                    </button>
                </div>
            </form>

            <div className="mt-12 pt-8 border-t border-white/[0.05] text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-4">{t.noAccount}</p>
                <Link href="/signup" className="text-[10px] font-bold uppercase tracking-tighter text-white hover:text-emerald-400 transition-colors border-b border-white hover:border-emerald-400 pb-0.5">
                    {t.createFree}
                </Link>
            </div>
        </div>
    )
}
