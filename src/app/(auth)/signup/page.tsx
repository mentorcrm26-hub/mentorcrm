import Link from 'next/link'
import { AlertCircle, Sparkles } from 'lucide-react'
import { signup } from '../actions'
import { cookies } from 'next/headers'

const translations = {
    pt: {
        title: 'Crie seu Trial (3 Dias)',
        subtitle: 'Plataforma restrita a 3 leads no Trial.',
        fullName: 'Nome Completo',
        namePlaceholder: 'Seu Nome',
        emailLabel: 'Email Profissional',
        emailPlaceholder: 'voce@exemplo.com',
        passwordLabel: 'Criar Senha',
        passwordPlaceholder: 'Mínimo de 6 caracteres',
        terms: 'Concordo com os Termos de Serviço e Política de Privacidade. Entendo que o Trial é restrito a 3 contatos.',
        submit: 'Criar Conta Grátis',
        alreadyHaveAccount: 'Já possui conta?',
        loginLink: 'Entrar no painel',
        defaultError: 'Erro ao criar conta. Tente novamente.'
    },
    en: {
        title: 'Create your Trial (3 Days)',
        subtitle: 'Platform restricted to 3 leads on Trial.',
        fullName: 'Full Name',
        namePlaceholder: 'Your Name',
        emailLabel: 'Professional Email',
        emailPlaceholder: 'you@example.com',
        passwordLabel: 'Create Password',
        passwordPlaceholder: 'Minimum 6 characters',
        terms: 'I agree to the Terms of Service and Privacy Policy. I understand the Trial is restricted to 3 contacts.',
        submit: 'Create Free Account',
        alreadyHaveAccount: 'Already have an account?',
        loginLink: 'Go to dashboard',
        defaultError: 'Error creating account. Try again.'
    },
    es: {
        title: 'Crea tu Prueba (3 Días)',
        subtitle: 'Plataforma restringida a 3 prospectos en Prueba.',
        fullName: 'Nombre Completo',
        namePlaceholder: 'Tu Nombre',
        emailLabel: 'Correo Profesional',
        emailPlaceholder: 'tu@ejemplo.com',
        passwordLabel: 'Crear Contraseña',
        passwordPlaceholder: 'Mínimo 6 caracteres',
        terms: 'Acepto los Términos de Servicio y la Política de Privacidad. Entiendo que la Prueba está restingida a 3 contactos.',
        submit: 'Crear Cuenta Gratis',
        alreadyHaveAccount: '¿Ya tienes cuenta?',
        loginLink: 'Ir al panel',
        defaultError: 'Error al crear la cuenta. Inténtalo de nuevo.'
    }
};

type Language = keyof typeof translations;

export default async function SignupPage({
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
        <div className="w-full relative z-10 flex flex-col p-6 sm:p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="mb-8 text-center flex flex-col items-center">
                <Link href="/">
                    <div className="flex items-center gap-2 mb-6 hover:opacity-80 transition">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">Mentor CRM</span>
                    </div>
                </Link>
                <h1 className="text-2xl font-bold text-white">{t.title}</h1>
                <p className="text-sm text-slate-400 mt-2">{t.subtitle}</p>
            </div>

            {p?.error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <p>{p.msg || t.defaultError}</p>
                </div>
            )}

            <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="full_name">{t.fullName}</label>
                    <input
                        className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        id="full_name"
                        name="full_name"
                        type="text"
                        placeholder={t.namePlaceholder}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="email">{t.emailLabel}</label>
                    <input
                        className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        id="email"
                        name="email"
                        type="email"
                        placeholder={t.emailPlaceholder}
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300" htmlFor="password">{t.passwordLabel}</label>
                    <input
                        className="rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                        id="password"
                        name="password"
                        type="password"
                        placeholder={t.passwordPlaceholder}
                        minLength={6}
                        required
                    />
                </div>

                <div className="flex items-start gap-3 mt-2">
                    <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-white/10 bg-black/50" required />
                    <label htmlFor="terms" className="text-xs text-slate-400 leading-relaxed">
                        {t.terms}
                    </label>
                </div>

                <button
                    formAction={signup}
                    className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-black"
                >
                    {t.submit}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-400">
                {t.alreadyHaveAccount}{' '}
                <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                    {t.loginLink}
                </Link>
            </div>
        </div>
    )
}
