'use client';

import React, { useState } from 'react';
import { signup } from '../actions';
import { ArrowRight } from 'lucide-react';

interface SignupFormProps {
    t: Record<string, string>;
}

export default function SignupForm({ t }: SignupFormProps) {
    const [phone, setPhone] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits
        
        // Apply US mask: (XXX) XXX-XXXX
        let maskedValue = '';
        if (value.length > 0) {
            maskedValue = '(' + value.slice(0, 3);
            if (value.length > 3) {
                maskedValue += ') ' + value.slice(3, 6);
            }
            if (value.length > 6) {
                maskedValue += '-' + value.slice(6, 10);
            }
        }
        
        setPhone(maskedValue);
    };

    return (
        <form className="flex flex-col gap-6" action={signup}>
            {/* Name */}
            <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="full_name">{t.fullName}</label>
                <input
                    className="border border-zinc-200 bg-zinc-50 px-6 py-4 text-sm text-zinc-900 placeholder-zinc-300 rounded-2xl focus:outline-none focus:border-mentor-blue/30 focus:bg-white transition-all shadow-sm"
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder={t.namePlaceholder}
                    required
                />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="email">{t.emailLabel}</label>
                <input
                    className="border border-zinc-200 bg-zinc-50 px-6 py-4 text-sm text-zinc-900 placeholder-zinc-300 rounded-2xl focus:outline-none focus:border-mentor-blue/30 focus:bg-white transition-all shadow-sm"
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    required
                />
            </div>

            {/* Phone (Masked) */}
            <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="phone">{t.phoneLabel || 'TELEFONE (US)'}</label>
                <input
                    className="border border-zinc-200 bg-zinc-50 px-6 py-4 text-sm text-zinc-900 placeholder-zinc-300 rounded-2xl focus:outline-none focus:border-mentor-blue/30 focus:bg-white transition-all shadow-sm"
                    id="phone"
                    name="phone"
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(XXX) XXX-XXXX"
                    required
                />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase" htmlFor="password">{t.passwordLabel}</label>
                <input
                    className="border border-zinc-200 bg-zinc-50 px-6 py-4 text-sm text-zinc-900 placeholder-zinc-300 rounded-2xl focus:outline-none focus:border-mentor-blue/30 focus:bg-white transition-all shadow-sm"
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    minLength={6}
                    required
                />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-4 p-5 bg-zinc-50 border border-zinc-100 rounded-2xl mt-2 shadow-inner">
                <input type="checkbox" id="terms" name="terms" className="mt-1 h-4 w-4 accent-mentor-blue rounded border-zinc-200" required />
                <label htmlFor="terms" className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.05em] leading-relaxed">
                    {t.terms}
                </label>
            </div>

            {/* Submit */}
            <div className="pt-4">
                <button
                    type="submit"
                    className="group relative flex w-full h-16 items-center justify-center bg-zinc-900 px-8 text-[11px] font-black uppercase tracking-[0.4em] text-white transition-all hover:bg-mentor-blue rounded-2xl shadow-xl shadow-zinc-200"
                >
                    {t.submit}
                </button>
            </div>
        </form>
    );
}
