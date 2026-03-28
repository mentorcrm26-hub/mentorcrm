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

    // Fetch user's tenant
    const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!userProfile?.tenant_id) {
        return <div className="p-8 text-center text-zinc-500">Tenant not found. Error loading chat.</div>
    }

    // Fetch conversations (left sidebar)
    const { data: conversations } = await supabase
        .from('conversations')
        .select(`
            id,
            last_message_at,
            last_message_content,
            unread_count,
            lead:leads (
                id,
                name,
                phone,
                email
            )
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('last_message_at', { ascending: false })

    // Check if WhatsApp is connected
    const { data: integration } = await supabase
        .from('integrations')
        .select('credentials')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('provider', 'whatsapp')
        .single()

    const isConnected = integration?.credentials?.status === 'connected'

    return (
        <div className="flex flex-col h-full flex-1">
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading chat...</div>}>
                <ChatClient 
                    initialConversations={(conversations as any) || []} 
                    tenantId={userProfile.tenant_id} 
                    whatsappConnected={isConnected}
                    instanceName={(integration?.credentials as any)?.instanceName}
                />
            </Suspense>
        </div>
    )
}
