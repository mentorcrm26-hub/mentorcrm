'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
// pdf-parse doesn't play well with ESM imports in some environments, we'll require it inside the action

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function uploadKnowledgeAction(formData: FormData) {
    const supabase = await createClient()
    const file = formData.get('file') as File
    
    if (!file) return { error: 'No file provided' }
    if (!process.env.OPENAI_API_KEY) return { error: 'OpenAI API Key not configured' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        let text = ''
        const buffer = Buffer.from(await file.arrayBuffer())

        if (file.type === 'application/pdf') {
            const pdf = require('pdf-parse')
            const data = await pdf(buffer)
            text = data.text
        } else {
            text = buffer.toString('utf-8')
        }

        if (!text || text.trim().length === 0) {
            return { error: 'Document is empty or could not be parsed' }
        }

        // Obter tenant_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile?.tenant_id) return { error: 'Tenant context not found' }

        // Gerar embedding via OpenAI (text-embedding-3-small)
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.replace(/\n/g, ' '), // Melhorar qualidade do embedding
        })

        const embedding = embeddingResponse.data[0].embedding

        const { error } = await supabase
            .from('knowledge_base')
            .insert({
                tenant_id: profile.tenant_id,
                content: text,
                embedding: embedding,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    char_count: text.length
                }
            })

        if (error) throw error

        revalidatePath('/dashboard/settings/ai-knowledge')
        return { success: true }
    } catch (error: any) {
        console.error('Error uploading knowledge:', error)
        return { error: error.message || 'Failed to upload knowledge' }
    }
}

export async function getKnowledgeListAction() {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return []

    const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, content, metadata, created_at')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching knowledge list:', error)
        return []
    }

    return data.map((item: any) => ({
        id: item.id,
        name: (item.metadata as any)?.name || 'Untitled',
        size: formatBytes((item.metadata as any)?.size || 0),
        created_at: item.created_at
    }))
}

export async function deleteKnowledgeAction(id: string) {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    try {
        const { error } = await supabase
            .from('knowledge_base')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard/settings/ai-knowledge')
        return { success: true }
    } catch (error: any) {
        console.error('Error deleting knowledge:', error)
        return { error: error.message || 'Failed to delete knowledge' }
    }
}

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
