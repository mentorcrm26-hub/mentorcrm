import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { cookies } from 'next/headers'
import { requestPasswordReset } from './actions'

const translations = {
    pt: {
        title: 'RECUPERAR ACESSO',
        subtitle: 'INSIRA SEU E-MAIL CADASTRADO',
        subtitleSent: 'VERIFIQUE SEU E-MAIL',
        emailLabel: 'IDENTIFICADOR (EMAIL)',
        emailPlaceholder: 'agente@mentor-crm.com',
        submit: 'ENVIAR LINK DE RECUPERAÇÃO',
        backToLogin: 'VOLTAR AO LOGIN',
        sentMessage: 'SE O E-MAIL ESTIVER CADASTRADO, VOCÊ RECEBERÁ UM LINK PARA REDEFINIR SUA SENHA.',
    },
    en: {
        title: 'RECOVER ACCESS',
        subtitle: 'ENTER YOUR REGISTERED EMAIL',
        subtitleSent: 'CHECK YOUR EMAIL',
        emailLabel: 'IDENTIFIER (EMAIL)',
        emailPlaceholder: 'agent@mentor-crm.com',
        submit: 'SEND RECOVERY LINK',
        backToLogin: 'BACK TO LOGIN',
        sentMessage: 'IF THE EMAIL IS REGISTERED, YOU WILL RECEIVE A LINK TO RESET YOUR PASSWORD.',
    },
    es: {
        title: 'RECUPERAR ACCESO',
        subtitle: 'INGRESE SU EMAIL REGISTRADO',
        subtitleSent: 'VERIFIQUE SU EMAIL',
        emailLabel: 'IDENTIFICADOR (EMAIL)',
        emailPlaceholder: 'agente@mentor-crm.com',
        submit: 'ENVIAR ENLACE DE RECUPERACIÓN',
        backToLogin: 'VOLVER AL LOGIN',
        sentMessage: 'SI EL EMAIL ESTÁ REGISTRADO, RECIBIRÁ UN ENLACE PARA RESTABLECER SU CONTRASEÑA.',
    },
}

type Language = keyof typeof translations

export default async function ForgotPasswordPage({
    searchParams,
}: {
    searchParams: Promise<{ sent?: string }>
}) {
    const p = await searchParams
    const sent = p?.sent === 'true'

    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Language | undefined
    const lang: Language = localeCookie && translations[localeCookie] ? localeCookie : 'en'
    const t = translations[lang]

    return (
        <div className="glass-strong p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-[0_32px_100px_rgba(0,12,36,0.5)] relative overflow-hidden border-white/10 w-full max-w-md mx-auto">
            <div className="mb-12 text-center flex flex-col items-center">
                <Link href="/login" className="flex items-center gap-2 group mb-12">
                    <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-display font-black text-xl">M</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-white">
                        MENTOR<span className="text-brand-300">CRM</span>
                    </span>
                </Link>
                <h1 className="text-xs font-display font-black tracking-[0.4em] uppercase text-brand-300 mb-3">{t.title}</h1>
                <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-white/30">
                    {sent ? t.subtitleSent : t.subtitle}
                </p>
            </div>

            {sent ? (
                <div className="flex flex-col items-center gap-6 py-4">
                    <CheckCircle className="h-12 w-12 text-brand-300" />
                    <p className="text-center text-[11px] font-display font-black uppercase tracking-widest text-white/60 leading-relaxed">
                        {t.sentMessage}
                    </p>
                </div>
            ) : (
                <form className="flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="email">
                            {t.emailLabel}
                        </label>
                        <input
                            className="bg-white/5 border border-white/10 px-6 py-5 text-sm text-white placeholder-white/20 rounded-2xl focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner"
                            id="email"
                            name="email"
                            type="email"
                            placeholder={t.emailPlaceholder}
                            required
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            formAction={requestPasswordReset}
                            className="group relative flex w-full h-16 items-center justify-center bg-brand-500 hover:bg-brand-600 px-8 text-xs font-display font-black uppercase tracking-[0.4em] text-white transition-all rounded-2xl shadow-[0_10px_30px_rgba(0,112,204,0.4)] active:scale-95 cursor-pointer"
                        >
                            {t.submit}
                        </button>
                    </div>
                </form>
            )}

            <div className="mt-12 pt-10 border-t border-white/5 text-center">
                <Link href="/login" className="group text-[10px] font-display font-black uppercase tracking-widest text-white/30 hover:text-brand-300 flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    {t.backToLogin}
                </Link>
            </div>
        </div>
    )
}
