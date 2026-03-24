'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Link2 } from 'lucide-react'
import { Drawing } from '@/types/draw'
import {
    updateDrawingCanvasData,
    updateDrawingTitle,
    uploadDrawingThumbnail,
} from '@/app/dashboard/draw/actions'
import { DrawToolbar } from './draw-toolbar'
import { DrawLinkLeadModal } from './draw-link-lead-modal'
import { toast } from 'sonner'

// Dynamic import — Fabric.js must run only on the client (no SSR)
let fabricModule: typeof import('fabric') | null = null

const CANVAS_WIDTH = 1280
const CANVAS_HEIGHT = 720
const MAX_HISTORY = 50

interface DrawCanvasEditorProps {
    drawing: Drawing
}

export function DrawCanvasEditor({ drawing }: DrawCanvasEditorProps) {
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<any>(null)   // fabric.Canvas instance
    const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [title, setTitle] = useState(drawing.title)
    const [isSaving, setIsSaving] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [linkModalOpen, setLinkModalOpen] = useState(false)
    const [history, setHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const isUndoRedo = useRef(false)

    // ── Initialize Fabric.js ─────────────────────────────────────────────────
    useEffect(() => {
        let canvas: any

        const init = async () => {
            fabricModule = await import('fabric')
            const { Canvas, PencilBrush } = fabricModule

            canvas = new Canvas(canvasRef.current!, {
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                backgroundColor: '#ffffff',
                selection: true,
            })

            // Set default freehand brush
            canvas.freeDrawingBrush = new PencilBrush(canvas)
            canvas.freeDrawingBrush.color = '#1e1e1e'
            canvas.freeDrawingBrush.width = 3

            fabricRef.current = canvas

            // Load saved canvas data if exists
            if (drawing.canvas_data && Object.keys(drawing.canvas_data).length > 0) {
                await canvas.loadFromJSON(drawing.canvas_data)
                canvas.renderAll()
            }

            // Push initial state to history
            pushHistory(canvas)
            setIsReady(true)

            // Listen for canvas mutations to trigger auto-save
            canvas.on('object:added', () => { if (!isUndoRedo.current) onCanvasChanged(canvas) })
            canvas.on('object:modified', () => onCanvasChanged(canvas))
            canvas.on('object:removed', () => { if (!isUndoRedo.current) onCanvasChanged(canvas) })

            // Keyboard: Delete/Backspace removes selected objects
            const handleKeyDown = (e: KeyboardEvent) => {
                const tag = (e.target as HTMLElement)?.tagName
                if (tag === 'INPUT' || tag === 'TEXTAREA') return
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    canvas.getActiveObjects().forEach((obj: any) => canvas.remove(obj))
                    canvas.discardActiveObject()
                    canvas.renderAll()
                }
            }
            window.addEventListener('keydown', handleKeyDown)
            ;(canvas as any)._keyHandler = handleKeyDown
        }

        init()

        return () => {
            if (canvas) {
                if ((canvas as any)._keyHandler) {
                    window.removeEventListener('keydown', (canvas as any)._keyHandler)
                }
                canvas.dispose()
            }
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // ── History (undo/redo) ───────────────────────────────────────────────────
    const pushHistory = useCallback((canvas: any) => {
        const json = JSON.stringify(canvas.toJSON())
        setHistory(prev => {
            const trimmed = prev.slice(0, MAX_HISTORY)
            return [json, ...trimmed]
        })
        setHistoryIndex(0)
    }, [])

    const onCanvasChanged = useCallback((canvas: any) => {
        pushHistory(canvas)
        // Debounced auto-save (5 seconds)
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
        autoSaveTimer.current = setTimeout(() => {
            autoSave(canvas)
        }, 5000)
    }, [pushHistory])

    const autoSave = async (canvas: any) => {
        const canvasData = canvas.toJSON()
        await updateDrawingCanvasData(drawing.id, canvasData)
    }

    const undo = useCallback(async () => {
        if (!fabricRef.current || historyIndex >= history.length - 1) return
        const newIndex = historyIndex + 1
        isUndoRedo.current = true
        await fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]))
        fabricRef.current.renderAll()
        setHistoryIndex(newIndex)
        isUndoRedo.current = false
    }, [history, historyIndex])

    const redo = useCallback(async () => {
        if (!fabricRef.current || historyIndex <= 0) return
        const newIndex = historyIndex - 1
        isUndoRedo.current = true
        await fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]))
        fabricRef.current.renderAll()
        setHistoryIndex(newIndex)
        isUndoRedo.current = false
    }, [history, historyIndex])

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!fabricRef.current) return
        setIsSaving(true)
        try {
            // 1. Save canvas JSON
            const canvasData = fabricRef.current.toJSON()
            await updateDrawingCanvasData(drawing.id, canvasData)

            // 2. Generate and upload PNG thumbnail
            const png = fabricRef.current.toDataURL({ format: 'png', quality: 0.8, multiplier: 0.5 })
            await uploadDrawingThumbnail(drawing.id, png)

            // 3. Save title if changed
            if (title !== drawing.title) {
                await updateDrawingTitle(drawing.id, title)
            }

            toast.success('Drawing saved!')
        } catch {
            toast.error('Failed to save drawing')
        } finally {
            setIsSaving(false)
        }
    }

    // ── Title edit ────────────────────────────────────────────────────────────
    const handleTitleBlur = async () => {
        if (title.trim() && title !== drawing.title) {
            await updateDrawingTitle(drawing.id, title.trim())
        }
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 gap-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push('/dashboard/draw')}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>

                    <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        className="text-base font-bold bg-transparent border-none outline-none text-zinc-900 dark:text-white w-56 truncate focus:bg-zinc-50 dark:focus:bg-zinc-900 px-2 py-1 rounded-lg transition-colors"
                        placeholder="Drawing title..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLinkModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                    >
                        <Link2 className="w-3.5 h-3.5" />
                        Link to Lead
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-60"
                    >
                        {isSaving
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Save className="w-3.5 h-3.5" />
                        }
                        Save
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex flex-1 min-h-0 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                {/* Toolbar (left) */}
                {isReady && (
                    <DrawToolbar
                        fabricRef={fabricRef}
                        onUndo={undo}
                        onRedo={redo}
                        canUndo={historyIndex < history.length - 1}
                        canRedo={historyIndex > 0}
                    />
                )}

                {/* Canvas container */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                    <div
                        className="shadow-2xl rounded-lg overflow-hidden"
                        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                    >
                        {!isReady && (
                            <div className="w-full h-full bg-white flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-zinc-300 animate-spin" />
                            </div>
                        )}
                        <canvas ref={canvasRef} />
                    </div>
                </div>
            </div>

            {/* Link to Lead Modal */}
            <DrawLinkLeadModal
                isOpen={linkModalOpen}
                onClose={() => setLinkModalOpen(false)}
                drawingId={drawing.id}
            />
        </div>
    )
}
