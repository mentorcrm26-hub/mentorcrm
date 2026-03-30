/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { DemoKanbanBoard } from '@/components/demo/demo-kanban'
import { Plus, UploadCloud } from 'lucide-react'
import { SimulateLeadButton } from '@/components/demo/simulate-lead-button'
import { AIChatWidget } from '@/components/ai/chat-widget'
import { VoiceAssistantButton } from '@/components/ai/voice-assistant-button'

export default function DemoLeadsPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 relative">
            {/* Ambient background glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] pointer-events-none" />

            <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 shrink-0 gap-4 relative z-10 px-6 pt-6">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Lead Management</h1>
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Live Engine</span>
                        </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 max-w-md">
                        Strategic management with artificial intelligence support. Interactive demo mode.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <SimulateLeadButton />
                    {/* Fake action buttons for demonstration */}
                    <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 h-9 px-4 py-2 text-zinc-900 dark:text-zinc-100 shrink-0 shadow-sm cursor-not-allowed opacity-70" title="Disabled in Demo">
                        <UploadCloud className="w-4 h-4 mr-2" />
                        Import CSV
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white shadow-sm hover:bg-blue-700 h-9 px-4 py-2 shrink-0 cursor-not-allowed opacity-70" title="Disabled in Demo">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Lead
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-hidden relative">
                {/* Scrollable Container for Kanban */}
                <div className="h-full w-full absolute inset-0">
                    <DemoKanbanBoard />
                </div>

                {/* AI Employee Preview */}
                <div className="absolute bottom-24 right-6 pointer-events-auto z-[9998]">
                    <VoiceAssistantButton
                        assistantId="demo-id"
                        label="Talk to Expert"
                    />
                </div>

                <AIChatWidget
                    configId="demo-config"
                    title="Mentor AI Strategic Advisor"
                    subtitle="Planning & Strategy 24/7"
                />
            </main>
        </div>
    )
}
