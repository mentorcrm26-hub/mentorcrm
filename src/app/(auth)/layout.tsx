import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Texture */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            <div className="absolute inset-0 z-0 bg-transparent bg-[radial-gradient(circle_at_center,theme(colors.emerald.900/20%)_-30%,transparent_70%)]"></div>

            {/* Back button */}
            <div className="absolute top-8 left-8 z-20">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 transform group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>

            <div className="z-10 w-full max-w-md">
                {children}
            </div>
        </div>
    );
}
