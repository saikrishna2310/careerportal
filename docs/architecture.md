# CareerConnect architecture

## Product surfaces

- **Web** (`apps/web`): Next.js App Router. Recruiter workspace, job discovery, application views, analytics, and email-auth screens.
- **Mobile** (`apps/mobile`): Expo Router / React Native. Student-facing job discovery, saved-role preview, and account screens.
- **Shared contracts** (`packages/shared`): common domain types and clearly labelled demo fixtures.
- **Backend** (`supabase`): PostgreSQL, Supabase Auth, Storage, Row Level Security, and Realtime publication.

## Data ownership

Supabase is the source of truth. The browser and mobile clients use the publishable key only. Database access is constrained by RLS; no service-role key belongs in a client application.

## Core relationships

```text
auth.users
  └── profiles
       ├── companies (owner)
       │    ├── company_members ── profiles
       │    └── jobs
       │         └── applications ── profiles (applicant)
       ├── saved_jobs ── jobs
       └── notifications
```

## Roles

- `student`: maintain a profile, browse published roles, save jobs, apply, and follow application progress.
- `recruiter`: create companies, manage company team members, publish jobs, review applications, and move application stages.
- `admin`: platform-level operations. Admin assignment is deliberately not available through public signup; promote an account through a controlled server/admin process.

## Key design decisions

1. A single Supabase project serves both clients, avoiding duplicated business data.
2. Jobs and companies are normalized rather than repeating employer details in every vacancy.
3. `applications` has a unique `(job_id, applicant_id)` constraint to prevent duplicate applications.
4. Resume files live in a private Storage bucket, under a folder named for the owning user's UUID.
5. Database triggers create profile records and notification events so these invariants do not depend on a single client.
6. Dashboard charts and tables currently show explicitly labelled sample fixtures. Replace those metrics with aggregate queries once production event definitions are finalized.

## Implemented foundations

- Recruiter company creation and job creation/publishing forms backed by Supabase RLS.
- Supabase email/password authentication for student and recruiter accounts.
- Server-side role guards for the student workspace and recruiter job creation.
- Published vacancy browser in web and mobile clients.
- Database notifications for new applications and application-stage changes.
- Private resume Storage bucket and recruiter-scoped read policy.
- Server-only Resend delivery wrapper.

## Next production milestones

- Add student application submission, duplicate-application feedback, and resume upload UX.
- Add recruiter application review, stage-transition rules, and private notes UI.
- Replace illustrative dashboard KPIs and tables with server-authoritative aggregate queries and pagination.
- Complete admin controls, mobile email-confirmation deep links, and push notifications.
- Add CI checks, integration tests, rate limits, audit events, backups, privacy workflows, and observability before production launch.
