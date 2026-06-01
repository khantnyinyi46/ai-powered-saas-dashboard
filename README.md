# AI-Powered Multi-Tenant Sentiment Analysis SaaS Dashboard

An enterprise-grade, high-performance Business Intelligence (BI) dashboard built with **Next.js 15 (App Router)**, **Gemini 2.5 Flash**, and **Supabase (PostgreSQL)**. This application ingests unstructured customer feedback streams (via manual entries, bulk text uploads, PDF streams, or Excel sheets), dynamically redacts sensitive personal data before storage, extracts granular emotional data vectors, and broadcasts metrics updates instantly across authenticated user client sessions.

## 🕹️ Live Demo & Test Credentials

The production environment is live and fully interactive. You can test the **Role-Based Access Control (RBAC)** matrices and database multi-tenancy constraints by logging in with these two pre-configured user workspace profiles:

### 📊 1. Executive Manager Workspace (`/dashboard/aisupporthub`)
*   **Email**: `manager-demo@company.com`
*   **Password**: `ManagerDemo123!`
*   *Key Features*: Bulk document file processing (PDF, Excel, TXT), contextual AI analytics briefing cards, interactive semantic queries ("Ask Data"), and real-time Donut Chart data mapping visualization.

### 🛠️ 2. Line Support Agent Station (`/dashboard/reviewsubmit`)
*   **Email**: `khantnyinyi46@gmail.com`
*   **Password**: `saasdashboardkhant`
*   *Key Features*: Manual customer review submission forms, instant Optimistic UI state interceptors, and automated real-time database broadcast streams.

---

## 🚀 Core Engineering Highlights (Employment-Ready)

*   **🔐 Row Level Security (RLS) & Multi-Tenancy**: Engineered multi-tenant column isolation at the database layer using PostgreSQL RLS filters (`auth.uid() = user_id`). Companies can only mutate, pull, or stream records matching their explicit token workspace profile, completely preventing cross-tenant data leak vulnerabilities.
*   **📡 Event-Driven Real-Time Streams**: Implemented instant multi-device state synchronization using **Supabase Realtime Webhooks**. New table insertions automatically trigger raw row broadcasts directly to active client states over persistent WebSocket connections, reducing metric update lag to under 200ms without HTTP polling overhead.
*   **⚡ Intercepted Optimistic UI Updates**: Built a highly responsive user experience by managing optimistic client states natively. Manual form submissions inject structural mock review placeholders directly into chart layouts instantly, gracefully resolving background API confirmation sequences and triggering silent state rollbacks if the network fails.
*   **🛡️ Multi-Tier Compliance Engine (GDPR/HIPAA)**: Created a strict data sanitization firewall. Ingested textual documents pass through a regular expression backend engine paired with explicit Gemini system instruction parameters to permanently mask and overwrite credit cards, email addresses, and phone numbers with `[REDACTED]` tokens prior to database commits.
*   **📊 Database Performance Optimization**: Injected composite B-Tree database indexes on `(classified_mood, created_at)` columns inside the Supabase PostgreSQL core engine, successfully avoiding expensive full table lock scans and ensuring immediate history aggregation scaling.
*   **🧪 Dual-Profile End-to-End Automated Testing**: Covered critical business user flows using a robust **Playwright E2E** testing framework. Separate spec runners automatically test both the Manager and Agent profile lifecycles, mocking server-action routing, file stream loads, and data assertion timelines.
*   **🩺 Component-Level Telemetry Monitoring**: Configured asynchronous diagnostic trace logging using **Sentry Error Boundaries**. Webhook disconnects or parsing runtime exceptions are intercepted gracefully to render component recovery panels while piping complete debugging call stacks straight to developer monitoring telemetry boards.

---

## 🛠️ Tech Stack Architecture

*   **Framework Architecture**: Next.js 15 (React 19, TypeScript, Tailwind CSS, Server Actions)
*   **Database & Core Auth**: Supabase (PostgreSQL 15, SSR Session Cookie Traps)
*   **Artificial Intelligence Core**: Google Gemini 2.5 Flash SDK Engine
*   **Data Visualization Charts**: Recharts Responsive Canvas Container Wrapper
*   **Data Parsing Libraries**: PapaParse, XLSX (SheetJS), PDF-Parse-Fork
*   **Validation & Monitoring**: Zod Schema Models, Sentry NextJS SDK, Playwright E2E

---

## 📋 Installation & Local Setup

### 1. Clone the Project
```bash
git clone https://github.com
cd ai-powered-saas-dashboard
pnpm install
```

### 2. Configure Environment Keys
Create a local tracking environment configuration file named `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_public_anon_publishable_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Run Production Testing Pipelines
```bash
pnpm run build
pnpm run start
# Open a secondary terminal tab
pnpm playwright test
```
