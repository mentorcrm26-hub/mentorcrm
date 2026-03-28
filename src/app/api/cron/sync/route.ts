/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { NextResponse } from 'next/server'
import { reconcileExternalChanges } from '@/lib/integrations/calendar/sync-engine'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const supabase = createAdminClient()
        // Run the reconciliation logic
        await reconcileExternalChanges(supabase)

        return NextResponse.json({
            success: true,
            message: 'Calendar reconciliation executed'
        })

    } catch (err: any) {
        console.error('Cron Sync Error:', err)
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
