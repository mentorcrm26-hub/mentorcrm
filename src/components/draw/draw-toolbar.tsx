'use client'

/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */


import { useState, useRef, MutableRefObject } from 'react'
import {
    Pen, Square, Circle, Minus, Type, Eraser,
    Trash2, Undo2, Redo2, MousePointer2,
    PersonStanding, User
} from 'lucide-react'

type Tool = 'select' | 'pen' | 'rect' | 'circle' | 'line' | 'text' | 'eraser' | 'man' | 'woman'

const COLORS = [
    '#1e1e1e', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
    '#ffffff', '#94a3b8',
]

const STROKE_WIDTHS = [1, 2, 4, 8, 16]

interface DrawToolbarProps {
    fabricRef: MutableRefObject<any>
    onUndo: () => void
    onRedo: () => void
    canUndo: boolean
    canRedo: boolean
}

export function DrawToolbar({ fabricRef, onUndo, onRedo, canUndo, canRedo }: DrawToolbarProps) {
    const [activeTool, setActiveTool] = useState<Tool>('pen')
    const [strokeColor, setStrokeColor] = useState('#1e1e1e')
    const [fillColor, setFillColor] = useState('transparent')
    const [strokeWidth, setStrokeWidth] = useState(3)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const fillInputRef = useRef<HTMLInputElement>(null)

    const getFabric = () => fabricRef.current

    const applyTool = async (tool: Tool) => {
        const canvas = getFabric()
        if (!canvas) return
        setActiveTool(tool)

        // Disable drawing mode first
        canvas.isDrawingMode = false
        canvas.selection = true
        canvas.defaultCursor = 'default'

        const fab = await import('fabric')

        if (tool === 'select') {
            canvas.isDrawingMode = false
        }

        if (tool === 'pen') {
            canvas.isDrawingMode = true
            canvas.freeDrawingBrush.color = strokeColor
            canvas.freeDrawingBrush.width = strokeWidth
        }

        if (tool === 'eraser') {
            canvas.isDrawingMode = true
            canvas.freeDrawingBrush.color = '#ffffff'
            canvas.freeDrawingBrush.width = strokeWidth * 4
        }

        if (tool === 'rect') {
            canvas.isDrawingMode = false
            canvas.selection = false
            canvas.defaultCursor = 'crosshair'

            let isDown = false, startX = 0, startY = 0, rect: any

            const onMouseDown = (opt: any) => {
                isDown = true
                const pointer = canvas.getScenePoint(opt.e)
                startX = pointer.x
                startY = pointer.y
                rect = new fab.Rect({
                    left: startX, top: startY,
                    width: 0, height: 0,
                    fill: fillColor === 'transparent' ? 'transparent' : fillColor,
                    stroke: strokeColor, strokeWidth,
                    selectable: false,
                })
                canvas.add(rect)
            }
            const onMouseMove = (opt: any) => {
                if (!isDown) return
                const p = canvas.getScenePoint(opt.e)
                rect.set({ width: Math.abs(p.x - startX), height: Math.abs(p.y - startY) })
                if (p.x < startX) rect.set({ left: p.x })
                if (p.y < startY) rect.set({ top: p.y })
                canvas.renderAll()
            }
            const onMouseUp = () => {
                isDown = false
                rect.set({ selectable: true })
                canvas.off('mouse:down', onMouseDown)
                canvas.off('mouse:move', onMouseMove)
                canvas.off('mouse:up', onMouseUp)
                canvas.selection = true
                canvas.defaultCursor = 'default'
                applyTool('select')
            }
            canvas.on('mouse:down', onMouseDown)
            canvas.on('mouse:move', onMouseMove)
            canvas.on('mouse:up', onMouseUp)
        }

        if (tool === 'circle') {
            canvas.isDrawingMode = false
            canvas.selection = false
            canvas.defaultCursor = 'crosshair'

            let isDown = false, startX = 0, startY = 0, ellipse: any

            const onMouseDown = (opt: any) => {
                isDown = true
                const p = canvas.getScenePoint(opt.e)
                startX = p.x; startY = p.y
                ellipse = new fab.Ellipse({
                    left: startX, top: startY,
                    rx: 0, ry: 0,
                    fill: fillColor === 'transparent' ? 'transparent' : fillColor,
                    stroke: strokeColor, strokeWidth,
                    selectable: false,
                })
                canvas.add(ellipse)
            }
            const onMouseMove = (opt: any) => {
                if (!isDown) return
                const p = canvas.getScenePoint(opt.e)
                ellipse.set({ rx: Math.abs(p.x - startX) / 2, ry: Math.abs(p.y - startY) / 2 })
                canvas.renderAll()
            }
            const onMouseUp = () => {
                isDown = false
                ellipse.set({ selectable: true })
                canvas.off('mouse:down', onMouseDown)
                canvas.off('mouse:move', onMouseMove)
                canvas.off('mouse:up', onMouseUp)
                canvas.selection = true
                canvas.defaultCursor = 'default'
                applyTool('select')
            }
            canvas.on('mouse:down', onMouseDown)
            canvas.on('mouse:move', onMouseMove)
            canvas.on('mouse:up', onMouseUp)
        }

        if (tool === 'line') {
            canvas.isDrawingMode = false
            canvas.selection = false
            canvas.defaultCursor = 'crosshair'

            let isDown = false, line: any

            const onMouseDown = (opt: any) => {
                isDown = true
                const p = canvas.getScenePoint(opt.e)
                line = new fab.Line([p.x, p.y, p.x, p.y], {
                    stroke: strokeColor, strokeWidth,
                    selectable: false,
                })
                canvas.add(line)
            }
            const onMouseMove = (opt: any) => {
                if (!isDown) return
                const p = canvas.getScenePoint(opt.e)
                line.set({ x2: p.x, y2: p.y })
                canvas.renderAll()
            }
            const onMouseUp = () => {
                isDown = false
                line.set({ selectable: true })
                canvas.off('mouse:down', onMouseDown)
                canvas.off('mouse:move', onMouseMove)
                canvas.off('mouse:up', onMouseUp)
                canvas.selection = true
                canvas.defaultCursor = 'default'
                applyTool('select')
            }
            canvas.on('mouse:down', onMouseDown)
            canvas.on('mouse:move', onMouseMove)
            canvas.on('mouse:up', onMouseUp)
        }

        if (tool === 'text') {
            canvas.isDrawingMode = false
            canvas.selection = false
            canvas.defaultCursor = 'text'

            const onMouseDown = async (opt: any) => {
                const p = canvas.getScenePoint(opt.e)
                const fab2 = await import('fabric')
                const text = new fab2.IText('Type here...', {
                    left: p.x, top: p.y,
                    fontSize: 24,
                    fill: strokeColor,
                    fontFamily: 'Inter, sans-serif',
                })
                canvas.add(text)
                canvas.setActiveObject(text)
                text.enterEditing()
                text.selectAll()
                canvas.off('mouse:down', onMouseDown)
                canvas.selection = true
                canvas.defaultCursor = 'default'
                applyTool('select')
            }
            canvas.on('mouse:down', onMouseDown)
        }

        if (tool === 'man' || tool === 'woman') {
            canvas.isDrawingMode = false
            canvas.selection = false
            canvas.defaultCursor = 'crosshair'

            const onMouseDown = async (opt: any) => {
                const p = canvas.getScenePoint(opt.e)
                const fab2 = await import('fabric')
                
                let pathData = '';
                if (tool === 'man') {
                    // Stick Man Path
                    pathData = "M 10 5 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10 10 L 10 22 M 5 14 L 15 14 M 10 22 L 6 32 M 10 22 L 14 32";
                } else {
                    // Stick Woman Path (with dress/triangle body)
                    pathData = "M 10 5 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0 M 10 10 L 5 25 L 15 25 Z M 5 14 L 15 14 M 8 25 L 7 32 M 12 25 L 13 32";
                }

                const figure = new fab2.Path(pathData, {
                    left: p.x,
                    top: p.y,
                    fill: 'transparent',
                    stroke: strokeColor,
                    strokeWidth: 2,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    originX: 'center',
                    originY: 'center'
                });

                canvas.add(figure);
                canvas.setActiveObject(figure);
                canvas.off('mouse:down', onMouseDown)
                canvas.selection = true
                canvas.defaultCursor = 'default'
                applyTool('select')
            }
            canvas.on('mouse:down', onMouseDown)
        }
    }

    const updateBrushColor = (color: string) => {
        setStrokeColor(color)
        const canvas = getFabric()
        if (!canvas) return
        if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = color
        }
        // Update selected objects
        const active = canvas.getActiveObjects()
        active.forEach((obj: any) => obj.set({ stroke: color }))
        if (active.length) canvas.renderAll()
    }

    const updateStrokeWidth = (w: number) => {
        setStrokeWidth(w)
        const canvas = getFabric()
        if (!canvas) return
        if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.width = w
        const active = canvas.getActiveObjects()
        active.forEach((obj: any) => obj.set({ strokeWidth: w }))
        if (active.length) canvas.renderAll()
    }

    const clearCanvas = () => {
        const canvas = getFabric()
        if (!canvas) return
        canvas.getObjects().forEach((obj: any) => canvas.remove(obj))
        canvas.renderAll()
    }

    const deleteSelected = () => {
        const canvas = getFabric()
        if (!canvas) return
        canvas.getActiveObjects().forEach((obj: any) => canvas.remove(obj))
        canvas.discardActiveObject()
        canvas.renderAll()
    }

    const tools: { id: Tool, icon: React.ReactNode, label: string }[] = [
        { id: 'select', icon: <MousePointer2 className="w-4 h-4" />, label: 'Select' },
        { id: 'pen', icon: <Pen className="w-4 h-4" />, label: 'Pen' },
        { id: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
        { id: 'rect', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
        { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
        { id: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
        { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Text' },
        { id: 'man', icon: <PersonStanding className="w-4 h-4" />, label: 'Stick Man' },
        { id: 'woman', icon: <User className="w-4 h-4" />, label: 'Stick Woman' },
    ]

    return (
        <div className="flex flex-col gap-1 w-14 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 py-3 px-1.5 shrink-0 overflow-y-auto">

            {/* Tools */}
            <div className="flex flex-col gap-0.5">
                {tools.map(t => (
                    <button
                        key={t.id}
                        onClick={() => applyTool(t.id)}
                        title={t.label}
                        className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all text-[9px] font-bold gap-0.5 ${activeTool === t.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        {t.icon}
                    </button>
                ))}
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Stroke width */}
            <div className="flex flex-col gap-0.5">
                {STROKE_WIDTHS.map(w => (
                    <button
                        key={w}
                        onClick={() => updateStrokeWidth(w)}
                        title={`${w}px`}
                        className={`flex items-center justify-center w-full h-7 rounded-lg transition-all ${strokeWidth === w ? 'bg-zinc-100 dark:bg-zinc-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
                    >
                        <div
                            className="rounded-full bg-zinc-700 dark:bg-zinc-300"
                            style={{ width: Math.min(w * 2.5, 28), height: Math.min(w, 10) }}
                        />
                    </button>
                ))}
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Stroke color palette */}
            <div className="flex flex-col gap-1.5 items-center py-2 px-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[8px] font-bold text-zinc-400 uppercase">Colors</span>
                <div className="grid grid-cols-2 gap-1.5">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => updateBrushColor(c)}
                            className={`w-4 h-4 rounded-full border border-black/10 transition-all ${strokeColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-sm' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                        />
                    ))}
                    {/* Custom Color Trigger */}
                    <div className="relative w-4 h-4">
                        <input
                            type="color"
                            value={strokeColor === 'transparent' ? '#000000' : strokeColor}
                            onChange={e => updateBrushColor(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-1 border-0 p-0 cursor-pointer rounded-full overflow-hidden bg-transparent"
                            style={{ width: '100%', height: '100%' }}
                        />
                        <div className="absolute inset-0 pointer-events-none rounded-full border border-black/10 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-50 shrink-0" />
                    </div>
                </div>
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Fill color palette */}
            <div className="flex flex-col gap-1.5 items-center py-2 px-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <span className="text-[8px] font-bold text-zinc-400 uppercase text-center">Fill</span>
                <div className="grid grid-cols-2 gap-1.5">
                    <button
                        onClick={() => setFillColor('transparent')}
                        className={`w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold ${fillColor === 'transparent' ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950 scale-110' : 'text-zinc-300'}`}
                        title="None"
                    >
                        ∅
                    </button>
                    {COLORS.slice(0, 3).concat(['#3b82f6', '#22c55e']).map(c => (
                        <button
                            key={c}
                            onClick={() => setFillColor(c)}
                            className={`w-4 h-4 rounded-full border border-black/10 transition-all ${fillColor === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-sm' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                            title={c}
                        />
                    ))}
                </div>
            </div>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Undo / Redo */}
            <button onClick={onUndo} disabled={!canUndo} title="Undo" className="flex items-center justify-center w-full h-8 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30">
                <Undo2 className="w-4 h-4" />
            </button>
            <button onClick={onRedo} disabled={!canRedo} title="Redo" className="flex items-center justify-center w-full h-8 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30">
                <Redo2 className="w-4 h-4" />
            </button>

            <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Delete selected / Clear */}
            <button onClick={deleteSelected} title="Delete selected" className="flex items-center justify-center w-full h-8 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
            <button
                onClick={clearCanvas}
                title="Clear all"
                className="text-[8px] font-bold text-zinc-300 hover:text-red-400 transition-colors text-center"
            >
                Clear
            </button>
        </div>
    )
}
