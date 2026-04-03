'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative w-full">
            <input
                {...props}
                type={showPassword ? 'text' : 'password'}
                className={cn(
                    "w-full bg-white/5 border border-white/10 px-6 py-4 text-sm text-white placeholder-white/20 rounded-2xl focus:outline-none focus:border-brand-500/50 focus:bg-white/10 transition-all shadow-inner pr-14",
                    className
                )}
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white/50 transition-colors focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
                {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                ) : (
                    <Eye className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}
