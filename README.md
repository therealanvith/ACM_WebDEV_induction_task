# Campus Found

A fast, real-time Lost & Found platform built for university campuses. **Campus Found** lets students quickly report lost belongings, list items they've found around campus, and get automatically notified when a matching item is turned in.

**Live demo**: [anvithslostandfound.vercel.app](https://anvithslostandfound.vercel.app)

---

## Key Features

- **Filtered Feed & Search**: Search reports by title, location, or keywords. Instantly filter by status (`LOST` vs `FOUND`) or category (*Electronics, Documents & Cards, Accessories, Other*).
- **Automated Match Engine**: When a user registers a `FOUND` item, the background matcher scans active `LOST` posts. If category and keywords match, it automatically sends an email alert (via Brevo) and a Web Push notification to the student who lost it.
- **Google OAuth Sign-In**: Login with any Google account. Unauthenticated users are redirected to sign in before accessing board details.
- **Moderator Dashboard**: Dedicated `/admin` board for moderators (role-gated) to review, flag, or remove posts.
- **Claim Flow**: Contact button opens a pre-filled email draft to the poster so ownership can be verified directly between students before an item is marked resolved.
- **Light & Dark Theme**: Built-in theme toggle with custom typography (Source Serif 4, JetBrains Mono, Geist).
- **Rate Limiting**: Upstash Redis caps post creation at 5 posts per hour per user, returning HTTP 429 when exceeded.
- **Structured Logging**: Pino logs for post creation, notification dispatch, and moderation actions.
- **SSR + Caching + Lazy Loading**: Feed is server-rendered with 60s revalidation; below-the-fold item cards load via `next/dynamic`.

---

## Tech Stack

- **Framework**: Next.js 15+ (App Router, Server Components)
- **Database & ORM**: PostgreSQL (Supabase) via Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth 2.0
- **Styling**: Tailwind CSS with class-based dark/light mode
- **Notifications**: Brevo HTTP API (email) & Web Push API (`web-push`)
- **Rate Limiting**: Upstash Redis (`@upstash/ratelimit`)
- **Logging**: Pino structured logger
- **Deployment**: Vercel with GitHub Actions CI

---

## Feature-to-Code Mapping

| Required Feature | Implementation |
| :--- | :--- |
| Google Sign-in | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Email notifications | `lib/notifications/email.ts` |
| Push notifications | `lib/notifications/push.ts`, `public/sw.js`, `components/push-notification-button.tsx` |
| Notification matching logic | `lib/notifications/matcher.ts` |
| Cross-platform / responsive frontend | Tailwind throughout `app/`, `components/` |
| Deployment & CI/CD | `.github/workflows/ci.yml`, `vercel.json`, live on Vercel |
| Role-based access control | `middleware.ts`, `app/admin/`, `app/api/admin/` |
| Logging | `lib/logger.ts` |
| Rate limiting | `lib/ratelimit.ts`, used in `app/api/items/route.ts` |
| Caching | `app/page.tsx` (`revalidate: 60`) |
| Lazy loading | `components/dynamic-item-card.tsx` |
| Server-side rendering | `app/page.tsx` |
| Post lost/found items | `app/items/new/page.tsx`, `app/api/items/route.ts` |
| Status tracking | `Item.status` in `prisma/schema.prisma`, `PATCH /api/items/[id]` |
| Claim/verification workflow | Contact-via-email button on `app/items/[id]/page.tsx` |
| Moderation | `app/admin/page.tsx`, `app/api/admin/items/[id]/route.ts` |
| Search and filters | `components/item-filter-bar.tsx`, `components/item-feed.tsx` |

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- `pnpm`
- A PostgreSQL database (e.g. Supabase, Neon, or local instance)

### 2. Installation
```bash
git clone https://github.com/your-username/campus-found.git
cd campus-found
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and fill in each value:

```env
# Database Configuration (Supabase / Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# NextAuth Configuration
# Generate secret via: npx auth secret (or openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Google OAuth Credentials
# Obtain from Google Cloud Console: Credentials -> OAuth 2.0 Client IDs
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Brevo (formerly Sendinblue) Email API Configuration
# Obtain API key from Brevo: Settings -> SMTP & API
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="notifications@yourdomain.com"

# Upstash Redis Configuration (Rate Limiting)
# Obtain from Upstash Console: Redis Database -> REST API section
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Web Push API (VAPID Keys)
# Generate via: npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:admin@campus-lostfound.acm.org"
```

Where to get each value:
- `DATABASE_URL` - Supabase → Settings → Database → Connection string (use the pooler connection, not direct)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google Cloud Console → Credentials → OAuth client ID
- `NEXTAUTH_SECRET` - run `npx auth secret`
- `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` - Brevo → Settings → SMTP & API
- `UPSTASH_REDIS_REST_URL` / `TOKEN` - Upstash → your Redis database → REST API section
- VAPID keys - run `npx web-push generate-vapid-keys`

### 4. Database Setup
```bash
pnpm exec prisma db push
pnpm exec prisma generate
```

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## CI/CD

GitHub Actions runs on every push and pull request to any branch, via `.github/workflows/ci.yml`.

**build-and-test job:**
- Installs dependencies with pnpm (frozen lockfile)
- Generates the Prisma client
- Runs ESLint
- Type-checks with `tsc --noEmit`
- Builds the Next.js app (using dummy env values, no real secrets or database touched)

**security-audit job:**
- Runs `pnpm audit` at high severity, non-blocking

Deployment itself is handled by Vercel, triggered automatically on pushes to `main`. The GitHub Actions pipeline is a pre-deploy gate for code quality, not the deployment mechanism.

## Folder Structure

```
├── app/                  # Next.js App Router pages and API endpoints
│   ├── admin/            # Moderator dashboard (/admin)
│   ├── api/              # API routes (items, auth, admin, push)
│   ├── auth/             # Custom sign-in page
│   └── items/            # Item detail view & post form (/items/[id], /items/new)
├── components/           # UI components (Navbar, ItemCard, FilterBar, ThemeToggle)
├── lib/                  # Backend utilities (db, auth, logger, notifications, matcher)
├── prisma/               # Prisma database schema
└── public/               # Static assets & service worker (sw.js)
```