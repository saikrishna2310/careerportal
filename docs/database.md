# CareerConnect database notes

The initial migration is `supabase/migrations/202611090001_initial_schema.sql`.

| Table | Purpose | Main relationship |
|---|---|---|
| `profiles` | Student, recruiter, and admin profiles | 1:1 with `auth.users` |
| `companies` | Employer organization profile | Owned by a recruiter profile |
| `company_members` | Recruiter access to a company | Company ↔ profile many-to-many |
| `jobs` | Published and draft vacancies | Belongs to a company and creator |
| `applications` | One candidate's application to one vacancy | Job ↔ applicant profile |
| `application_notes` | Private internal recruiter notes | Application ↔ author profile |
| `saved_jobs` | Candidate bookmarks | User ↔ job many-to-many |
| `notifications` | In-app notification inbox | Belongs to a recipient |

## Status lifecycle

`submitted → reviewing → shortlisted → interview → hired / rejected`

Candidates may withdraw while their application is still `submitted` or already `withdrawn`. Hiring teams control the review stages through RLS-authorized updates.

## Required setup

1. Apply the initial migration to a fresh Supabase project.
2. Create a recruiter account in the application.
3. Run `supabase/seed/seed_demo_jobs.sql` to insert example employers and vacancies.
4. Create a student account and test the published-job browser. Application submission UI is a next milestone; the schema and RLS policies are already defined.

## Production hardening

- Keep admin role grants out of public registration metadata.
- The migration grants recruiters access to a resume only when the owning candidate has applied to a vacancy managed by that recruiter’s company. Review this rule before changing company membership semantics.
- Validate resume MIME types and actual file contents server-side, not only from the client upload picker.
- Add pagination and query limits to list endpoints.
- Add retention and deletion policies for resumes and personal data.
