import { notFound } from 'next/navigation'
import { getDrawingById } from '../actions'
import { DrawCanvasEditor } from '@/components/draw/draw-canvas-editor'

export const dynamic = 'force-dynamic'

export default async function DrawEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { success, data: drawing } = await getDrawingById(id)

    if (!success || !drawing) notFound()

    return <DrawCanvasEditor drawing={drawing} />
}
