# Campus Found

A fast, real-time Lost & Found platform built for university campuses. **Campus Found** lets students quickly report lost belongings, list items they've found around campus, and get automatically notified when a matching item is turned in.

---

## 🚀 Key Features

- **Filtered Feed & Search**: Search reports by title, location, or keywords. Instantly filter by status (`LOST` vs `FOUND`) or category (*Electronics, Documents & Cards, Accessories, Other*).
- **Automated Match Engine**: When a user registers a `FOUND` item, the background matcher scans active `LOST` posts. If keywords match, it automatically sends an email alert (via Brevo) and Web Push notifications to the student who lost it.
- **Chain of Custody Timeline**: Track each item's event history from initial report to resolution.
- **Google OAuth Sign-In**: Login with verified university Google accounts. Unauthenticated users are redirected to sign in before accessing board details.
- **Moderator Dashboard**: Dedicated `/admin` board for community moderators to review, flag, or remove posts.
- **Light & Dark Theme Engine**: Built-in theme engine with custom typography (*Source Serif 4, Geist, JetBrains Mono, Inter*).
- **Spam Protection & Rate Limiting**: Upstash Redis rate limiting caps post creation at 5 posts per hour per user.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, Server Components & Actions)
- **Database & ORM**: PostgreSQL / SQLite managed with Prisma ORM
- **Authentication**: NextAuth.js (Auth.js) with Google OAuth 2.0
- **Styling**: Tailwind CSS with class-based Dark/Light mode theme switching
- **Notifications**: Brevo (Sendinblue) HTTP API & Web Push API (`web-push`)
- **Rate Limiting**: Upstash Redis (`@upstash/ratelimit`)
- **Logging**: Structured telemetry via Pino logger

---

## 📦 Getting Started

### 1. Prerequisites
Make sure you have installed:
- Node.js 20+
- `pnpm` or `npm`
- A PostgreSQL database (e.g. Supabase, Neon, or local instance)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/campus-found.git
cd campus-found
pnpm install
```

### 3. Environment Variables
Create a `.env` file in the root directory of the project:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/campus_found"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-key"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Brevo Email API (for Match Notifications)
BREVO_API_KEY="your-brevo-api-key"
BREVO_SENDER_EMAIL="notifications@yourdomain.com"

# Upstash Redis (for Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Web Push VAPID Keys (Generate via npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-vapid-key"
VAPID_PRIVATE_KEY="your-private-vapid-key"
```

### 4. Database Setup
Push the Prisma schema to sync your database tables:
```bash
npx prisma db push
```

*(Optional)* Seed or generate Prisma Client:
```bash
npx prisma generate
```

### 5. Run Development Server
Start the local dev server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Folder Structure

```
├── app/                  # Next.js App Router pages and API endpoints
│   ├── admin/            # Moderator dashboard (/admin)
│   ├── api/              # API routes (items, auth, admin, push)
│   ├── auth/             # Custom sign in page
│   └── items/            # Item detail view & post form (/items/[id], /items/new)
├── components/           # UI components (Navbar, ItemCard, FilterBar, ThemeToggle)
├── lib/                  # Backend utilities (db, auth, logger, notifications, matcher)
├── prisma/               # Prisma database schema definition
└── public/               # Static assets & standalone service worker (sw.js)
```

---

## 📜 License

Distributed under the MIT License. Feel free to use and adapt for your campus!
