'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEvolutionMessage, sendEvolutionMedia } from '@/lib/integrations/evolution-api'

export async function getMessages(conversationId: string) {
    const supabase = await createClient()

    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        return { success: false, error: 'Failed to load messages' }
    }

    return { success: true, data: messages }
}

export async function sendMediaMessage(
    conversationId: string, 
    phone: string, 
    mediaUrl: string, 
    mediaType: 'image' | 'video' | 'document' | 'audio', 
    instanceName: string,
    caption?: string
) {
    const supabase = await createClient()

    // 1. Send via Evolution API
    try {
        await sendEvolutionMedia(instanceName, phone, mediaUrl, mediaType, caption)
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to send media via WhatsApp' }
    }

    // 2. Read tenant id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const { data: userProfile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!userProfile) return { success: false, error: 'Tenant not found' }

    // 3. Save to DB
    const { data: message, error } = await supabase
        .from('messages')
        .insert({
            tenant_id: userProfile.tenant_id,
            conversation_id: conversationId,
            direction: 'outbound',
            content: caption || `Sent ${mediaType}`,
            media_url: mediaUrl,
            media_type: mediaType,
            status: 'sent'
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving message:', error)
        return { success: false, error: 'Failed to save message locally' }
    }

    // 4. Update conversation last message (Outbound should NOT increment unread)
    await supabase
        .from('conversations')
        .update({
            last_message_content: caption || `Shared ${mediaType}`,
            last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)

    return { success: true, data: message }
}

export async function sendMessage(conversationId: string, phone: string, content: string, instanceName: string) {
    const supabase = await createClient()

    // 1. Send via Evolution API
    try {
        await sendEvolutionMessage(instanceName, phone, content)
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to send message via WhatsApp' }
    }

    // 2. Read tenant id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const { data: userProfile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!userProfile) return { success: false, error: 'Tenant not found' }

    // 3. Save to DB
    const { data: message, error } = await supabase
        .from('messages')
        .insert({
            tenant_id: userProfile.tenant_id,
            conversation_id: conversationId,
            direction: 'outbound',
            content: content,
            status: 'sent'
        })
        .select()
        .single()

    if (error) {
        console.error('Error saving message:', error)
        return { success: false, error: 'Failed to save message locally' }
    }

    // 4. Update conversation last message (Outbound should NOT increment unread)
    await supabase
        .from('conversations')
        .update({
            last_message_content: content,
            last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId)

    return { success: true, data: message }
}

export async function markAsRead(conversationId: string) {
    const supabase = await createClient()
    
    await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)
    
    return { success: true }
}

export async function sendInternalNote(conversationId: string, content: string) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    
    const { data: userProfile } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
    if (!userProfile) return { success: false, error: 'Tenant not found' }
    
    const { data: message, error } = await supabase
    .from('messages')
    .insert({
        tenant_id: userProfile.tenant_id,
        conversation_id: conversationId,
        direction: 'outbound',
        content: content,
        status: 'read',
        is_internal: true
    })
    .select()
    .single()
    
    if (error) {
        console.error('Error saving internal note:', error)
        return { success: false, error: 'Failed to save note' }
    }
    
    return { success: true, data: message }
}

export async function getConversation(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('conversations')
        .select(`
            *,
            lead:leads(*)
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching conversation:', error)
        return { success: false, error: 'Failed to load conversation' }
    }

    return { success: true, data }
}
