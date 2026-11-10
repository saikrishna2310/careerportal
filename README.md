# CareerConnect

A full-stack job and placement platform foundation for students, recruiters, and platform administrators. This repository contains the coordinated web, mobile, shared-contract, and Supabase setup—not just a UI mockup.

## What's included

### Web — `apps/web`
- Next.js App Router + TypeScript + Tailwind CSS v4.
- Responsive recruiter workspace with KPI cards, hiring activity chart, application funnel, and recent-application table.
- Job browser that reads published roles from Supabase and falls back to clearly labelled sample data before backend setup.
- Supabase email/password sign-in and sign-up for student and recruiter accounts.
- Supabase SSR client helpers and request proxy for cookie-based session refresh.
- Health endpoint at `/api/health`.
- shadcn/ui configuration file and Lucide icon library. The dashboard uses local composable Tailwind/CSS components so the scaffold does not depend on a generated component registry at runtime.

### Mobile — `apps/mobile`
- Expo + React Native + Expo Router.
- Student-facing job discovery, saved roles preview, account screen, and email/password authentication screen.
- Shared sample data and the same Supabase backend as the web application.

### Shared contracts — `packages/shared`
- Shared TypeScript domain types for users, companies, vacancies, and application statuses.
- Sample vacancies and candidate records are explicitly demo fixtures, not real candidate or employer records.

### Backend — `supabase`
- Normalized PostgreSQL tables for profiles, companies, company membership, jobs, applications, private recruiter notes, saved jobs, and notifications.
- Row Level Security (RLS) policies for student, recruiter, and admin access.
- Automatic profile creation on signup, updated-at triggers, application notification triggers, private resume Storage bucket, and Realtime publication for application/notification updates.
- Optional SQL seed for four illustrative employers and six vacancies.

## Architecture

```text
careerconnect/
├── apps/
│   ├── web/                 # Next.js web application
│   └── mobile/              # Expo + React Native app
├── packages/
│   └── shared/              # Shared TypeScript types and demo fixtures
├── supabase/
│   ├── migrations/          # Database schema, RLS, triggers, Storage, Realtime
│   └── seed/                # Optional demo company/job data
└── docs/                    # Architecture and database notes
```

## Requirements

- Node.js 20.9 or newer.
- npm 10+ recommended.
- A Supabase project.
- Expo Go on a physical Android/iOS device, or Android Studio/Xcode for an emulator/simulator.

Next.js currently documents Node.js 20.9 as its minimum requirement. Expo SDK 57 is selected intentionally for physical-device Expo Go compatibility during the SDK 58 transition. Expo currently documents SDK 57 as the recommended choice for Expo Go on a physical device during that transition; use SDK 58 with a development build if you prefer the newest SDK.

## 1. Install dependencies

From the repository root:

```bash
npm install
```

For native dependency alignment with the installed Expo SDK, run:

```bash
cd apps/mobile
npx expo install --fix
cd ../..
```

## 2. Configure Supabase

1. Create a project in the Supabase dashboard.
2. In **Project Settings → API**, copy the Project URL and publishable key (`sb_publishable_...`).
3. Open **SQL Editor** and run both migrations in order: `202611090001_initial_schema.sql`, then `202611090002_application_workflow.sql`.
4. Create a recruiter account using the web sign-up screen (`/signup`) and choose **Recruiter / employer**.
5. Run `supabase/seed/seed_demo_jobs.sql` in the SQL Editor to add illustrative company and vacancy records.

The SQL seed script intentionally requires at least one recruiter profile so example companies have a real owner in the database.

Alternatively, use the Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Then run the seed SQL from the dashboard SQL Editor.

## 3. Configure environment variables

Copy the examples:

**Web** — create `apps/web/.env.local` from `apps/web/.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Mobile** — create `apps/mobile/.env` from `apps/mobile/.env.example`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Use the same Supabase project URL and publishable key in both apps. Never put a Supabase secret or service-role key in either frontend environment file.

## 4. Configure Auth URLs

In Supabase **Authentication → URL Configuration**:

- Set the Site URL to `http://localhost:3000` for local web development.
- Add `http://localhost:3000/auth/callback` to the redirect URL allowlist.
- Add your deployed web callback URL when you deploy.
- The `careerconnect://auth/callback` scheme is reserved in the mobile app configuration. Complete and test the native deep-link confirmation callback before enabling confirmed-email mobile signup in production.

## 5. Run the applications

Open two terminals from the repository root.

**Web:**

```bash
npm run dev:web
```

Open [http://localhost:3000](http://localhost:3000).

**Mobile:**

```bash
npm run dev:mobile
```

Scan the Expo QR code with Expo Go. Your phone and development machine should normally be on the same network; use Expo's tunnel mode if your network blocks local device discovery.

## 6. Verify the project

Run these commands from the repository root after installing dependencies:

```bash
npm run check:structure
npm run typecheck:web
npm run typecheck:mobile
npm run typecheck:shared
npm run build:web
```

Or run the complete automated check sequence with one command:

```bash
npm run check
```

`npm run check` validates the workspace and environment-template structure, type-checks the web, mobile, and shared packages, then creates a production web build. A successful build does not replace testing against your own Supabase project.

Health endpoint: `http://localhost:3000/api/health`.

## Current implementation boundary

This is a substantial, runnable project foundation. The database schema and access policies include the core business entities and security model. The web dashboard is populated with clearly labelled illustrative analytics; the job browser and mobile Explore screen load published Supabase vacancies when configured and otherwise show sample content.

The current foundation includes recruiter company and job creation, student/recruiter email-password auth, published-job browsing, student application submission with private resume uploads on web and mobile, student application tracking with Realtime status updates, recruiter applicant review/status changes, signed resume links, and in-app notification updates. Remaining production work includes end-to-end testing against a configured Supabase project, stronger file-content scanning and virus scanning, email delivery through Resend, mobile push notifications, full admin controls, complete native email-confirmation deep linking, and live aggregate analytics. Payment providers are not wired because a job marketplace MVP does not need checkout until paid employer plans are introduced.

## Security notes

- Supabase RLS is enabled for all user-facing public tables.
- Public signup can create only `student` or `recruiter` profiles. It cannot grant `admin`.
- Resume objects are stored in a private bucket under a user-UUID folder, limited to 10 MB and PDF/DOC/DOCX MIME types. Hiring-team reads are limited to resumes attached to applications for jobs managed by that team and should be opened with short-lived signed URLs.
- Application insert values are validated in a database trigger; applicants may only withdraw, and recruiter status changes are restricted to the status column. Notifications cannot be forged by authenticated clients.
- Recruiter-only application notes are kept in their own table and are not exposed to applicants.
- Do not rely on hidden UI elements for authorization. Enforce every production operation through RLS and trusted server-side validation.

## Styling and UI components

The web app uses Tailwind CSS v4, Lucide icons, and a shadcn/ui-compatible project configuration. Add official shadcn components when needed from `apps/web` using the shadcn CLI, for example:

```bash
npx shadcn@latest add button card badge input table dialog dropdown-menu
```

## Deployment outline

- Web: deploy `apps/web` to Vercel and set its Supabase environment variables.
- DNS/security: point your domain through Cloudflare and configure the Vercel DNS records shown in the Vercel domain settings.
- Mobile: configure Expo EAS build profiles and application identifiers before internal Android/iOS distribution.
- Email: add a server-side Resend integration only after sender-domain verification and template setup.
