# ReferralFlow · הפניות עבודה עם יובל

A production-oriented, mobile-first, **Hebrew RTL** Progressive Web App that is a **private, admin-only CRM** for managing an **employee referral** program. Candidates never access the system: the administrator publishes opportunities externally (mainly via WhatsApp), candidates reach out privately, and the administrator manually logs each candidate, uploads their CV, and manages referral status, follow-ups and bonus tracking.

> **Not an official system.** ReferralFlow is a private management tool and is **not** affiliated with, endorsed by, or representing NESS Technologies, Intel, or any other company. No official logos, trademarks, or internal materials are used.

---

## ✨ Product overview

- **Login is the only public interface.** The root route (`/`) redirects to `/admin` when authenticated, otherwise to `/admin/login`. There is **no** public landing page and **no** public candidate submission — `/apply` returns 404.
- **Admin area (`/admin`)** — protected dashboard with stats and shortcuts; candidate management (desktop table + mobile cards, search/filter/sort); a fast manual **new-candidate** form; full candidate details with editing, status history, internal notes, quick actions and prepared WhatsApp messages; editable message templates; an internal jobs board that generates WhatsApp-ready posts (no public application link); and settings.
- **PWA** — installable, standalone display, offline fallback, safe-area support, app icons and manifest. The installed app opens into the login/admin workflow.

Honest language is enforced throughout: the app never promises a response, an interview, acceptance, employment, or a bonus.

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

Open <http://localhost:3000> — you will be redirected to `/admin/login`.

**Admin (mock mode only):** log in with username **`admin`** / password **`admin`**. These development credentials are shown only on the login screen.

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
| `NEXT_PUBLIC_APP_URL` | App URL for metadata |
| `NEXT_PUBLIC_WHATSAPP_CHANNEL_URL` | WhatsApp updates channel link (private, in settings) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Default WhatsApp number (international, digits only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key (never expose) |
| `ADMIN_EMAIL` | The single authorized administrator |
| `NEXT_PUBLIC_USE_MOCK_DATA` | `true` to force mock data |

---

## 🧪 Mock mode

Mock mode is **on automatically** when Supabase env vars are absent, or when `NEXT_PUBLIC_USE_MOCK_DATA=true`. While active, a **prominent warning** is shown across the admin area:

> מצב הדגמה פעיל — הנתונים נשמרים באופן זמני בלבד ואין להזין פרטים או קורות חיים אמיתיים.

- 13 realistic Hebrew mock candidates across different fields, sources, statuses, eligibility answers, preferences and dates (`src/data`).
- An in-memory store (`src/services/store.ts`) persists changes during a browser session, so new candidates and admin edits are reflected live.
- CV files are **not** uploaded in mock mode.
- The `USE_MOCK_DATA` flag lives in `src/config/app.ts`. The warning disappears only when `NEXT_PUBLIC_USE_MOCK_DATA=false` **and** valid Supabase env vars are provided.

To connect a real backend, implement the bodies of the service functions (`src/services/*`) against Supabase and set `NEXT_PUBLIC_USE_MOCK_DATA=false`.

---

## 🗄️ Supabase setup plan

1. Create a Supabase project and copy the URL + anon key into `.env.local`.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL editor. It creates all tables, enums, an `updated_at` trigger, and **Row Level Security** policies. There is **no** public access to any table — the anon role gets nothing.
3. Create a **private** Storage bucket named `cvs` (`public: false`).
4. `npm install @supabase/supabase-js @supabase/ssr` and implement `src/services/supabaseClient.ts`.
5. Swap each service function to use Supabase queries. Candidate creation/updates run server-side while authenticated as the admin (validate → insert → upload CV to the private bucket).
6. Add your admin user to `admin_users` and set `NEXT_PUBLIC_USE_MOCK_DATA=false`.

---

## ▲ Vercel deployment

1. Push the repo to GitHub.
2. Import the project in Vercel (framework auto-detected as Next.js).
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**.
4. Deploy. If the project is linked to GitHub, pushing to `main` triggers a deployment automatically.

---

## 📲 PWA installation

- **Android (Chrome):** menu ⋮ → **Add to Home screen**. An in-app install card also appears when the browser offers installation.
- **iPhone (Safari):** Share → **Add to Home Screen**.
- Manifest: [`public/manifest.webmanifest`](./public/manifest.webmanifest); icons in `public/icons`; offline fallback at `/offline`; service worker at `public/sw.js` (registered in production only). `start_url` is `/admin` so the installed app opens into the admin workflow.

---

## 🔐 Security notes

This build ships the architecture for a secure deployment, but the current admin login is **development-only** and **not production-secure**. Before entering real candidate data:

- **Real auth** — replace the mock localStorage gate (`src/lib/auth.ts`) with **Supabase Auth**, a single authorized administrator, and **Next.js middleware** protecting every `/admin` route.
- **Row Level Security** — candidate data readable/writable by the authenticated admin only (`is_admin()`); no public table policies.
- **Private CV storage** — files live in a private bucket; downloads use short-lived **signed URLs** generated server-side. **No private CV URL is ever exposed publicly.**
- **Safe file handling** — extension + size + emptiness checks and **sanitized filenames**.
- **No sensitive data in browser logs**; clipboard/download failures fail silently.
- **Internal notes** are never surfaced outside the authenticated admin area.

---

## 📁 Folder structure

```
src/
  app/
    page.tsx             # / → redirects to /admin or /admin/login
    admin/
      login/             # /admin/login (only public interface)
      (panel)/           # protected admin shell
        page.tsx         # /admin dashboard
        candidates/      # list + new + [id] details/editing
        jobs/            # /admin/jobs
        messages/        # /admin/messages
        settings/        # /admin/settings
    offline/ error.tsx / not-found.tsx / layout.tsx / globals.css
  components/
    ui/                  # Button, Card, Field, Badge, Modal, Choice, ...
    admin/ candidates/ pwa/
  config/                # statuses, bonus, sources, jobTypes, eligibility, templates, app, settings
  data/                  # Hebrew mock data
  services/              # data access (mock now, Supabase-ready)
  lib/                   # utils, validation (Zod), templates, auth
  types/                 # domain types (mirror the SQL schema)
public/
  manifest.webmanifest / sw.js / icons/
supabase/
  schema.sql             # tables, enums, RLS, private storage notes
```

---

## 🧭 Before entering real candidate data

1. **Connect Supabase** — implement the client + swap service bodies; wire CV upload to the private bucket.
2. **Real auth + middleware** — Supabase Auth for the single administrator, protecting `/admin`.
3. **Signed CV downloads** — server route issuing short-lived signed URLs.
4. **Environment-variable validation** and a production `NEXT_PUBLIC_USE_MOCK_DATA=false`.
5. **CSV export** — finish the settings export placeholder.
