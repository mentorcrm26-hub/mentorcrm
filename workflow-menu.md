# Implementation Plan: WorkFlow Feature

## Overview
Implementation of a new `WorkFlow` menu in the Client Dashboard. This feature aims to provide a structured way for agents to manage lead interactions, including responding, forwarding, and document management.

## Project Type: WEB

## Success Criteria
- [ ] New `WorkFlow` item added to the sidebar.
- [ ] Functional interface for creating and managing workflow events.
- [ ] Integration with Lead/Contact data.
- [ ] Support for manual or automated action triggers.
- [ ] 100% compliant with English-only Dashboard policy.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide icons.
- **Backend / DB**: Supabase (PostgreSQL), Edge Functions for automations.
- **State Management**: React Hooks + Server Actions.

## File Structure (Planned)
- `src/app/dashboard/workflow/page.tsx` - Main menu entry.
- `src/components/dashboard/workflow/` - Shared components (builder, action list).
- `src/lib/actions/workflow.ts` - Server actions for workflow logic.

## Analysis: Final Decisions
Based on user feedback and CRM best practices:
1. **Nature**: **Smart Playbook (Interactive)**. Agents will follow a checklist of actions for each lead. Actions can include automatic triggers (like sending a template) or manual tasks.
2. **Forwarding**: This will trigger a **Lead Re-assignment** to another agent within the same workspace/tenant.
3. **Documents**: Integrated directly with **Mentor Vault**. Steps can specify a file from the vault to be sent.
4. **Primary Interaction**: The **Lead Detail View** (where actions are executed) and a dedicated **Workflow Builder** menu (where templates are created).

---

## Task Breakdown

### Phase 2: Foundation (P0) - [UNDERWAY]
- [ ] **Database Migration**: Create `workflows` and `workflow_steps` tables.
    - `workflows`: `id`, `tenant_id`, `name`, `description`, `is_active`, `is_system`
    - `workflow_steps`: `id`, `workflow_id`, `order_index`, `type` (message, document, forward, task), `config` (jsonb), `label`
- [ ] **Type Definitions**: Add TypeScript interfaces for Workflows.
- [ ] **Server Actions**: Implementation of `getWorkflows`, `getWorkflowSteps`, and `executeWorkflowStep`.

### Phase 3: UI Architecture (P1)
- [ ] **Sidebar Entry**: Register `/dashboard/workflow` in `NavLinks.tsx`.
- [ ] **Workflow Management**: Create the listing page for Workflows.
- [ ] **Playbook Widget**: Create a component to display active workflows in the Lead Detail/Chat screen.

### Phase 4: Core Actions Implementation (P1)
- [ ] **WhatsApp Step**: Connect with Evolution API for automatic template sending.
- [ ] **Vault Step**: Implement document attachment from Mentor Vault.
- [ ] **Re-assignment Step**: Implement logic to change `assigned_to` field in leads.

## Phase X: Verification
- [ ] Purple Ban: No restricted colors used.
- [ ] Language: UI strictly in English.
- [ ] Test: `python .agent/scripts/verify_all.py .`

## Phase X: Verification
- [ ] Purple Ban: No restricted colors used.
- [ ] Language: UI strictly in English.
- [ ] Test: `python .agent/scripts/verify_all.py .`
