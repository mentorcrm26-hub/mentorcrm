/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Essa rota é projetada para ser chamada por serviços como o Vercel Cron, GitHub Actions
// ou qualquer outro Job Scheduler passando `Authorization: Bearer <CRON_SECRET>`

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Se a variável de ambiente CRON_SECRET estiver definida no painel e o Request for incompatível, rejeita.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    // Como esta é uma tarefa de background sem login ativo do browser, precisamos passar a role MASTER 
    // ou apenas usar anon se o backend estiver aberto a rpc com Security Definer
    // O ideal é configurar o SUPABASE_SERVICE_ROLE_KEY no ambiente de produção
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        return new NextResponse('Supabase config missing', { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    try {
        // Invoca a procedure SQL no Supabase criada via migration
        const { data, error } = await supabase.rpc('cleanup_expired_trials')

        if (error) {
            console.error('GC Error:', error)
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Garbage Collection Executed',
            deleted_workspaces: data || 0
        })

    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
