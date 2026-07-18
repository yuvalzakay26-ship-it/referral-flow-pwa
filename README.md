# ReferralFlow · הפניות עבודה עם יובל

A production, mobile-first, **Hebrew RTL** Progressive Web App that is a **private, owner-only CRM** for managing an **employee referral** program. Candidates never access the system: the owner publishes opportunities externally (mainly via WhatsApp), candidates reach out privately, and the owner manually logs each candidate, uploads their CV, and manages referral status, follow-ups and bonus tracking.

> **Not an official system.** ReferralFlow is a private management tool and is **not** affiliated with, endorsed by, or representing NESS Technologies, Intel, or any other company. No official logos, trademarks, or internal materials are used.

---

## ✨ Product overview

- **Login is the only public interface.** The root route (`/`) redirects to `/admin` for the authenticated owner, otherwise to `/admin/login`. There is **no** public landing page and **no** public candidate submission — `/apply` returns 404.
- **Admin area (`/admin`)** — protected dashboard with stats; candidate management (desktop table + mobile cards, search/filter/sort); a fast manual **new-candidate** form; full candidate details with editing, status history, internal notes, follow-ups, quick actions and prepared WhatsApp messages; editable message templates; an internal jobs board that generates WhatsApp-ready posts (no public application link); and settings.
- **PWA** — installable, standalone display, offline fallback, safe-area support, app icons and manifest.

Honest language is enforced throughout: the app never promises a response, an interview, acceptance, employment, or a bonus.

---

## 🧱 Tech stack

| Area | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack, Proxy) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** + CSS design tokens |
| Forms | **React Hook Form** + **Zod** |
| Icons | **lucide-react** |
| Backend | **Supabase** — Postgres + RLS, Auth (SSR cookies), private Storage |
| Data access | Server Actions (`"use server"`) behind Row Level Security |
| Hosting | **Vercel** |

All data access goes through server-side service actions (`src/services`), which dispatch to the Supabase implementation in production or an in-memory mock for local development.

---

## 🚀 Installation

```bash
git clone <your-repo-url> referral-flow-pwa
cd referral-flow-pwa
npm install
cp .env.example .env.local   # fill in your Supabase URL + publishable key
npm run dev
```

Open <http://localhost:3000> — you will be redirected to `/admin/login`. Sign in with the single **owner** account created in Supabase Authentication (see below). There is no signup.

---

## 🧰 Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit + RLS tests (`node --test`) |
| `npx tsc --noEmit` | TypeScript type-check |

---

## 🔑 Environment variables

See [`.env.example`](./.env.example).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | App URL for metadata |
| `NEXT_PUBLIC_WHATSAPP_CHANNEL_URL` | WhatsApp updates channel link (private, in settings) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Default WhatsApp number (international, digits only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key (anon key supported as fallback) |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `false` in production; `true` forces the local mock |

**No service-role key is used at runtime.** Never place secrets in `NEXT_PUBLIC_*` or browser code. In production the app **fails closed**: if mock mode is off and Supabase is not configured, it shows a configuration error instead of falling back to mock data.

---

## 🗄️ Supabase backend

The database, RLS and private storage are provisioned by migrations under [`supabase/migrations/`](./supabase/migrations):

1. **`…_schema.sql`** — `candidates`, `candidate_status_history`, `candidate_notes`, `follow_ups`, `jobs`, `message_templates`, `app_settings`, `admin_users`; enums, indexes and `updated_at` triggers.
2. **`…_security_rls.sql`** — the `public.is_admin()` owner check (`security definer`, `search_path=''`) and **Row Level Security** on every table. Only a user listed in `admin_users` (the single owner) may access data; the anon role gets nothing.
3. **`…_storage_cvs.sql`** — a **private** `cvs` bucket (PDF/DOC/DOCX, 8 MB) plus owner-and-path-scoped storage policies.

Apply them with the Supabase CLI (`supabase db push`) or the Supabase MCP.

### One-time owner setup

1. In **Supabase → Authentication → Users**, create the single owner user (email + password, *Auto Confirm*).
2. In **Authentication → Sign In / Providers**, turn **"Allow new users to sign up" OFF**.
3. Run [`supabase/bootstrap_owner.sql`](./supabase/bootstrap_owner.sql) (replace the email placeholder) to authorize that user in `admin_users`.

### Auth & access model

- Supabase email/password auth over secure SSR cookies (`@supabase/ssr`).
- The Next.js **Proxy** (`src/proxy.ts`) refreshes the session, redirects unauthenticated visitors to `/admin/login`, redirects the owner away from the login page, and **signs out any authenticated non-owner**.
- Every data mutation is a Server Action that derives the user from the session cookie; **RLS** is the authoritative owner check.

---

## 🧪 Local mock mode

Set `NEXT_PUBLIC_USE_MOCK_DATA=true` (or omit the Supabase vars) to run against an in-memory store for local UI work. Mock data never persists to a database and CV files are not really stored. A mock-mode badge is shown while active. **Production must run with `NEXT_PUBLIC_USE_MOCK_DATA=false`.**

---

## ▲ Vercel deployment

1. The project is linked to GitHub; pushing to `main` triggers a production deployment.
2. In **Project → Settings → Environment Variables**, set (Production + Preview + Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_USE_MOCK_DATA=false`
   - `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WHATSAPP_CHANNEL_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
3. Redeploy so the new variables take effect.

---

## 🔐 Security

- **Owner-only auth** — Supabase Auth for a single administrator; no signup, no registration, no candidate accounts. A non-owner who authenticates is signed out immediately.
- **Row Level Security** on every table, gated by `is_admin()`; no public/anon policies (verified by `src/services/rls.test.ts`).
- **Private CV storage** — files live in a private bucket; downloads use short-lived (~90s) **signed URLs** generated server-side. No private CV URL is ever public.
- **Safe file handling** — server-side extension + size + MIME checks and sanitized, collision-safe paths.
- **No PII in logs**; generic Hebrew errors to the owner. The service worker never caches Supabase/API/auth/CV responses.

---

## 📁 Folder structure

```
src/
  proxy.ts                 # Next.js 16 Proxy — session refresh + route protection
  app/
    page.tsx               # / → owner → /admin, else /admin/login
    admin/login/           # only public interface
    admin/(panel)/         # protected admin shell (server-guarded layout)
  components/              # ui/, admin/, candidates/, pwa/, theme/
  config/                  # statuses, bonus, sources, jobTypes, eligibility, templates, app, settings
  data/                    # Hebrew mock data (local dev only)
  services/
    *Service.ts            # "use server" dispatchers (mock | supabase)
    supabase/              # Supabase implementations (RLS-backed)
    mock/                  # in-memory implementations (local dev)
  lib/
    supabase/              # client.ts, server.ts, proxy.ts, guard.ts, env.ts
    auth-actions.ts        # signInOwner / signOutOwner
    settingsStore.ts       # live settings snapshot + browser→server migration
  types/                   # domain types (source of truth for the schema)
public/  manifest.webmanifest / sw.js / icons/
supabase/
  migrations/              # schema, RLS, private storage
  bootstrap_owner.sql      # one-time owner authorization
```
