/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChatClient } from './chat-client'
import { Suspense } from 'react'

export default async function ChatPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user profile and tenant
    const { data: userProfile } = await supabase
        .from('users')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) {
        return <div className="p-8 text-center text-zinc-500">Tenant not found. Error loading chat.</div>
    }

    const userRole = userProfile?.role || 'agent'
    const tenantId = userProfile.tenant_id

    // 1. Fetch conversations with role-based filtering
    // Administrators see everything; Agents see only their assigned leads.
    let convQuery = supabase
        .from('conversations')
        .select(`
            id,
            last_message_at,
            last_message_content,
            unread_count,
            lead:leads!inner (
                id,
                name,
                phone,
                email,
                assigned_to
            )
        `)
        .eq('tenant_id', tenantId)

    if (userRole === 'agent') {
        convQuery = convQuery.eq('leads.assigned_to', user.id)
    }

    // 2. Fetch agents (all tenant users) if admin, + integrations
    const [
        { data: conversations },
        { data: agents },
        { data: integration }
    ] = await Promise.all([
        convQuery.order('last_message_at', { ascending: false }),
        userRole === 'admin' 
            ? supabase.from('users').select('id, full_name').eq('tenant_id', tenantId).order('full_name')
            : Promise.resolve({ data: [] }),
        supabase.from('integrations').select('credentials').eq('tenant_id', tenantId).eq('provider', 'whatsapp').single()
    ])

    const isConnected = integration?.credentials?.status === 'connected'

    return (
        <div className="flex flex-col h-full flex-1">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading chat...</div>}>
                <ChatClient 
                    initialConversations={(conversations as any) || []} 
                    tenantId={tenantId}
                    userRole={userRole}
                    agents={(agents as any) || []}
                    whatsappConnected={isConnected}
                    instanceName={(integration?.credentials as any)?.instanceName}
                />
            </Suspense>
        </div>
    )
}
