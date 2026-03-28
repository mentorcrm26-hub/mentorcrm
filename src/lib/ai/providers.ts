/**
 * ************ By Inova Digital Marketing ***************
 * ******************* inovamkt.io ************************
 * ******************* Paulo Daian ************************
 * *************** contact@inovamkt.io ******************
 */

import { createOpenAI } from '@ai-sdk/openai';

// Configuração centralizada do provedor de IA
// Usando OpenAI gpt-4o por padrão para melhor raciocínio e suporte a funções
export const aiProvider = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const defaultModel = aiProvider('gpt-4o');

// Configuração de Embeddings para o RAG (Base de Conhecimento)
export const embeddingModel = aiProvider.embedding('text-embedding-3-small');
