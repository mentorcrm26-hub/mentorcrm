'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import React, { createContext, useContext, useState, useEffect } from 'react'

type Lead = {
    id: string
    name: string
    email: string | null
    phone: string | null
    notes: string | null
    status: string
    created_at: string
}

const todayStr = new Date().toISOString()

const MOCK_LEADS: Lead[] = [
    { id: '1', name: 'João Silva', email: 'joao@example.com', phone: '(11) 98765-4321', notes: 'Contact via website', status: 'New Lead', created_at: todayStr },
    { id: '2', name: 'Maria Souza', email: 'maria@example.com', phone: '(21) 99887-6655', notes: 'Interested in Income Protection', status: 'Attempting Contact', created_at: todayStr },
    { id: '3', name: 'Carlos Santos', email: 'carlos@example.com', phone: '(31) 91234-5678', notes: 'Retirement planning in progress', status: 'In Conversation', created_at: todayStr },
    { id: '4', name: 'Ana Oliveira', email: 'ana@example.com', phone: '(41) 98877-6655', notes: 'Closing meeting scheduled', status: 'Scheduled', created_at: todayStr },
    { id: '5', name: 'Lucas Costa', email: 'lucas@example.com', phone: '(51) 91122-3344', notes: 'Lead closed and winning', status: 'Won', created_at: todayStr },
    // Adicionando alguns extras para fazer volume
    ...Array(10).fill(null).map((_, i) => ({ id: `new_${i}`, name: `Lead Extra ${i}`, email: null, phone: null, notes: null, status: 'New Lead', created_at: todayStr })),
    ...Array(4).fill(null).map((_, i) => ({ id: `contact_${i}`, name: `Under Analysis ${i}`, email: null, phone: null, notes: null, status: 'Attempting Contact', created_at: todayStr })),
    ...Array(2).fill(null).map((_, i) => ({ id: `sched_${i}`, name: `Strategy Extra ${i}`, email: null, phone: null, notes: null, status: 'In Conversation', created_at: todayStr })),
]

type DemoContextType = {
    leads: Lead[]
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>
    simulateLead: () => void
    toastMessage: string | null
    setToastMessage: (msg: string | null) => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoProvider({ children }: { children: React.ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
    const [toastMessage, setToastMessage] = useState<string | null>(null)

    // Opcional: Persistir no localStorage para não perder caso dê f5
    useEffect(() => {
        const saved = localStorage.getItem('mentor_demo_leads_v2')
        if (saved) {
            try {
                setLeads(JSON.parse(saved))
            } catch (e) { }
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('mentor_demo_leads_v2', JSON.stringify(leads))
    }, [leads])

    const simulateLead = () => {
        const fakeNames = ["Fernanda Lima", "Pedro Rocha", "Camila Alves", "Roberto Dias"]
        const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)]
        const newLead: Lead = {
            id: `sim_${Date.now()}`,
            name: randomName,
            email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
            phone: `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}`,
            notes: 'Captured for Financial Diagnosis',
            status: 'New Lead',
            created_at: new Date().toISOString()
        }

        setLeads(prev => [newLead, ...prev])
        setToastMessage("✨ New Diagnostic Request! Prepare the analysis.")

        setTimeout(() => setToastMessage(null), 4000)
    }

    return (
        <DemoContext.Provider value={{ leads, setLeads, simulateLead, toastMessage, setToastMessage }}>
            {children}
            {/* Global toast overlay for demo */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-emerald-500/90 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-lg border border-emerald-400 font-medium flex items-center gap-2">
                        <span className="relative flex h-3 w-3 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        {toastMessage}
                    </div>
                </div>
            )}
        </DemoContext.Provider>
    )
}

export function useDemo() {
    const context = useContext(DemoContext)
    if (context === undefined) {
        throw new Error('useDemo must be used within a DemoProvider')
    }
    return context
}
