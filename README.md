# AI-Powered Sentiment Analysis Dashboard

A multi-tenant business intelligence dashboard for tracking customer sentiment, built with Next.js 15, Supabase, and Ollama. Companies upload customer feedback (typed in manually, or uploaded as PDF/Excel/text files), and the app extracts sentiment data and shows it on a live dashboard.

I built this to get hands-on with real-time data pipelines, multi-tenant database design, and using an LLM as part of a data processing pipeline rather than just a chatbot.

## Live demo

The app is deployed at [ai-powered-saas-dashboard.vercel.app](https://ai-powered-saas-dashboard.vercel.app/login). There are two demo accounts you can log in with to see the two different user roles:

**Manager view** (`/dashboard/aisupporthub`)
- Email: `manager-demo@company.com`
- Password: `ManagerDemo123!`
- Can upload bulk files (PDF, Excel, TXT), see AI-generated summary cards, ask natural-language questions about the data, and view charts of sentiment over time.

**Support agent view** (`/dashboard/reviewsubmit`)
- Email: `khantnyinyi46@gmail.com`
- Password: `saasdashboardkhant`
- Can submit individual customer reviews and see them reflected on the dashboard instantly.

## What it does

- **Multi-tenant data isolation.** Each company's data is walled off using Postgres Row Level Security, so a query can only ever touch rows belonging to the logged-in user's own workspace. This is enforced at the database level, not just in the app code.
- **Real-time updates.** New reviews show up on other users' screens without a page refresh, using Supabase's realtime subscriptions over WebSockets.
- **Optimistic UI.** When an agent submits a review, it appears on the chart immediately (before the server confirms it), then quietly rolls back if the save fails. Makes the app feel fast even though there's a network round trip happening.
- **PII redaction.** Before any uploaded text hits the database, it's run through regex patterns plus a Gemini prompt to strip out things like emails, phone numbers, and credit card numbers.
- **Indexed for scale.** Added a composite index on `(classified_mood, created_at)` since most of the dashboard's queries filter/sort on those two columns together — without it, aggregating sentiment history over time was doing full table scans.
- **Tested end-to-end.** Playwright tests cover both the manager and agent flows, including file uploads and the server actions behind them.
- **Error tracking.** Sentry is wired in on both client and server, so runtime errors (like a webhook dropping) get caught, logged, and shown as a fallback UI instead of a blank screen.

## Stack

- **Frontend/Backend:** Next.js 15 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS
- **Database & Auth:** Supabase (Postgres)
- **AI:** Google Gemini 2.5 Flash
- **Charts:** Recharts
- **File parsing:** PapaParse (CSV), SheetJS (Excel), pdf-parse (PDF)
- **Validation/Monitoring:** Zod, Sentry
- **Testing:** Playwright

## Running it locally

```bash
git clone https://github.com/khantnyinyi46/ai-powered-saas-dashboard
cd ai-powered-saas-dashboard
pnpm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_public_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Then:

```bash
pnpm run build
pnpm run start
```

To run the test suite (in a separate terminal, once the app is running):

```bash
pnpm playwright test
```
