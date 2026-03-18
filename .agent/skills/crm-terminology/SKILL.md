---
name: crm-terminology
description: Define a terminologia oficial do Mentor CRM para evitar ambiguidades entre os papéis de usuários e dashboards.
---

# Mentor CRM - Terminologia Oficial

Para garantir clareza e profissionalismo no desenvolvimento de todo o código, arquitetura e comunicação do **Mentor CRM**, a seguinte terminologia deve ser rigorosamente respeitada:

1. **Cliente (Customer/Tenant Owner):**
   - Refere-se exclusivamente ao **cliente pagante** que assina o CRM.
   - No sistema, ele é o "Dono da Conta" (Workspace Owner). Ele tem o poder de gerenciar as configurações, o pagamento e adicionar/remover funcionários do seu próprio espaço.

2. **Agente (Agent/Employee):**
   - Refere-se aos **funcionários ou equipe do Cliente**.
   - Eles possuem acesso ao painel do Cliente para gerenciar Leads (CRM), mas com permissões restritas (ex: não podem alterar detalhes de pagamento do Workspace).

3. **Admin (Super Admin/System Owner):**
   - Refere-se ao **Super Administrador geral do CRM** (O dono do SaaS).
   - Este papel tem um painel oculto ou acesso direto ao backend (Supabase/Stripe) para gerenciar todas as contas, clientes, métricas de negócio e assinaturas do servidor inteiro. NUNCA confunda o "Admin" do sistema com o "Dono da Conta" do Workspace.

4. **Dashboard de Teste (Trial/Demo Dashboard):**
   - Refere-se a um ambiente onde **qualquer pessoa poderá testar o CRM** antes de pagar.
   - Possuirá limites rígidos de uso (ex: número máximo de leads, dias de utilidade) para incentivar a conversão para o plano pagante.

---

### Idioma Padrão do Sistema (Regra Absoluta)

**Nos painéis do CRM (Admin, Cliente e Fake/Demo), o idioma DEVE SER ESTRITAMENTE EM INGLÊS.**
Nunca desenvolva ou altere telas de dashboard, menus, textos informativos, componentes de relatórios, ou qualquer parte interna da aplicação para outro idioma que não seja Inglês (en-US). Apenas a Landing Page tem suporte a múltiplos idiomas.
