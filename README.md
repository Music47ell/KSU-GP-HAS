# KSU-GP-HAS — Healthcare Appointment System

A modern, multi-role healthcare appointment management platform. Patients book appointments with doctors, doctors manage their availability, and admins approve registrations.

## Roles

| Role | Capabilities |
|------|-------------|
| **Patient** | Register, sign in, create/view/edit/cancel appointments with approved doctors |
| **Doctor** | Register (pending admin approval), manage fees and online/offline status, view appointments |
| **Admin** | Approve or deny doctor registrations |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Astro](https://astro.build) 4 (SSR) |
| Styling | [Tailwind CSS](https://tailwindcss.com) 3 |
| Database & Auth | [Supabase](https://supabase.com) (PostgreSQL + Auth) |
| Runtime | [Bun](https://bun.sh) |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com) |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) 1.x
- A Supabase project
- A Cloudflare account (for Workers deployment)

### Setup

```bash
bun install
cp .env.example .env
```

Set your Supabase credentials in `.env`:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Database

Run `src/db/setup.sql` in your Supabase SQL editor to create all tables, RLS policies, and triggers.

### Seed Test Users

Create users via the Supabase Admin API (safe, won't corrupt auth schema):

```bash
# Get your service_role key from: Supabase Dashboard → Project Settings → API
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

bun run seed
```

After seeding, sign in with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@has.com | admin123 |
| Doctor | doctor@has.com | doctor123 |
| Patient | patient@has.com | patient123 |

### Development

```bash
bun dev             # Dev server at localhost:4321
bun run build       # Type-check + build for production
bun run preview     # Preview locally with Wrangler
bun run deploy      # Deploy to Cloudflare Workers
```

## Project Structure

```
src/
├── assets/          # CSS
├── components/      # Headers, footer
├── db/              # Database schema
├── layouts/         # Base HTML layout
├── lib/             # Supabase client
└── pages/
    ├── index.astro           # Sign-in
    ├── api/                  # Form POST handlers (auth, appointments, admin)
    ├── patient/              # Patient dashboard, signup, appointment CRUD
    ├── doctor/               # Doctor dashboard, signup, profile edit
    └── admin/                # Admin dashboard, doctor approval
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous API key |

---

Built by [Ahmet ALMAZ](https://ahmetalmaz.com)
