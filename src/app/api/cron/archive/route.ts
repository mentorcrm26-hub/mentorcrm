import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const supabase = await createClient()

    // Calculate the date 15 days ago
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    const dateStr = fifteenDaysAgo.toISOString()

    console.log(`[Cron] Checking for leads to archive before ${dateStr}`)

    // Find leads in 'closed' or 'lost' status that haven't been updated in 15 days
    const { data: leadsToArchive, error: fetchError } = await supabase
        .from('leads')
        .select('id, name, status')
        .eq('is_archived', false)
        .in('status', ['closed', 'lost'])
        .lt('updated_at', dateStr)

    if (fetchError) {
        return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!leadsToArchive || leadsToArchive.length === 0) {
        return NextResponse.json({ message: 'No leads found to archive' })
    }

    console.log(`[Cron] Found ${leadsToArchive.length} leads to archive`)

    // Update them to archived
    const { error: updateError } = await supabase
        .from('leads')
        .update({ 
            is_archived: true, 
            archived_at: new Date().toISOString() 
        })
        .in('id', leadsToArchive.map(l => l.id))

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ 
        message: 'Successfully archived leads', 
        count: leadsToArchive.length,
        leads: leadsToArchive.map(l => l.name)
    })
}
