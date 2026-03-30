# Plano de Desenvolvimento: Painel de Super Admin Completo

## Objetivos Principais
1. Centralizar a gestão de todo o ecossistema do Mentor CRM em uma única interface.
2. Permitir controle total sobre assinaturas, integrações de pagamento (Stripe), leads e clientes.
3. Interface 100% em Português do Brasil (pt-BR).
4. Substituição de alertas nativos pelos toasts integrados da aplicação (`sonner`).

## Estrutura do Painel (`/admin`)

### 1. Dashboard Global (Overview)
- Métricas consolidadas: Total de clientes ativos, em trial e inativos.
- Gráficos de receita MRR (Monthly Recurring Revenue) via Stripe.
- Volume total de automações disparadas e leads capturados.

### 2. Gestão de Clientes (Tenants / Workspaces)
- Lista completa de clientes (Nome, Email Principal, Plano, Status).
- **Detalhes do Cliente:**
  - Contador regressivo para fim do Trial.
  - Listagem da equipe (Agentes) do cliente.
  - Métricas de uso: Contagem de leads e taxas de conversão.
  - Acesso às configurações, permitindo forçar upgrade/downgrade ou suspensão.

### 3. Central Financeira (Integração Stripe)
- **Painel Financeiro:** Ver saldo, faturamento pendente, falhas de cobrança.
- **Ações Rápidas:**
  - Capturar pagamentos manuais.
  - Emitir reembolsos (parciais ou totais).
  - Gerar links de faturamento.
  - Analisar logs de erros de pagamento (Error Analysis).
- **Gestão de Produtos:** Interface para alterar os valores dos planos (Agent Solo / Team) e refletir no banco de dados e Stripe de forma sincronizada.

### 4. Controle de Landing Page
- Interface para pausar, alterar versões ou editar textos-chave da landing page sem tocar no código-fonte (via banco de dados ou variáveis de ambiente gerenciáveis).

### 5. Gestão de Instâncias (WhatsApp / Email)
- Visão global da saúde das credenciais da Evolution API e envio de resend para cada Workspace.

## Fluxo de Execução Recomendado
- **Fase 1:** Ampliação da estrutura de rotas `/(admin)/...` e Layout Geral em pt-BR.
- **Fase 2:** CRUD de Clientes e visão detalhada do Workspace.
- **Fase 3:** Integração profunda com Stripe API (Reembolsos, Produtos, Saldo).
- **Fase 4:** Ajustes finos (Gestão dinâmica de Landing Page e Toasts Globais).
