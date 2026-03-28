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
        className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-xl border border-zinc-200 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:border-mentor-blue/30 hover:text-mentor-blue transition-all"
      >
        <Globe className="h-3 w-3" />
        <span>{currentLang.code}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-40 bg-white border border-zinc-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLocaleChange(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-left transition-colors ${
                  currentLocale === lang.code 
                    ? 'bg-zinc-50 text-mentor-blue' 
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
