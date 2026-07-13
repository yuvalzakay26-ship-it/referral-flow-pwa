# ReferralFlow · הפניות עבודה עם יובל

A production-ready, mobile-first, **Hebrew RTL** Progressive Web App for managing a private **employee referral** program. Candidates submit their details and CV for possible referral; an administrator manages candidates, statuses, messages, sources and follow-ups.

> **Not an official application.** ReferralFlow is a private tool and is **not** affiliated with, endorsed by, or representing NESS Technologies, Intel, or any other company. No official logos, trademarks, or internal materials are used.

---

## ✨ Product overview

- **Public site (`/`)** — premium landing page explaining the process with an honest, no-promises disclaimer.
- **Application form (`/apply`)** — a polished 5-step form (personal → professional → CV upload → referral eligibility → consent) with a premium animated success screen and a submission reference number.
- **Admin area (`/admin`)** — protected dashboard, candidate management (table + mobile cards, search/filter/sort), full candidate details with status history, internal notes, quick actions and prepared WhatsApp messages, editable message templates, a jobs board with one-click WhatsApp posts, and settings.
- **PWA** — installable, standalone display, offline fallback, safe-area support, app icons and manifest.

Honest language is enforced throughout: the app never promises an interview, a response, acceptance, employment, or a specific position.

---

## 🧱 Tech stack

| Area | Choice |
| --- | --- |
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** + CSS design tokens |
| Forms | **React Hook Form** + **Zod** |
| Icons | **lucide-react** |
| Animation | **Framer Motion** |
| Font | **Heebo** via `next/font` |
| Backend (ready) | **Supabase** (Postgres, Auth, private Storage) |
| Hosting | **Vercel** |

All data access is isolated behind service functions (`src/services`), so Supabase can be connected later **without rewriting the UI**.

---

## 🚀 Installation

```bash
git clone <your-repo-url> referral-flow-pwa
cd referral-flow-pwa
npm install
cp .env.example .env.local   # optional — app runs in mock mode without it
npm run dev
```

Open <http://localhost:3000>.

**Admin (mock mode):** go to `/admin`, log in with username **`admin`** / password **`admin`**.

---

## 🧰 Development commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript type-check |

---

## 🔑 Environment variables

See [`.env.example`](./.env.example). The app **compiles and runs with none of them** (mock mode).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | Public site URL for metadata |
| `NEXT_PUBLIC_WHATSAPP_CHANNEL_URL` | WhatsApp updates channel link |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Default WhatsApp number (international, digits only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key (never expose) |
| `ADMIN_EMAIL` | Initial admin allow-list |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` to force mock data |

---

## 🧪 Mock mode

Mock mode is **on automatically** when Supabase env vars are absent, or when `NEXT_PUBLIC_USE_MOCK_DATA=true`.

- 13 realistic Hebrew mock candidates across different fields, sources, statuses, eligibility answers, preferences and dates (`src/data`).
- An in-memory store (`src/services/store.ts`) persists changes during a browser session, so submissions and admin edits are reflected live.
- The `USE_MOCK_DATA` flag lives in `src/config/app.ts`.

To connect a real backend, implement the bodies of the service functions (`src/services/*`) against Supabase and set `NEXT_PUBLIC_USE_MOCK_DATA=false`.

---

## 🗄️ Supabase setup plan

1. Create a Supabase project and copy the URL + anon key into `.env.local`.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor. It creates all tables (`candidates`, `candidate_status_history`, `candidate_notes`, `jobs`, `message_templates`, `sources`, `follow_ups`, `app_settings`, `admin_users`), enums, an `updated_at` trigger, and **Row Level Security** policies.
3. Create a **private** Storage bucket named `cvs` (`public: false`).
4. `npm install @supabase/supabase-js @supabase/ssr` and implement `src/services/supabaseClient.ts`.
5. Swap each service function to use Supabase queries. Public submission stays behind the secure server action in `src/app/(public)/apply/actions.ts` (validate → insert with the service role → upload CV to the private bucket).
6. Add your admin user to `admin_users` and set `NEXT_PUBLIC_USE_MOCK_DATA=false`.

---

## ▲ Vercel deployment

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in Vercel (framework auto-detected as Next.js).
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Deploy. Preview URLs are generated per branch; promote to production from the dashboard.

No extra configuration is required — the defaults work out of the box.

---

## 📲 PWA installation

- **Android (Chrome):** menu ⋮ → **Add to Home screen**. An in-app install card also appears when the browser offers installation.
- **iPhone (Safari):** Share → **Add to Home Screen**.
- Manifest: [`public/manifest.webmanifest`](./public/manifest.webmanifest); icons in `public/icons`; offline fallback at `/offline`; service worker at `public/sw.js` (registered in production only).

---

## 🔐 Security notes

- **Server-side validation** for submissions (Zod) in a secure server action; no public table INSERT policy.
- **Row Level Security**: candidate data is readable/writable by authenticated admins only (`is_admin()`).
- **Private CV storage**: files live in a private bucket; downloads use short-lived signed URLs generated server-side. **No private CV URL is ever exposed publicly.**
- **Safe file handling**: extension + size + emptiness checks and **sanitized filenames**.
- **No sensitive data in browser logs**; clipboard/download failures fail silently.
- **Internal notes** are never surfaced to applicants.

> The mock admin login (`admin`/`admin`) is a **development-only** gate. Replace it with Supabase Auth + middleware before production.

---

## 📁 Folder structure

```
src/
  app/
    (public)/            # landing + apply (public chrome)
      page.tsx           # /
      apply/             # /apply  (+ secure server action)
    admin/
      login/             # /admin/login
      (panel)/           # protected admin shell
        page.tsx         # /admin dashboard
        candidates/      # list + [id] details
        messages/        # /admin/messages
        jobs/            # /admin/jobs
        settings/        # /admin/settings
    offline/ error.tsx / not-found.tsx / layout.tsx / globals.css
  components/
    ui/                  # Button, Card, Field, Badge, Modal, Motion, ...
    public/ admin/ candidates/ pwa/
  features/              # (reserved for feature-level composition)
  config/                # statuses, sources, jobTypes, eligibility, templates, app, settings
  data/                  # Hebrew mock data
  services/              # data access (mock now, Supabase-ready)
  lib/                   # utils, validation (Zod), templates, auth
  types/                 # domain types (mirror the SQL schema)
public/
  manifest.webmanifest / sw.js / icons/
supabase/
  schema.sql             # tables, enums, RLS, storage notes
```

---

## 🧭 Recommended next development phase

1. **Connect Supabase** — implement the client + swap service bodies; wire CV upload to the private bucket.
2. **Real auth** — Supabase Auth + Next.js middleware protecting `/admin`, replacing the mock gate.
3. **Signed CV downloads** — server route issuing short-lived signed URLs.
4. **Notifications** — email/WhatsApp automation on status changes; scheduled follow-up reminders.
5. **CSV export** — finish the settings export placeholder.
6. **Analytics & audit log** — source performance, funnel metrics, and an admin action log.
