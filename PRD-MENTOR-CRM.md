# PRD - Mentor CRM: Ecossistema de Proteção Patrimonial

## 1. Visão Geral
O **Mentor CRM** é uma plataforma SaaS multi-tenant focada em Agentes Financeiros (Life Planners). O objetivo é centralizar a gestão de leads, automações de marketing (WhatsApp) e sincronização de agenda para maximizar a conversão de diagnósticos financeiros.

## 2. Objetivos Estratégicos
- **Escalabilidade**: Suporte a múltiplos consultores e agências.
- **Automação**: Redução de tarefas manuais de follow-up.
- **Inteligência**: Uso de IA para qualificação e análise de leads.
- **Conformidade**: Segurança total de dados financeiros (RLS).

## 3. Requisitos Funcionais

### 3.1 Gestão de Leads (Kanban)
- Colunas customizáveis por tenant.
- Drag-and-drop para mudança de status.
- Importação flexível via CSV/XLSX com mapeamento de colunas.

### 3.2 Comunicação WhatsApp
- Integração centralizada via Evolution API.
- Chat em tempo real inbound e outbound.
- Suporte a mídias (fotos e vídeos) no chat.

### 3.3 Agendamento & Sincronia
- Sincronização bidirecional com Google Calendar.
- Alertas visuais de falha de conexão.
- Ajuste automático de Timezone.

### 3.4 AI Employee (Próxima Fase)
- Treinamento em base de conhecimento (PDFs/URLs).
- Chatbot de qualificação de leads.
- Geração automática de resumos de reuniões.

## 4. Requisitos Não-Funcionais
- **Multi-tenancy**: Isolamento total de dados via `tenant_id`.
- **Performance**: Tempo de carregamento do dashboard < 2s.
- **Design**: Estética premium baseada em "Financial Architecture" (Dark Mode).

## 5. Roadmap de Desenvolvimento
1. **Fase 1 (Pronto)**: Setup DB, Auth e Landing Page SaaS.
2. **Fase 2 (Em Andamento)**: Core Kanban, WhatsApp Integration e Dashboards básicos.
3. **Fase 3 (Futuro)**: AI Employee, Automações complexas e Billing Stripe.

## 6. Métricas de Sucesso
- Volume de atendimentos via WhatsApp.
- Taxa de comparecimento em agendamentos Google.
- Crescimento mensal de usuários ativos por Tenant.
