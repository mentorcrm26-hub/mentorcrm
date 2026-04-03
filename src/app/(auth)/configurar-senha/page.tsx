import { KeyRound, AlertCircle, ArrowRight } from 'lucide-react'
import { cookies } from 'next/headers'
import { setPassword } from './actions'

type Locale = 'en' | 'pt' | 'es'

const T = {
    en: {
        title: 'CREATE YOUR PASSWORD',
        subtitle: 'Set a password to access your workspace in future logins.',
        labelPassword: 'NEW PASSWORD',
        placeholderPassword: 'At least 8 characters',
        labelConfirm: 'CONFIRM PASSWORD',
        placeholderConfirm: 'Repeat the password',
        submit: 'SAVE & ACCESS',
    },
    pt: {
        title: 'CRIE SUA SENHA',
        subtitle: 'Defina uma senha para acessar seu workspace nos próximos logins.',
        labelPassword: 'NOVA SENHA',
        placeholderPassword: 'Mínimo 8 caracteres',
        labelConfirm: 'CONFIRMAR SENHA',
        placeholderConfirm: 'Repita a senha',
        submit: 'SALVAR E ACESSAR',
    },
    es: {
        title: 'CREA TU CONTRASEÑA',
        subtitle: 'Define una contraseña para acceder a tu workspace en futuros inicios de sesión.',
        labelPassword: 'NUEVA CONTRASEÑA',
        placeholderPassword: 'Mínimo 8 caracteres',
        labelConfirm: 'CONFIRMAR CONTRASEÑA',
        placeholderConfirm: 'Repite la contraseña',
        submit: 'GUARDAR Y ACCEDER',
    },
}

import { PasswordInput } from '@/components/ui/password-input'

export default async function ConfigurarSenhaPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    const cookieStore = await cookies()
    const locale = (cookieStore.get('NEXT_LOCALE')?.value ?? 'en') as Locale
    const t = T[locale] ?? T.en

    return (
        <div className="glass-strong p-10 rounded-[3rem] shadow-[0_32px_100px_rgba(0,12,36,0.5)] border border-white/10">

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-6">
                    <KeyRound className="w-7 h-7 text-brand-400" />
                </div>
                <h1 className="text-2xl font-display font-black tracking-tight text-white mb-2">
                    {t.title}
                </h1>
                <p className="text-sm text-white/40 font-display font-bold leading-relaxed">
                    {t.subtitle}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs font-display font-black uppercase tracking-widest text-red-400">
                        {decodeURIComponent(error)}
                    </p>
                </div>
            )}

            {/* Form */}
            <form action={setPassword} className="space-y-5">
                <div>
                    <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                        {t.labelPassword}
                    </label>
                    <PasswordInput
                        name="password"
                        required
                        minLength={8}
                        placeholder={t.placeholderPassword}
                        className="py-3.5"
                    />
                </div>

                <div>
                    <label className="text-[10px] font-display font-black uppercase tracking-widest text-white/40 block mb-2">
                        {t.labelConfirm}
                    </label>
                    <PasswordInput
                        name="confirm"
                        required
                        minLength={8}
                        placeholder={t.placeholderConfirm}
                        className="py-3.5"
                    />
                </div>


                <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-full text-xs font-display font-black uppercase tracking-widest hover:shadow-[0_10px_30px_rgba(0,112,204,0.5)] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 mt-2"
                >
                    {t.submit}
                    <ArrowRight className="w-4 h-4" />
                </button>
            </form>
        </div>
    )
}
