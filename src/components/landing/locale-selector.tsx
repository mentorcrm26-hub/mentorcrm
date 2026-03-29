'use client';

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function LocaleSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    const locale = document.cookie
      .split('; ')
      .find((row) => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1];
    if (locale) {
      setCurrentLocale(locale);
    }
  }, []);

  const handleLocaleChange = (code: string) => {
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;
    setCurrentLocale(code);
    setIsOpen(false);
    window.location.reload();
  };

  const currentLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:border-brand-300/50 hover:bg-white/20 transition-all cursor-pointer active:scale-95"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{currentLang.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-3 right-0 w-48 bg-brand-900/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-50 overflow-hidden py-3 animate-fade-up">
            <div className="px-4 pb-2 mb-2 border-b border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Select Language</p>
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLocaleChange(lang.code)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-left transition-all cursor-pointer ${
                  currentLocale === lang.code 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-sm">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
