# PRODUCT REQUIREMENTS DOCUMENT — MENTOR CRM
**Versão:** V3.0  
**Data:** Março 2026  
**Status:** Em Produção (Beta)  
**Repositório:** `mentorcrm`  
**Hosting:** Vercel (Next.js) + Supabase (PostgreSQL)

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Descrição
O **Mentor CRM** é um SaaS multi-tenant especializado gerenciamento de leads. Ele oferece uma plataforma completa para gestão de leads via Kanban, workflows, automação de comunicações multicanal (WhatsApp, Email, SMS), gerenciamento de tarefas, calendário e um Funcionário de IA personalizado com base de conhecimento vetorial (RAG).

### 1.2 Posicionamento
- **Tagline:** *"Stealth CRM for Finance"* — "Domine seus leads financeiros com precisão absoluta."
- **Público-alvo:** Agentes financeiros de elite (seguros de vida, previdência privada, investimentos)
- **Modelo de negócio:** SaaS B2B, onboarding admin-led (sem auto-registro público), pagamentos via Stripe
- **Idiomas suportados:** Português (padrão), Inglês, Espanhol

### 1.3 Princípios de Arquitetura
- **Multi-tenancy estrito**: Toda a isolação de dados é garantida via Row Level Security (RLS) no PostgreSQL
- **Admin-Led Onboarding**: Não há auto-registro público. O Admin cria os tenants manualmente após a venda
- **BYOK (Bring Your Own Key)**: Cada tenant configura suas próprias chaves e Google Calendar
- **WhatsApp Centralizado**: Evolution API é gerenciada centralmente pelo Admin SaaS

---

## 2. TECH STACK

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Framework** | Next.js (App Router) | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Linguagem** | TypeScript | 5.x |
| **Estilização** | Tailwind CSS + Shadcn UI | v4 |
| **Animações** | Framer Motion | 12.x |
| **Banco de Dados** | Supabase (PostgreSQL) | 2.x |
| **Autenticação** | Supabase Auth | 2.x |
| **ORM/Cliente DB** | Supabase JS | 2.x |
| **Pagamentos** | Stripe | Checkout + Portal |
| **Email** | Resend | 6.x (BYOK) |
| **WhatsApp** | Evolution API | v2 (central) |
| **SMS** | Twilio | BYOK |
| **Calendário** | Google Calendar (googleapis) | 171.x |
| **IA Chat** | OpenAI (ai-sdk/openai) | gpt-4o |
| **IA Voz** | Vapi AI | 2.x |
| **Embeddings** | OpenAI + pgvector | 1536 dims |
| **Drag & Drop** | @hello-pangea/dnd | 18.x |
| **Gráficos** | Recharts | 3.x |
| **CSV Parse** | PapaParse | 5.x |
| **Datas** | date-fns + date-fns-tz | 4.x |
| **CalDAV** | tsdav | 2.x |
| **Validação** | Zod | 3.x |
| **Toast** | Sonner | 2.x |
| **Testes E2E** | Playwright | 1.x |
| **Hosting** | Vercel | — |

---

## 3. ESTRUTURA DE USUÁRIOS E PAPÉIS

### 3.1 Papéis
| Papel | Descrição | Acesso |
|-------|-----------|--------|
| **admin** | Admin central do SaaS | Painel admin em `/admin/settings` — gerencia todos os tenants, configura Evolution API |
| **client** | Agente financeiro (cliente/tenant) | Painel CRM completo — gerencia seus próprios leads, automações e integrações |
| **agent** | Agente funcionario do cliente  | Painel CRM completo — gerencia seus próprios leads, automações e integrações | sem acesso as configurações do tenant e 

### 3.2 Fluxo de Onboarding
1. Admin recebe novo cliente via processo de vendas
2. Admin cria manualmente o tenant em `/admin/settings`
3. Admin gera credenciais iniciais para o agente
4. Agente acessa via `/login` com credenciais fornecidas
5. Agente configura integrações em seu painel
6. Agente ativa assinatura via billing integrado (Stripe)

---

## 4. BANCO DE DADOS — SCHEMA COMPLETO

### 4.1 Tabelas Principais

#### `tenants`
```sql
id            uuid PRIMARY KEY
name          text NOT NULL
status        text DEFAULT 'trial'  -- 'trial', 'active', 'inactive'
stripe_customer_id      text
stripe_subscription_id  text
created_at    timestamptz
updated_at    timestamptz
```

#### `users`
```sql
id          uuid PRIMARY KEY  -- ref: auth.users
tenant_id   uuid NOT NULL     -- ref: tenants
role        text DEFAULT 'agent'  -- 'admin', 'agent'
full_name   text NOT NULL
phone       text  -- para mirroring de notificações WhatsApp
created_at  timestamptz
updated_at  timestamptz
```

#### `leads`
```sql
id                  uuid PRIMARY KEY
tenant_id           uuid NOT NULL
name                text NOT NULL
email               text
phone               text
birth_date          date
origin              text
product_interest    text
notes               text
status              text DEFAULT 'Novo Lead'  -- estágio do Kanban
meeting_at          timestamptz               -- agendamento
meeting_notified    jsonb DEFAULT '{}'        -- controle de lembretes: {"1h": true, "30m": true}
google_event_id     text                      -- ID do evento no Google Calendar
apple_event_id      text                      -- ID do evento na Apple Calendar
created_at          timestamptz
updated_at          timestamptz

-- Índices
INDEX leads_meeting_at_idx (meeting_at)
INDEX leads_meeting_notified_idx GIN (meeting_notified)
```

#### `lead_notes`
```sql
id          uuid PRIMARY KEY
lead_id     uuid NOT NULL  -- ref: leads
tenant_id   uuid NOT NULL  -- ref: tenants
content     text NOT NULL
created_at  timestamptz
updated_at  timestamptz
```

#### `integrations`
```sql
id          uuid PRIMARY KEY
tenant_id   uuid NOT NULL
provider    text NOT NULL   -- 'resend', 'twilio', 'google_calendar'
credentials jsonb NOT NULL  -- chaves API do tenant (BYOK)
is_active   boolean DEFAULT true
created_at  timestamptz
updated_at  timestamptz
UNIQUE (tenant_id, provider)
```

#### `admin_settings`
```sql
id          text PRIMARY KEY
key_name    text NOT NULL
key_value   text NOT NULL
created_at  timestamptz
updated_at  timestamptz
```
> Exclusiva para configurações globais do SaaS (ex.: chaves Evolution API central). Acesso restrito ao `service_role`.

#### `message_templates`
```sql
id          uuid PRIMARY KEY
tenant_id   uuid NOT NULL
name        text NOT NULL
subject     text   -- apenas para email
content     text NOT NULL
type        text NOT NULL  -- CHECK: 'email' | 'whatsapp'
created_at  timestamptz
updated_at  timestamptz
```

#### `automations`
```sql
id                  uuid PRIMARY KEY
tenant_id           uuid NOT NULL
name                text NOT NULL
trigger_event       text NOT NULL        -- 'new_lead', 'status_change'
trigger_condition   jsonb                -- ex.: {"status": "Agendado"}
template_id         uuid                 -- ref: message_templates
is_active           boolean DEFAULT true
created_at          timestamptz
updated_at          timestamptz
```

#### `conversations`
```sql
id            uuid PRIMARY KEY
tenant_id     uuid NOT NULL
lead_id       uuid NOT NULL
unread_count  integer DEFAULT 0
created_at    timestamptz
updated_at    timestamptz
UNIQUE (tenant_id, lead_id)

-- Realtime ativado: REPLICA IDENTITY FULL
-- Publicação: supabase_realtime
```

#### `messages`
```sql
id              uuid PRIMARY KEY
tenant_id       uuid NOT NULL
conversation_id uuid NOT NULL  -- ref: conversations
lead_id         uuid NOT NULL  -- ref: leads
direction       text           -- 'outbound' | 'inbound'
content         text
media_url       text           -- URL de mídia (Supabase Storage)
media_type      text           -- 'image' | 'video' | 'document' | 'audio'
evolution_id    text UNIQUE    -- ID único da mensagem no Evolution API (deduplicação)
created_at      timestamptz
updated_at      timestamptz

-- Realtime ativado: REPLICA IDENTITY FULL
-- Publicação: supabase_realtime
```

#### `ai_configs`
```sql
id              uuid PRIMARY KEY
tenant_id       uuid NOT NULL
name            text NOT NULL       -- ex.: "Receptionist", "Sales Agent"
engine          text DEFAULT 'gpt-4o'
system_prompt   text                -- personalidade e regras do agente
voice_provider  text                -- 'vapi', 'elevenlabs'
voice_id        text                -- ID do provedor de voz
is_active       boolean DEFAULT true
created_at      timestamptz
updated_at      timestamptz
UNIQUE (tenant_id, name)
```

#### `ai_knowledge`
```sql
id          uuid PRIMARY KEY
tenant_id   uuid NOT NULL
config_id   uuid              -- ref: ai_configs
content     text NOT NULL     -- chunk de texto original
metadata    jsonb             -- nome do arquivo, página, etc.
embedding   vector(1536)      -- embeddings OpenAI (pgvector)
created_at  timestamptz
```

#### `system_integrations`
```sql
id          uuid PRIMARY KEY
provider    text UNIQUE     -- 'google' | 'apple'
credentials jsonb NOT NULL  -- credenciais master de calendário
created_at  timestamptz
updated_at  timestamptz
```

#### `appointment_settings`
```sql
tenant_id               uuid PRIMARY KEY  -- ref: tenants
reminder_1h_template_id uuid              -- ref: message_templates (lembrete 1h antes)
reminder_30m_template_id uuid             -- ref: message_templates (lembrete 30min antes)
notify_professional_30m  boolean DEFAULT true  -- notificar o próprio agente 30min antes
professional_phone       text
professional_email       text
created_at               timestamptz
updated_at               timestamptz
```

#### `Supabase Storage — Bucket: chat-media`
```
bucket_id: chat-media
public:    true
Policies:
  - Autenticados podem fazer upload
  - Leitura pública habilitada
  - Autenticados podem deletar seus uploads
```

### 4.2 Funções PostgreSQL

| Função | Descrição |
|--------|-----------|
| `public.current_user_tenant_id()` | Retorna o `tenant_id` do usuário autenticado. Base para todas as políticas RLS. |
| `public.increment_unread_count(conv_id UUID)` | Incrementa o contador de mensagens não lidas de uma conversa. |
| `public.match_ai_knowledge(query_embedding, threshold, count, tenant_id)` | Busca vetorial por similaridade coseno na base de conhecimento do AI Employee. |

### 4.3 Row Level Security (RLS)

Todas as tabelas têm RLS ativado. A regra base usa `public.current_user_tenant_id()` para garantir isolação total de dados entre tenants.

| Tabela | Política |
|--------|---------|
| `tenants` | Tenant vê apenas seu próprio registro |
| `users` | Usuário vê apenas membros do mesmo tenant |
| `leads` | CRUD restrito ao tenant do usuário |
| `integrations` | CRUD restrito ao tenant do usuário |
| `admin_settings` | Apenas `service_role` tem acesso |
| `message_templates` | CRUD restrito ao tenant do usuário |
| `automations` | CRUD restrito ao tenant do usuário |
| `conversations` | CRUD restrito ao tenant do usuário |
| `messages` | CRUD restrito ao tenant do usuário |
| `ai_configs` | CRUD restrito ao tenant do usuário |
| `ai_knowledge` | CRUD restrito ao tenant do usuário |
| `appointment_settings` | CRUD restrito ao tenant do usuário |
| `system_integrations` | Qualquer autenticado pode ler/gerenciar |

---

## 5. ESTRUTURA DE ROTAS (Next.js App Router)

```
src/app/
├── page.tsx                          # Landing Page Pública (SaaS)
├── layout.tsx                        # Root Layout
├── globals.css                       # Design System Global
├── favicon.ico
├── (auth)/                           # Grupo de rotas auth (sem layout do dashboard)
│   └── login/                        # → /login
├── (admin)/                          # Painel do Admin SaaS
│   └── settings/                     # → /admin/settings
├── (dashboard)/                      # Painel CRM Principal (vazio, rotas abaixo)
│   [Kanban, Chat, AI, Calendar, etc.]
├── demo/                             # → /demo (dashboard demo/trial)
├── dashboard/                        # → /dashboard (redirect pós-login)
├── auth/                             # Callbacks de autenticação Supabase
├── privacy/                          # → /privacy
├── terms/                            # → /terms
├── UvQjFQ72jvJGUtM2v/               # Rota de lead capture (landing page dinâmica de tenant)
└── api/
    ├── ai/
    │   └── chat/                     # → /api/ai/chat (streaming AI chat)
    ├── auth/                         # Helpers de auth
    ├── automations/
    │   └── reminders/               # → /api/automations/reminders
    ├── cron/
    │   ├── archive/                 # → /api/cron/archive
    │   ├── cleanup/                 # → /api/cron/cleanup
    │   └── sync/                    # → /api/cron/sync
    └── webhooks/
        └── evolution/               # → /api/webhooks/evolution (inbound WhatsApp)
```

---

## 6. FUNCIONALIDADES DO PRODUTO

### 6.1 Landing Page Pública (`/`)
- **Objetivo:** Converter visitantes para demo ou contato com Admin
- **Design:** Dark mode ultra-premium, animações Framer Motion, grid pattern background, palette emerald/black
- **Seções:**
  - Hero assimétrico com mockup do dashboard (rotacionado)
  - Features (3 cards: Async Flow, Automation Engine, Temporal Intelligence)
  - Stats bar (Latency: 14ms, Uptime: 99.9%, Scale: 10M+, ROI: +42%)
  - Pricing card stealth (plano único, CTA para trial beta)
  - Footer com links legais (Terms + Privacy)
- **Internacionalização:** PT (padrão), EN, ES — seletor de idioma no nav, persistido via cookie `NEXT_LOCALE`
- **CTAs:** "Inicie sua ascensão" → `/demo` | "Adquirir Licença" → `/signup`

### 6.2 Autenticação (`/login`)
- **Provedor:** Supabase Auth (email + senha)
- **Restrição:** Sem auto-registro público. Apenas Admin pode criar contas
- **Fluxo:** Login → verificação de tenant → redirect para dashboard

### 6.3 Pipeline Kanban (Dashboard)
- **Drag & Drop:** Baseado em `@hello-pangea/dnd`
- **Estágios do pipeline:** `Novo Lead` → (stages personalizáveis conforme status do lead)
- **Funcionalidades:**
  - Arrastar card muda o `status` do lead no banco em tempo real
  - Visualização por coluna com contagem de leads por estágio
  - Cards exibem: nome, telefone, produto de interesse, data de criação
  - Clique em card abre sidebar/modal de detalhes do lead
- **Ações no lead:**
  - Editar dados básicos (nome, email, fone, data de nascimento, origem, produto, notas)
  - Agendar reunião (`meeting_at`) — integra com Google Calendar
  - Adicionar nota estruturada (`lead_notes`)
  - Abrir chat WhatsApp (conversa em Live Chat)
  - Enviar email/WhatsApp direto

### 6.4 Importação de Leads via CSV
- **Componente:** `src/components/leads/`
- **Funcionalidade:** Upload de arquivo CSV com mapper dinâmico de colunas
- **Fluxo:**
  1. Upload do CSV
  2. Preview das colunas do arquivo
  3. Mapeamento visual: coluna CSV → campo da tabela `leads`
  4. Validação e inserção em lote
- **Biblioteca:** PapaParse

### 6.5 Live Chat — WhatsApp Bidirecional
- **Integração:** Evolution API v2 (centralizada pelo Admin SaaS)
- **Funcionalidades:**
  - **Outbound:** Agente envia texto ou mídia para o lead pelo CRM
  - **Inbound:** Lead responde no WhatsApp → webhook `/api/webhooks/evolution` → salva em `messages`
  - **Realtime:** Supabase Realtime (canal `supabase_realtime`) com `REPLICA IDENTITY FULL` para `messages` e `conversations`
  - **Deduplicação:** Campo `evolution_id` único na tabela `messages` previne duplicatas
  - **Contador de não-lidas:** `unread_count` em `conversations`, zerado quando o agente abre o chat
  - **Mídias suportadas:** Imagem, Vídeo, Documento, Áudio — upload via Supabase Storage (bucket `chat-media`)
  - **Notas internas:** Campo separado para anotações internas que NÃO são enviadas ao lead
  - **Notificações:** Alerta visual/sonoro para novas mensagens inbound

### 6.6 Email (`/integrations`)
- **Provedor:** Resend (BYOK — cada tenant usa sua própria API key)
- **Funcionalidades:**
  - Configurar chave Resend no painel de integrações
  - Enviar email para lead diretamente pelo CRM
  - Templates de email salvos em `message_templates`

### 6.7 Templates de Mensagem
- **Tipos:** `whatsapp` | `email`
- **Campos:** nome, assunto (apenas email), conteúdo
- **Uso:** Templates são referenciados em automações e configurações de lembretes de agendamento

### 6.8 Motor de Automação
- **Tabela:** `automations`
- **Triggers disponíveis:**
  - `new_lead` — dispara quando um novo lead é capturado
  - `status_change` — dispara quando o status do lead muda (ex.: `{"status": "Agendado"}`)
- **Ações:** Envia mensagem usando um template pré-definido (WhatsApp ou Email)
- **Canal de execução:** API `POST /api/automations/reminders`

### 6.9 Lembretes de Agendamento (Appointment Reminders)
- **Configuração:** `appointment_settings` por tenant
- **Fluxo automático:**
  - Lead com `meeting_at` definido recebe lembrete **1 hora antes** (template via `reminder_1h_template_id`)
  - Lead recebe lembrete **30 minutos antes** (template via `reminder_30m_template_id`)
  - Agente também pode ser notificado 30 min antes (`notify_professional_30m`)
- **Controle:** Campo `meeting_notified` no lead (JSONB) rastreia quais lembretes já foram enviados: `{"1h": true, "30m": true}`
- **Execução:** CRON job em Vercel (`/api/cron/sync` ou similar)

### 6.10 Integração com Google Calendar
- **Fluxo:**
  - Agente conecta sua conta Google via OAuth em `/integrations`
  - Credenciais OAuth salvas em `integrations` (provider: `google_calendar`)
  - Ao agendar reunião no CRM → evento criado no Google Calendar via `googleapis`
  - ID do evento salvo em `leads.google_event_id` para sincronização
  - CRON `sync`: sincroniza status do evento (ex.: cancelamento, reagendamento)
- **CalDAV (Apple Calendar):** Suporte via `tsdav` (`leads.apple_event_id`)

### 6.11 AI Employee (Funcionário de IA)
- **Configuração:** `ai_configs` — cada tenant pode criar múltiplos agentes com name/engine/prompt/voz
- **Modelos suportados:** GPT-4o (padrão), configurável via `engine`
- **Personalidade:** `system_prompt` define comportamento, persona e regras do agente
- **Base de Conhecimento RAG:**
  - Upload de documentos (PDF/texto) → extração de chunks → embeddings OpenAI → salvos em `ai_knowledge` com `vector(1536)`
  - Busca por similaridade coseno via função PostgreSQL `match_ai_knowledge()`
  - Threshold configurável + limite de resultados
- **Chat:** Streaming via Vercel AI SDK (`/api/ai/chat`) — interface estilo chat com histórico
- **Voz:** Integração com Vapi AI (voz em tempo real), configurável via `voice_provider` + `voice_id`
- **Componentes:** `src/components/ai/`

### 6.12 Captação de Leads — Landing Pages de Tenant
- **Rota:** `/[slug]` (dinâmica por tenant)
- **Funcionalidade:** Cada agente tem uma landing page pública personalizada que captura leads diretamente na sua pipeline Kanban
- **Fluxo:** Visitante preenche formulário → lead criado em `leads` com `tenant_id` correto → aparece no Kanban do agente

### 6.13 Painel Admin SaaS (`/admin/settings`)
- **Acesso:** Apenas usuários com `role = 'admin'`
- **Funcionalidades:**
  - Criar e gerenciar tenants
  - Gerar credenciais iniciais para novos clientes
  - Configurar chaves da Evolution API central (`admin_settings`)
  - Visualizar status de todos os tenants (trial, active, inactive)
  - Monitorar integrações críticas

### 6.14 Billing e Pagamentos (Stripe)
- **Modelo:** Stripe Checkout + Customer Portal
- **Fluxo:**
  - Agente acessa página de billing dentro do CRM
  - Input de cartão via Stripe Elements
  - Assinatura recorrente gerenciada pelo Stripe
  - `tenants.stripe_customer_id` e `stripe_subscription_id` armazenados
  - Status do tenant atualizado via webhook Stripe

### 6.15 Dashboard Overview
- **Métricas exibidas:** Total de leads, leads por estágio, reuniões agendadas
- **Gráficos:** Recharts (gráficos de barras, linhas, pizza)
- **Alertas visuais:** Notificação proeminente se a Evolution API estiver com falha de conexão
- **Design:** Palette escura com acentos emerald, tipografia display, cards com glassmorphism

---

## 7. APIS E WEBHOOKS

### 7.1 `POST /api/webhooks/evolution`
- **Função:** Recebe eventos inbound do Evolution API v2 (WhatsApp)
- **Payload:** Estrutura v2 com `data.key.remoteJid`, `data.message`, `data.messageType`
- **Lógica:**
  1. Identifica o tenant pela instância do Evolution
  2. Busca ou cria `conversations` para o lead
  3. Salva mensagem em `messages` com `direction: 'inbound'`
  4. Verifica `evolution_id` para evitar duplicatas
  5. Incrementa `unread_count` via função `increment_unread_count()`
  6. Extrai e salva URL de mídia se houver

### 7.2 `POST /api/ai/chat`
- **Função:** Chat com AI Employee via streaming
- **Input:** Histórico de mensagens + query do usuário
- **Processamento:**
  1. Gera embedding da query
  2. Busca context via `match_ai_knowledge()`
  3. Monta prompt com context RAG + system_prompt do agente
  4. Streaming de resposta via Vercel AI SDK

### 7.3 `POST /api/automations/reminders`
- **Função:** Executa lembretes de agendamento pendentes
- **Lógica:**
  1. Busca leads com `meeting_at` dentro da janela de tempo (1h ou 30min)
  2. Verifica `meeting_notified` para evitar reenvios
  3. Envia mensagem via Evolution API (template WhatsApp) ou Resend (email)
  4. Atualiza `meeting_notified` no lead

### 7.4 CRON Jobs (Vercel Cron)
| Rota | Função |
|------|--------|
| `/api/cron/archive` | Arquiva leads/conversas antigas ou inativas |
| `/api/cron/cleanup` | Remove dados expirados (trials vencidos, etc.) |
| `/api/cron/sync` | Sincroniza eventos com Google Calendar |

---

## 8. INTEGRAÇÕES EXTERNAS

| Provider | Tipo | Gerenciamento | Funcionalidade |
|----------|------|--------------|----------------|
| **Evolution API v2** | WhatsApp | Central (Admin) | Envio/recebimento de mensagens, webhook inbound |
| **Resend** | Email | BYOK (por tenant) | Envio de emails transacionais e templates |
| **Twilio** | SMS | BYOK (por tenant) | Envio de SMS |
| **Google Calendar** | Calendário | BYOK (por tenant, OAuth) | Sincronização de reuniões agendadas |
| **Apple Calendar** | Calendário | Via CalDAV | Sincronização de reuniões |
| **Stripe** | Pagamentos | Central (Admin chave) | Checkout, assinaturas recorrentes, portal de billing |
| **OpenAI** | IA | Central | Chat (gpt-4o), embeddings (text-embedding-ada-002) |
| **Vapi AI** | IA Voz | Por agente | Voz em tempo real para AI Employee |

---

## 9. DESIGN SYSTEM

### 9.1 Palette
| Token | Valor | Uso |
|-------|-------|-----|
| Background | `#050505` | Fundo principal |
| Surface | `#0b0b0b` / zinc-900 | Cards, modais |
| Border | `rgba(255,255,255,0.05)` | Bordas sutis |
| Text Primary | `#F9F9F9` | Títulos |
| Text Secondary | `#A1A1A1` | Subtítulos |
| Accent | Emerald-500 (`#10b981`) | CTAs, destaques, ativo |
| Danger | Red (padrão) | Erros, alertas críticos |

> ⚠️ **Restrição de design:** Cores violeta/roxo são proibidas no projeto.

### 9.2 Tipografia
- **Fonte:** Sans-serif do sistema (Inter equivalente via Tailwind)
- **Estilo:** Tracking-tighter para headlines, tracking-widest para labels uppercase
- **Mood:** Dark, premium, tech-forward

### 9.3 Componentes UI (Shadcn)
Todos os componentes base são do Shadcn UI, customizados com CSS variables para dark mode. Localização: `src/components/ui/`

### 9.4 Animações (Framer Motion)
- Scroll-triggered: `whileInView` + `viewport: { once: true }`
- Page entry: `initial` + `animate` com delay sequencial
- Hover effects: transform, color transitions
- Parallax no hero: `useScroll` + `useTransform`

---

## 10. SEGURANÇA

### 10.1 Isolação de Dados
- RLS ativa em todas as tabelas
- Função helper `current_user_tenant_id()` como base centralizada das políticas
- `admin_settings` acessível apenas via `service_role` (server-side)

### 10.2 Autenticação
- Supabase Auth com sessão JWT
- Middleware Next.js verifica sessão em todas as rotas do dashboard
- Sem rotas públicas de signup

### 10.3 Credenciais
- Chaves BYOK dos tenants armazenadas em `integrations.credentials` (JSONB)
- Suporte ao Supabase Vault para secrets (migration `vault_setup.sql`)
- Variáveis de ambiente sensíveis em `.env.local` (não commitado)

### 10.4 Variáveis de Ambiente Necessárias
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
RESEND_API_KEY          (fallback central, cada tenant tem a sua)
EVOLUTION_API_URL
EVOLUTION_API_KEY
VAPI_API_KEY
```

---

## 11. MIGRATIONS SQL — HISTÓRICO

| Arquivo | Data | Descrição |
|---------|------|-----------|
| `20260305000000_init.sql` | 05/03 | Schema base: tenants, users, leads, integrations, admin_settings + RLS |
| `20260305000001_auth_trigger.sql` | 05/03 | Trigger de criação de usuário no Supabase Auth |
| `20260306000000_automations.sql` | 06/03 | Campos `meeting_at`, `meeting_notified` em leads + índices |
| `20260306000000_trial_garbage_collector.sql` | 06/03 | Limpeza automática de trials expirados |
| `20260307000000_calendar_integrations.sql` | 07/03 | Tabela `system_integrations`, campos `google_event_id`, `apple_event_id` em leads |
| `20260309000000_ai_employee_schema.sql` | 09/03 | pgvector, `ai_configs`, `ai_knowledge`, função `match_ai_knowledge()` |
| `20260311000000_templates_and_automations.sql` | 11/03 | Tabelas `message_templates` e `automations` + RLS |
| `20260316000000_lead_notes.sql` | 16/03 | Tabela `lead_notes` + migração de notas legadas |
| `20260316000001_vault_setup.sql` | 16/03 | Configuração do Supabase Vault para secrets |
| `20260317000000_appointment_settings.sql` | 17/03 | Tabela `appointment_settings` com templates de lembrete |
| `20260317000001_chat_stability.sql` | 17/03 | Unique constraint em conversations, função `increment_unread_count()`, Realtime |
| `20260317000002_add_internal_notes.sql` | 17/03 | Notas internas no chat (não enviadas ao lead) |
| `20260317000003_unread_count_fix.sql` | 17/03 | Correção do comportamento do unread_count |
| `20260317000004_media_messages.sql` | 17/03 | Colunas `media_url`, `media_type` em messages + bucket `chat-media` |
| `20260318000000_add_evolution_id_unique.sql` | 18/03 | Constraint UNIQUE em `messages.evolution_id` para deduplicação |

---

## 12. ESTRUTURA DE COMPONENTES

```
src/components/
├── ai/                    # Interface do AI Employee + uploader de knowledge base
├── calendar/              # Componentes de calendário + agendamento
├── dashboard/             # Cards de métricas, overview stats
├── leads/                 # Kanban board, lead card, lead modal, CSV importer
├── demo/                  # Componentes do dashboard demo (trial)
└── ui/                    # Shadcn UI base (button, dialog, input, select, toast, etc.)
```

---

## 13. CRITERIOS DE SUCESSO (MVP ATUAL)

| Critério | Status |
|----------|--------|
| Admin provisionamento manual de tenants | ✅ Implementado |
| Login exclusivo para tenants criados (sem auto-registro) | ✅ Implementado |
| Kanban drag-and-drop com persistência | ✅ Implementado |
| CSV import com mapper dinâmico | ✅ Implementado |
| WhatsApp bidirecional (Evolution API) | ✅ Implementado |
| Live Chat com realtime + unread count | ✅ Implementado |
| Mídias no chat (imagem, vídeo, doc, áudio) | ✅ Implementado |
| Templates de mensagem | ✅ Implementado |
| Motor de automações (new_lead, status_change) | ✅ Implementado |
| Lembretes de agendamento (1h + 30min) | ✅ Implementado |
| Integração Google Calendar | ✅ Implementado |
| AI Employee com RAG (pgvector) | ✅ Implementado |
| AI Voz (Vapi) | ✅ Implementado |
| Lead capture landing pages por tenant | ✅ Implementado |
| Billing via Stripe | 🔄 Parcialmente implementado |
| RLS estrita entre tenants | ✅ Implementado |
| Landing page multilíngue (PT/EN/ES) | ✅ Implementado |
| Notas estruturadas de leads | ✅ Implementado |
| Deploy em Vercel | ✅ Implementado |

---

## 14. ROADMAP (FEATURES PLANEJADAS)

| Feature | Prioridade | Descrição |
|---------|-----------|-----------|
| **Billing completo Stripe** | P0 | Finalizar integração do portal de assinatura do cliente |
| **Automações If-This-Then-That** | P1 | Lógica: "Se card arrastado para 'Contacting', enviar mensagem invisível de boas-vindas" |
| **Painel Analytics avançado** | P1 | Taxa de conversão por estágio, tempo médio no pipeline, origem dos leads |
| **Twilio SMS ativo** | P1 | Ativar envio de SMS via Twilio nas automações |
| **Módulo de relatórios** | P2 | Export PDF/CSV de pipeline, performance por período |
| **Multi-usuário por tenant** | P2 | Adicionar mais de um agente por empresa (tenant) |
| **App Mobile** | P3 | React Native companion app para notificações push |

---

*Documento gerado com base na análise do codebase do projeto `mentorcrm`, branch principal, estado em 18 de Março de 2026.*
