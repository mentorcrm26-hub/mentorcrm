/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-brand-900 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-brand-500/30 selection:text-brand-300 font-sans">
            
            {/* ─── ANIMATED BACKGROUND ─── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(160deg,#000C24_0%,#001333_40%,#001F50_70%,#000C24_100%)]" />
                <div className="absolute inset-0 opacity-45 animate-mesh-shift" 
                    style={{
                    background: `
                        radial-gradient(ellipse 80% 60% at 15% 40%, rgba(0,85,164,0.45) 0%, transparent 65%),
                        radial-gradient(ellipse 60% 50% at 85% 15%, rgba(0,51,128,0.35) 0%, transparent 60%),
                        radial-gradient(ellipse 50% 70% at 60% 85%, rgba(0,112,204,0.25) 0%, transparent 55%),
                        radial-gradient(ellipse 40% 40% at 40% 60%, rgba(51,153,230,0.1) 0%, transparent 50%)
                    `,
                    backgroundSize: '200% 200%'
                    }}
                />
                <div className="absolute inset-0 bg-[url('https://grain-y.com/assets/grain.png')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            {/* Back button */}
            <div className="absolute top-8 left-8 z-20">
                <Link
                    href="/"
                    className="glass px-4 py-2 rounded-full flex items-center gap-2 text-xs font-display font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all group scale-90 md:scale-100"
                >
                    <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            <div className="z-10 w-full max-w-md animate-fade-up">
                {children}
            </div>
        </div>
    );
}
