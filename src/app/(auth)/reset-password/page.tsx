import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updatePassword } from './actions'
import { PasswordInput } from '@/components/ui/password-input'

const translations = {
    pt: {
        title: 'NOVA SENHA',
        subtitle: 'DEFINA SUA NOVA CHAVE DE ACESSO',
        newPassword: 'NOVA SENHA',
        confirmPassword: 'CONFIRMAR SENHA',
        placeholder: '••••••••',
        submit: 'SALVAR NOVA SENHA',
        defaultError: 'ERRO AO ATUALIZAR SENHA.',
        mismatch: 'AS SENHAS NÃO COINCIDEM.',
        successMsg: 'SENHA ATUALIZADA COM SUCESSO.',
    },
    en: {
        title: 'NEW PASSWORD',
        subtitle: 'SET YOUR NEW ACCESS KEY',
        newPassword: 'NEW PASSWORD',
        confirmPassword: 'CONFIRM PASSWORD',
        placeholder: '••••••••',
        submit: 'SAVE NEW PASSWORD',
        defaultError: 'ERROR UPDATING PASSWORD.',
        mismatch: 'PASSWORDS DO NOT MATCH.',
        successMsg: 'PASSWORD UPDATED SUCCESSFULLY.',
    },
    es: {
        title: 'NUEVA CONTRASEÑA',
        subtitle: 'DEFINA SU NUEVA CLAVE DE ACCESO',
        newPassword: 'NUEVA CONTRASEÑA',
        confirmPassword: 'CONFIRMAR CONTRASEÑA',
        placeholder: '••••••••',
        submit: 'GUARDAR NUEVA CONTRASEÑA',
        defaultError: 'ERROR AL ACTUALIZAR CONTRASEÑA.',
        mismatch: 'LAS CONTRASEÑAS NO COINCIDEN.',
        successMsg: 'CONTRASEÑA ACTUALIZADA CON ÉXITO.',
    },
}

type Language = keyof typeof translations

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; msg?: string }>
}) {
    const p = await searchParams

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Language | undefined
    const lang: Language = localeCookie && translations[localeCookie] ? localeCookie : 'en'
    const t = translations[lang]

    return (
        <div className="glass-strong p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-[0_32px_100px_rgba(0,12,36,0.5)] relative overflow-hidden border-white/10 w-full max-w-md mx-auto">
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
                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-red-500 leading-relaxed">
                        {p.msg || t.defaultError}
                    </p>
                </div>
            )}

            <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="password">
                        {t.newPassword}
                    </label>
                    <PasswordInput className="py-5" id="password" name="password" placeholder={t.placeholder} required />
                </div>
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="confirm">
                        {t.confirmPassword}
                    </label>
                    <PasswordInput className="py-5" id="confirm" name="confirm" placeholder={t.placeholder} required />
                </div>
                <div className="pt-4">
                    <button
                        formAction={updatePassword}
                        className="group relative flex w-full h-16 items-center justify-center bg-brand-500 hover:bg-brand-600 px-8 text-xs font-display font-black uppercase tracking-[0.4em] text-white transition-all rounded-2xl shadow-[0_10px_30px_rgba(0,112,204,0.4)] active:scale-95 cursor-pointer"
                    >
                        {t.submit}
                    </button>
                </div>
            </form>
        </div>
    )
}
