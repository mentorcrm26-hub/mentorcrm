'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useDemo } from '@/components/demo/demo-provider'
import { Sparkles } from 'lucide-react'

export function SimulateLeadButton() {
    const { simulateLead } = useDemo()

    return (
        <button
            onClick={simulateLead}
            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg h-9 px-4 py-2 shrink-0 animate-in fade-in zoom-in duration-300 group"
            title="Create a fake lead instantly"
        >
            <Sparkles className="w-4 h-4 mr-2 text-indigo-200 group-hover:text-white transition-colors" />
            Simular Novo Diagnóstico
        </button>
    )
}
