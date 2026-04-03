'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { Menu, X, Facebook, Instagram, LogIn, Sparkles } from 'lucide-react'
import { LocaleSelector } from './locale-selector'

interface PublicMobileNavProps {
  t: any;
  lang: string;
}

export function PublicMobileNav({ t, lang }: PublicMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const links = [
    { label: t.navFeatures, href: '#features' },
    { label: t.navHowItWorks, href: '#how-it-works' },
    { label: t.navPricing, href: '#pricing' },
  ]

  if (!mounted) {
    return (
      <button className="md:hidden p-2 -mr-1 text-white/70">
        <Menu className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -mr-1 text-white/70 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {createPortal(
        <div className={`fixed inset-0 z-[9999] md:hidden ${isOpen ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-brand-900/60 backdrop-blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            className={`absolute inset-y-0 right-0 z-[101] w-[300px] sm:w-[350px] bg-brand-900 border-l border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-out flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,112,204,0.5)]">
                  <span className="text-white font-display font-black text-lg">M</span>
                </div>
                <span className="font-display font-bold tracking-tight text-white text-lg uppercase tracking-widest">
                  MENTOR<span className="text-brand-300">CRM</span>
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto pt-12 px-8 space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-display font-black text-white/30 uppercase tracking-[0.3em] mb-4">Navigation</p>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between py-4 text-xl font-display font-bold text-white group"
                  >
                    {link.label}
                    <div className="h-1 w-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-300" />
                  </Link>
                ))}
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 py-4 text-white/60 hover:text-white transition-colors text-lg font-display font-bold"
                  >
                    <LogIn className="w-5 h-5" />
                    {t.login}
                  </Link>
              </div>

              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] font-display font-black text-white/30 uppercase tracking-[0.3em] mb-4">Language</p>
                <LocaleSelector />
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-white/5">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-5 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl text-center text-[10px] font-display font-black uppercase tracking-widest shadow-[0_4px_25px_rgba(0,112,204,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 mb-8"
              >
                <Sparkles className="h-4 w-4" />
                {t.navStartFree}
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <a href="https://facebook.com" className="text-white/30 hover:text-[#1877F2] transition-colors">
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a href="https://instagram.com" className="text-white/30 hover:text-[#E4405F] transition-colors">
                    <Instagram className="h-6 w-6" />
                  </a>
                </div>
                <p className="text-[9px] font-display font-black text-white/20 uppercase tracking-widest">Inova Digital</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
