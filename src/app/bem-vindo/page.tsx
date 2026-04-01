import Link from 'next/link'
import { CheckCircle2, Mail, ArrowRight } from 'lucide-react'

export default function BemVindoPage() {
    return (
        <div className="min-h-screen bg-brand-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#000C24_0%,#001333_40%,#001F50_70%,#000C24_100%)]" />
                <div className="absolute inset-0 opacity-45"
                    style={{
                        background: `
                            radial-gradient(ellipse 80% 60% at 15% 40%, rgba(0,85,164,0.45) 0%, transparent 65%),
                            radial-gradient(ellipse 60% 50% at 85% 15%, rgba(0,51,128,0.35) 0%, transparent 60%)
                        `,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-fade-up">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group justify-center">
                    <div className="h-10 w-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-white font-display font-black text-xl">M</span>
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-white">
                        MENTOR<span className="text-brand-300">CRM</span>
                    </span>
                </Link>

                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-brand-400" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-display font-black tracking-tight text-white">
                        Pagamento Confirmado!
                    </h1>
                    <p className="text-white/50 font-display font-bold text-sm leading-relaxed">
                        Seu workspace está sendo criado. Você receberá um email em instantes com o link para definir sua senha e acessar o CRM.
                    </p>
                </div>

                {/* Email hint */}
                <div className="glass-strong p-6 rounded-3xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-display font-bold text-white/60">
                        <Mail className="w-5 h-5 text-brand-400 shrink-0" />
                        Verifique sua caixa de entrada (e a pasta de spam) pelo email da Mentor CRM
                    </div>
                    <p className="text-[10px] font-display font-black uppercase tracking-widest text-white/20">
                        O email pode levar até 5 minutos para chegar.
                    </p>
                </div>

                {/* Login link */}
                <p className="text-white/30 text-xs font-display font-black uppercase tracking-widest">
                    Já definiu sua senha?{' '}
                    <Link href="/login" className="text-brand-300 hover:text-white transition-colors inline-flex items-center gap-1">
                        Acessar o Painel <ArrowRight className="w-3 h-3" />
                    </Link>
                </p>
            </div>
        </div>
    )
}
