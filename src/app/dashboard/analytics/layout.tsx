import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

    if (userProfile?.role === 'agent') {
        redirect('/dashboard/leads') // Agents cannot view the financial/analytics overview
    }

    return <>{children}</>
}
