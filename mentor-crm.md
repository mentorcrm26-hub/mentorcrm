# MENTOR CRM - Project Plan

## Overview
MENTOR CRM is a multi-tenant SaaS application dedicated to financial agents (insurance, financial planning, retirement). It allows them to manage leads via a Kanban board, automate communications (WhatsApp, Email, SMS), and manage tasks/calendar. The architecture ensures strict data isolation between tenants via robust Row Level Security (RLS). 

Based on the strategic alignment:
- **Admin-Led Onboarding**: There is no self-service public registration or trial. The system Admin manually creates tenant credentials after the initial sale/agreement.
- **Tenant Capture Pages**: Each client (tenant) will have an exclusive, personalized Landing Page directly linked to their CRM pipeline to capture leads automatically.
- **In-App Billing**: Once inside the CRM, clients will use a dedicated billing/payment menu to input their credit card details via Stripe for recurring subscription payments.
- Lead importation will feature a dynamic column mapper for maximum flexibility.
- The WhatsApp integration (Evolution API) is centralized for the entire SaaS, while others (like Resend/Twilio) may operate via BYOK. Visual alerts will be displayed for connection failures.

## Project Type
WEB

## Success Criteria
- [ ] Admin can manually provision new clients/tenants generating initial credentials.
- [ ] Clients can seamlessly manage their recurring Stripe subscriptions inside the CRM settings using Stripe Elements/Portal.
- [ ] Every tenant has a dynamic, personalized public Landing Page (e.g., `/agent/[slug]`) that routes captured leads directly to their Kanban board.
- [ ] Tenants have completely isolated data (RLS enforced).
- [ ] Dynamic CSV import allows users to easily map columns for lead ingestion.
- [ ] Centralized WhatsApp (Evolution API) works correctly, with prominent visual alerts on the dashboard if failures occur.
- [ ] Fully responsive UI supporting Light/Dark modes, targeting mobile accessibility requirements.

## Tech Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Payments**: Stripe Checkout and Customer Portal (Managed by Admin/Sales-led flow)
- **Infrastructure**: Vercel for hosting Next.js, Supabase for Database/Auth
- **APIs**: Evolution API (WhatsApp - Central), Resend (Email - BYOK), Twilio (SMS - BYOK), Google Calendar

## File Structure
```text
/
├── src/
│   ├── app/
│   │   ├── (public)/          # Main SaaS Landing Page (Demo CTA)
│   │   ├── [agent]/           # Dynamic Tenant Lead Capture Landing Pages
│   │   ├── (auth)/            # Login only (No signup)
│   │   ├── (dashboard)/       # Agent CRM Panel
│   │   ├── (admin)/           # Central Admin Panel
│   │   └── api/               # API Routes (Webhooks, Evolution API proxy)
│   ├── components/
│   │   ├── ui/                # Shadcn components
│   │   ├── kanban/            # Kanban board components
│   │   └── forms/             # Shared forms (import, settings)
│   ├── lib/                   # Supabase client, Stripe, utilities
│   └── hooks/                 # Custom React hooks
├── supabase/
│   └── migrations/            # SQL schemas and RLS policies
└── public/
```

## Task Breakdown

### Phase 1: Foundation (Database & Auth)
- **Task 1: Supabase Schema & RLS**
  - **Agent**: `database-architect`
  - **Skills**: `database-design`
  - **Priority**: P0
  - **Dependencies**: None
  - **INPUT→OUTPUT→VERIFY**: Input: Schema requirements. Output: `supabase/migrations/XXX_init.sql` with tables (`tenants`, `users`, `leads`, `integrations`, etc.) and strict Row Level Security. Verify: Can create tenant and user, user cannot read another tenant's data.

### Phase 2: Public Presence & Auth
- **Task 2: Main SaaS Landing Page & Demo**
  - **Agent**: `frontend-specialist`
  - **Skills**: `frontend-design`
  - **Priority**: P1
  - **Dependencies**: None
  - **INPUT→OUTPUT→VERIFY**: Input: Landing page copy & structure. Output: Responsive Next.js pages focusing on converting visitors into the `/demo` dashboard. Verify: Lighthouse score > 90, responsive on mobile.

- **Task 3: Client Capture Pages & Auth Flow**
  - **Agent**: `fullstack-developer`
  - **Skills**: `api-patterns`
  - **Priority**: P1
  - **Dependencies**: Task 1
  - **INPUT→OUTPUT→VERIFY**: Input: Dynamic routing logic. Output: Dynamic pages `/agent/[slug]` that acts as an opt-in funnel linked to the tenant's DB. A secure `/login` route for existing clients. Verify: Captured leads from the page appear in the correct tenant's CRM.

### Phase 3: CRM Core (Kanban & Imports)
- **Task 4: Dynamic Lead Importer**
  - **Agent**: `frontend-specialist`
  - **Skills**: `clean-code`
  - **Priority**: P2
  - **Dependencies**: Task 3
  - **INPUT→OUTPUT→VERIFY**: Input: CSV file. Output: UI to upload CSV and dynamically map columns to `leads` table fields. Verify: Leads are successfully inserted into DB with correct mapping.

- **Task 5: Kanban Board**
  - **Agent**: `frontend-specialist`
  - **Skills**: `frontend-design`
  - **Priority**: P2
  - **Dependencies**: Task 4
  - **INPUT→OUTPUT→VERIFY**: Input: Leads data. Output: Drag-and-drop Kanban board reflecting lead stages. Verify: Moving a card updates the lead status in DB.

### Phase 4: Integrations & Automations
- **Task 6: Communication APIs (WhatsApp, Email, SMS)**
  - **Agent**: `backend-specialist`
  - **Skills**: `api-patterns`
  - **Priority**: P1
  - **Dependencies**: Task 1
  - **INPUT→OUTPUT→VERIFY**: Input: Keys for Evolution API (central). Output: API routes or edge functions to send messages. Verify: Messages are sent successfully and failure alerts are generated in DB/UI if keys are invalid.

- **Task 7: Automation Engine (Follow-ups & Birthdays)**
  - **Agent**: `backend-specialist`
  - **Skills**: `nodejs-best-practices`
  - **Priority**: P2
  - **Dependencies**: Task 6
  - **INPUT→OUTPUT→VERIFY**: Input: Triggers (time, birthday, status changes). Output: CRON jobs or background workers evaluating lead states to send automated templates. *Future Enhancement Note: Implement "If-This-Then-That" logic (e.g., "If event = drag card to 'Contacting', then system = invisible message: 'Hello, saw your registration...'").* Verify: Logs show correct evaluation and dispatch of messages.

### Phase 5: Admin Panel & Billing
- **Task 8: Admin Provisioning & Client Billing**
  - **Agent**: `fullstack-developer`
  - **Skills**: `api-patterns`
  - **Priority**: P2
  - **Dependencies**: Task 3
  - **INPUT→OUTPUT→VERIFY**: Input: Admin onboarding forms & Stripe keys. Output: 1. Admin UI to create new tenants and generate temporary passwords. 2. A specific "Billing" settings page inside the Client CRM integrating Stripe Elements/Portal for them to input their actual CC for the subscription. Verify: Admin creates an account, client logs in via the credentials, registers card natively, and becomes "active".

## Phase X: Verification
- [ ] P0: Security Scan (RLS audited)
- [ ] P0: Lint & Type Check
- [ ] P1: UX Audit & Responsiveness Check
- [ ] P3: Lighthouse Audit
- [ ] P4: Playwright E2E Tests (Signup -> Import -> Kanban)
