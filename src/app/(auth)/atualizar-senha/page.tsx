import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { updatePassword } from './actions'
import { PasswordInput } from '@/components/ui/password-input'

export default async function AtualizarSenhaPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string; msg?: string }>
}) {
    const p = await searchParams

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
                <h1 className="text-xs font-display font-black tracking-[0.4em] uppercase text-brand-300 mb-3">NOVA SENHA</h1>
                <p className="text-[10px] font-display font-black uppercase tracking-[0.4em] text-white/30">DEFINA SUA NOVA CHAVE DE ACESSO</p>
            </div>

            {p?.error && (
                <div className="mb-8 flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-red-500 leading-relaxed">
                        {p.msg || 'ERRO AO ATUALIZAR SENHA.'}
                    </p>
                </div>
            )}

            <form className="flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="password">
                        NOVA SENHA
                    </label>
                    <PasswordInput
                        className="py-5"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-display font-black tracking-[0.2em] text-white/30 uppercase" htmlFor="confirm">
                        CONFIRMAR SENHA
                    </label>
                    <PasswordInput
                        className="py-5"
                        id="confirm"
                        name="confirm"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <div className="pt-4">
                    <button
                        formAction={updatePassword}
                        className="group relative flex w-full h-16 items-center justify-center bg-brand-500 hover:bg-brand-600 px-8 text-xs font-display font-black uppercase tracking-[0.4em] text-white transition-all rounded-2xl shadow-[0_10px_30px_rgba(0,112,204,0.4)] active:scale-95 cursor-pointer"
                    >
                        SALVAR NOVA SENHA
                    </button>
                </div>
            </form>
        </div>
    )
}
