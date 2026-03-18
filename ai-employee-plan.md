# Plano de Implementação: AI Employee Add-Ons (Conversation & Voice AI)

## 1. Visão Geral
Este plano detalha a implementação do módulo "AI Employee" para o Mentor CRM, inspirado na robustez do GoHighLevel/SparkLead. O objetivo é criar funcionários virtuais autônomos que gerenciam conversas (Chat/SMS) e chamadas de voz para qualificar leads e agendar compromissos.

**Tipo de Projeto:** WEB (Next.js + Supabase) com Integrações de Terceiros (Vapi, Twilio, OpenAI).

## 2. Critérios de Sucesso
- [ ] Atendimento de Chat Web em < 2s de latência.
- [ ] Integração de Voz (Vapi/Twilio) com transferência para humano funcional.
- [ ] Agendamento automático no Calendário do CRM sincronizado......
- [ ] Treinamento de IA baseado em documentos (RAG) por Tenant.
- [ ] Dashboard de monitoramento de custos e performance da IA.

## 3. Tech Stack
- **Voice Engine**: [Vapi.ai](https://vapi.ai) (Latência ultra-baixa para voz).
- **LLM Orchestration**: [Vercel AI SDK](https://sdk.vercel.ai/) (Unified interface para OpenAI/Anthropic).
- **Vector Database**: Supabase Vector (pgvector) para RAG (Retrieval-Augmented Generation).
- **Communication Layers**: Twilio (SMS/Call Routing), Meta API (WhatsApp/FB/IG).
- **Calendar**: Integração com as tabelas de `appointments` já existentes.

## 4. Estrutura de Arquivos Proposta
```text
src/
├── app/
│   └── (admin)/
│       └── ai-employee/
│           ├── chat/          # Configuração da IA de Chat
│           ├── voice/         # Configuração da IA de Voz
│           └── training/      # Upload de documentos/base de conhecimento
├── components/
│   └── ai/
│       ├── chat-preview.tsx
│       ├── voice-config-card.tsx
│       └── document-uploader.tsx
├── lib/
│   ├── ai/
│   │   ├── vector-store.ts    # Logic para pgvector
│   │   └── providers.ts       # Configuração Vercel AI SDK
│   └── vapi/
│       └── client.ts          # Integração com fallback para voz
```

## 5. Cronograma de Tarefas

| ID | Nome da Tarefa | Agente | Prioridade | Dependências |
|:---|:---|:---|:---|:---|
| T1 | **Arquitetura de Banco (Vector)**: Criar tabelas para embeddings de documentos por tenant. | `database-architect` | P0 | Nenhuma |
| T2 | **Vercel AI SDK Setup**: Implementar route handlers para chat contextual. | `backend-specialist` | P0 | T1 |
| T3 | **Custom Web Widget**: Criar o widget de chat flutuante para sites externos. | `frontend-specialist` | P1 | T2 |
| T4 | **Voice IA (Vapi)**: Configurar o dashboard de voz e hooks de agendamento. | `backend-specialist` | P1 | T2 |
| T5 | **Automated Testing**: Criar suíte de testes E2E para fluxos de agendamento via IA. | `qa-automation-engineer` | P2 | T3, T4 |

## 6. Phase X: Verificação Final
- [ ] **Segurança**: RLS garante que a IA de um Tenant não acesse dados de outro.
- [ ] **Performance**: Verificação de latência média de resposta da IA.
- [ ] **Custo**: Implementação de limites (Quotas) por plano de usuário.
- [ ] **Fallback**: Garantir que a IA transfira para o humano se não souber a resposta.

---
## ✅ FASE 0: PREPARAÇÃO
- [x] Levantamento de requisitos e benchmarks.
- [x] Definição de parceiros de infraestrutura (Vapi, OpenAI, Twilio).
- [ ] **Próximo passo**: Executar migração de banco de dados para suporte a Vetores.
