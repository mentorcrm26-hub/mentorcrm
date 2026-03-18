# Mentor CRM - Resumo de Progresso e Próximos Passos

## Ponto de Parada Atual (Recapitulação)
Concluímos com sucesso as **Fases 1 e 2** do projeto Mentor CRM. 

### O que já está pronto e rodando:
1. **Google Calendar Integration (Refinado)**:
   - Fluxo OAuth 2.0 completo (`/api/auth/google`) com refresh tokens.
   - Sincronização de 2 vias (CRM -> Google e Google -> CRM) estável.
   - **Fix:** Adicionado suporte a Timezone (`America/New_York`) para precisão de horário.
   - **Fix:** Implementado sistema de logs de debug e avisos visuais (toasts) em caso de falha no sync.
   - Cron Job configurado (`/api/cron/sync`) para reconciliação automática.
   - Atualização real-time baseada em mudanças no Kanban.
2. **Banco de Dados (Supabase)**:
   - Toda estrutura criada (`tenants`, `users`, `leads`, `integrations`, `admin_settings`).
   - RLS (Row Level Security) aplicado com função `current_user_tenant_id()` para isolar dados entre empresas.
   - Triggers de Automação de Cadastro concluídos. Quando alguém cria conta, um *Tenant* (Workspace com plano "Trial") e um *User* são gerados nos bastidores.
2. **Setup do Projeto**:
   - Next.js 15 (App Router), Tailwind CSS (V4) e Shadcn UI.
   - Utilitários client, server e middleware configurados para o Supabase Auth.
3. **Frontend: Landing Page & Auth**:
   - Landing Page moderna/escura com efeito hero glassmorphism e foco no "Teste Grátis".
   - Sistema de Seleção Multilinguagem (Nativo/Client-Side) no botão do Globo (pt, en, es), com salvamento inteligente em Cookie `NEXT_LOCALE`.
   - Páginas restritas (`/login` e `/signup`) construídas, lendo o idioma global via Server Components e acionando as Server Actions corretas (comunicação segura com Supabase).
   - Tela de `/dashboard` preliminar montada por trás da barreira Authentication.

### Ações Pendentes por Parte do Usuário (Você):
1. **Executar Scripts no Supabase**:
   - Rodar o conteúdo do arquivo `supabase/migrations/20260305000001_auth_trigger.sql` no painel SQL do Supabase.
   - Desativar a opção *Confirm Email* no painel Authentication > Providers > Email.
2. **Testes Finais da Autenticação**:
   - Entrar na Landing page local, clicar na troca de linguagens e se cadastrar para checar o funcionamento completo do banco de dados provisionando o seu primeiro Tenant Trial isolado.

---

## 🚀 Onde vamos começar amanhã (Próximos Passos)

### **Fase 3 - CRM Core (Quadro Kanban e Importação) - EM ANDAMENTO**
1. **Modelagem de Estado do Kanban**: Criar componente Drag-and-Drop usando `@hello-pangea/dnd`.
2. **Listagem dos Leads (Supabase)**: Fazer o fetch real-time e a gravação de posição (`status`).
3. **Cards Intuitivos**: Exibição básica dos dados do Lead financeiro.
4. **Importador de Leads (Flexível)**: Sistema em tela que pegue planilhas `CSV`/`XLSX` (ex.: exportações genéricas de seguradoras) mapeando na web quais colunas são Nomes, Emails e Telefones antes da injeção definitiva no Banco MENTOR.

---
### **Regras Específicas de Desenvolvimento:**
- **Ponto de Restauração:** Sempre que solicitado ou em alterações críticas, salvar o estado.
- **Preservação de Código:** NUNCA deletar funcionalidades prontas ou código funcional sem aviso prévio e autorização do operador. Priorizar a integridade do que já está funcionando.

---
*Nota: A integração com Google Calendar foi refinada com correções de timezone e feedback do usuário.*

Progresso salvo em: 10 de Março de 2026.
