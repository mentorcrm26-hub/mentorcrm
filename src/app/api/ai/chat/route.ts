import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const { messages, configId } = body;

        console.log('AI Chat Request:', { messagesCount: messages?.length, configId });

        if (!messages) {
            return new Response('Messages are required', { status: 400 });
        }

        const supabase = await createClient();

        // 1. Buscar configuração do AI Employee (com suporte a fallback para demo)
        let config = null;

        if (configId !== 'demo-config') {
            const { data, error } = await supabase
                .from('ai_configs')
                .select('*')
                .eq('id', configId)
                .single();

            if (!error && data) config = data;
        }

        // Se for demo ou se não encontrar no banco, usamos um fallback padrão
        const systemPrompt = config?.system_prompt || 'Você é um assistente prestativo do Mentor CRM, focado em ajudar com dúvidas sobre o sistema e agendamentos.';
        const modelEngine = config?.engine || 'gpt-4o';

        // 2. Iniciar o Stream da IA com ferramentas (Tools)
        const result = streamText({
            model: openai(modelEngine),
            system: systemPrompt,
            messages,
            tools: {
                // Ferramenta para buscar na base de conhecimento (RAG)
                getKnowledge: tool({
                    description: 'Busca informações específicas na base de conhecimento do cliente.',
                    inputSchema: z.object({
                        query: z.string().describe('A pergunta ou termo para buscar conhecimento.'),
                    }),
                    execute: async ({ query }) => {
                        // Aqui no futuro chamaremos a função RPC match_ai_knowledge do Supabase
                        return { source: 'Knowledge Base', content: 'Informação recuperada da base.' };
                    },
                }),
                // Ferramenta para agendar compromissos
                bookAppointment: tool({
                    description: 'Agenda um compromisso para um lead.',
                    inputSchema: z.object({
                        leadName: z.string(),
                        date: z.string().describe('Data no formato ISO'),
                    }),
                    execute: async ({ leadName, date }) => {
                        return { success: true, message: `Agendado para ${leadName} em ${date}` };
                    },
                }),
            },
        });

        // Retornar a stream usando o formato adequado para a versão atual da SDK
        return result.toUIMessageStreamResponse();
    } catch (error: any) {
        console.error('CRITICAL ERROR in AI Chat Route:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
