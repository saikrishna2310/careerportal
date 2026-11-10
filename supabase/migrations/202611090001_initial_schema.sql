-- CareerConnect platform schema
-- PostgreSQL / Supabase migration. Run once against a new Supabase project.

create extension if not exists pgcrypto;

create type public.app_role as enum ('student', 'recruiter', 'admin');
create type public.company_member_role as enum ('owner', 'admin', 'recruiter');
create type public.job_status as enum ('draft', 'published', 'paused', 'closed');
create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'internship');
create type public.work_mode as enum ('onsite', 'hybrid', 'remote');
create type public.experience_level as enum ('entry', 'junior', 'mid', 'senior');
create type public.application_status as enum ('submitted', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired', 'withdrawn');

-- Profiles are created automatically when a Supabase Auth user signs up.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  role public.app_role not null default 'student',
  avatar_url text,
  headline text,
  phone text,
  location text,
  bio text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  slug text not null unique,
  website text,
  logo_url text,
  description text not null default '',
  industry text,
  company_size text,
  headquarters text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_length check (char_length(name) between 2 and 140),
  constraint companies_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  member_role public.company_member_role not null default 'recruiter',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  slug text not null unique,
  department text,
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  location text not null,
  work_mode public.work_mode not null default 'onsite',
  employment_type public.employment_type not null default 'full_time',
  experience_level public.experience_level not null default 'entry',
  salary_min integer,
  salary_max integer,
  salary_currency char(3) not null default 'INR',
  status public.job_status not null default 'draft',
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_salary_range check (salary_min is null or salary_max is null or salary_min <= salary_max),
  constraint jobs_salary_nonnegative check ((salary_min is null or salary_min >= 0) and (salary_max is null or salary_max >= 0)),
  constraint jobs_title_length check (char_length(title) between 3 and 160),
  constraint jobs_published_time check (status <> 'published' or published_at is not null)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  resume_path text,
  cover_letter text,
  status public.application_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create table public.application_notes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now()
);

create table public.saved_jobs (
  user_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for common feed, dashboard, and relationship queries.
create index jobs_status_published_at_idx on public.jobs (status, published_at desc);
create index jobs_company_status_idx on public.jobs (company_id, status);
create index jobs_location_idx on public.jobs (location);
create index applications_applicant_submitted_idx on public.applications (applicant_id, submitted_at desc);
create index applications_job_status_idx on public.applications (job_id, status, submitted_at desc);
create index application_notes_application_idx on public.application_notes (application_id, created_at desc);
create index company_members_user_id_idx on public.company_members (user_id, company_id);
create index notifications_user_unread_idx on public.notifications (user_id, read_at, created_at desc);

-- Updated-at helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger companies_set_updated_at before update on public.companies
for each row execute function public.set_updated_at();
create trigger jobs_set_updated_at before update on public.jobs
for each row execute function public.set_updated_at();
create trigger applications_set_updated_at before update on public.applications
for each row execute function public.set_updated_at();

-- Prevent self-registration as an administrator. Role defaults to student unless recruiter is explicitly selected.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when requested_role = 'recruiter' then 'recruiter'::public.app_role else 'student'::public.app_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

-- Security-definer helpers avoid recursive RLS policies and always use the signed-in identity.
create or replace function public.has_role(required_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = required_role
  );
$$;

create or replace function public.is_company_member(target_company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company and cm.user_id = (select auth.uid())
  );
$$;

create or replace function public.can_manage_job(target_job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or exists (
    select 1
    from public.jobs j
    join public.company_members cm on cm.company_id = j.company_id
    where j.id = target_job
      and cm.user_id = (select auth.uid())
      and cm.member_role in ('owner', 'admin', 'recruiter')
  );
$$;

create or replace function public.can_manage_company(target_company uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or exists (
    select 1 from public.company_members cm
    where cm.company_id = target_company
      and cm.user_id = (select auth.uid())
      and cm.member_role in ('owner', 'admin')
  );
$$;

-- Automatically attach the creator as company owner.
create or replace function public.add_company_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.company_members (company_id, user_id, member_role)
  values (new.id, new.owner_id, 'owner')
  on conflict (company_id, user_id) do nothing;
  return new;
end;
$$;

create trigger companies_add_owner
after insert on public.companies
for each row execute function public.add_company_owner_membership();

-- RLS is enabled on every user-facing table.
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.application_notes enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.notifications enable row level security;

-- Profiles: users can read/update their own profile. Recruiters can read profiles that applied to their jobs.
create policy "Profiles are readable by their owner"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.has_role('admin'));

-- Read the current role without recursively invoking profiles RLS. This lets a user
-- edit their profile fields while preventing self-service role escalation.
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1;
$$;

create policy "Recruiters can view applicants to managed jobs"
on public.profiles for select to authenticated
using (
  exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.company_members cm on cm.company_id = j.company_id
    where a.applicant_id = profiles.id and cm.user_id = (select auth.uid())
  )
);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()) and role = public.current_user_role());

-- Companies: active company pages are public; only owners/admins manage company data.
create policy "Active companies are public"
on public.companies for select to anon, authenticated
using (is_active = true or public.is_company_member(id) or public.has_role('admin'));

create policy "Recruiters can create companies"
on public.companies for insert to authenticated
with check (owner_id = (select auth.uid()) and public.has_role('recruiter'));

create policy "Company owners and admins can update companies"
on public.companies for update to authenticated
using (public.can_manage_company(id))
with check (public.can_manage_company(id));

create policy "Company owners and admins can delete companies"
on public.companies for delete to authenticated
using (public.can_manage_company(id));

-- Company membership: users can view their memberships; company owners/admins can view and manage their team.
create policy "Members can view their own memberships"
on public.company_members for select to authenticated
using (user_id = (select auth.uid()) or public.can_manage_company(company_id));

create policy "Company admins can add team members"
on public.company_members for insert to authenticated
with check (public.can_manage_company(company_id));

create policy "Company admins can update team members"
on public.company_members for update to authenticated
using (public.can_manage_company(company_id))
with check (public.can_manage_company(company_id));

create policy "Company admins can remove team members"
on public.company_members for delete to authenticated
using (public.can_manage_company(company_id));

-- Jobs: anyone can browse published roles; verified company members manage their own jobs.
create policy "Published jobs are publicly readable"
on public.jobs for select to anon, authenticated
using (status = 'published' or public.is_company_member(company_id) or public.has_role('admin'));

create policy "Recruiters can create jobs for their company"
on public.jobs for insert to authenticated
with check (
  created_by = (select auth.uid())
  and public.has_role('recruiter')
  and public.is_company_member(company_id)
);

create policy "Recruiters can update jobs for their company"
on public.jobs for update to authenticated
using (public.is_company_member(company_id) or public.has_role('admin'))
with check (public.is_company_member(company_id) or public.has_role('admin'));

create policy "Recruiters can delete jobs for their company"
on public.jobs for delete to authenticated
using (public.is_company_member(company_id) or public.has_role('admin'));

-- Applications: students apply for themselves; only the applicant and relevant company team can view them.
create policy "Applicants and hiring teams can view applications"
on public.applications for select to authenticated
using (applicant_id = (select auth.uid()) or public.can_manage_job(job_id) or public.has_role('admin'));

create policy "Students can apply to published jobs"
on public.applications for insert to authenticated
with check (
  applicant_id = (select auth.uid())
  and public.has_role('student')
  and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'published')
);

create policy "Applicants can withdraw their applications"
on public.applications for update to authenticated
using (applicant_id = (select auth.uid()) and status in ('submitted', 'withdrawn'))
with check (applicant_id = (select auth.uid()) and status = 'withdrawn');

create policy "Hiring teams can update application stages"
on public.applications for update to authenticated
using (public.can_manage_job(job_id) or public.has_role('admin'))
with check (public.can_manage_job(job_id) or public.has_role('admin'));

-- Recruiter-only notes are stored separately so applicants never receive private review feedback.
create policy "Hiring teams can read application notes"
on public.application_notes for select to authenticated
using (exists (select 1 from public.applications a where a.id = application_id and public.can_manage_job(a.job_id)));

create policy "Hiring teams can add application notes"
on public.application_notes for insert to authenticated
with check (author_id = (select auth.uid()) and exists (select 1 from public.applications a where a.id = application_id and public.can_manage_job(a.job_id)));

-- Saved jobs are private to each student account.
create policy "Users can view their saved jobs"
on public.saved_jobs for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can save published jobs"
on public.saved_jobs for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.has_role('student')
  and exists (select 1 from public.jobs j where j.id = job_id and j.status = 'published')
);

create policy "Users can remove their saved jobs"
on public.saved_jobs for delete to authenticated
using (user_id = (select auth.uid()));

-- Notifications are only visible and writable by their recipient; inserts are created by trusted triggers.
create policy "Users can read their notifications"
on public.notifications for select to authenticated
using (user_id = (select auth.uid()));

create policy "Users can mark their notifications read"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Notify hiring teams when a new application arrives and candidates when their stage changes.
create or replace function public.notify_application_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  job_title text;
begin
  select title into job_title from public.jobs where id = new.job_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, notification_type, title, body, data)
    select cm.user_id,
           'new_application',
           'New application received',
           'A candidate applied for ' || coalesce(job_title, 'your job opening') || '.',
           jsonb_build_object('application_id', new.id, 'job_id', new.job_id)
    from public.company_members cm
    join public.jobs j on j.company_id = cm.company_id
    where j.id = new.job_id and cm.user_id <> new.applicant_id;
  elsif old.status is distinct from new.status then
    insert into public.notifications (user_id, notification_type, title, body, data)
    values (
      new.applicant_id,
      'application_status',
      'Application status updated',
      'Your application for ' || coalesce(job_title, 'a role') || ' is now ' || replace(new.status::text, '_', ' ') || '.',
      jsonb_build_object('application_id', new.id, 'job_id', new.job_id, 'status', new.status)
    );
  end if;
  return new;
end;
$$;

create trigger applications_notify_activity
after insert or update of status on public.applications
for each row execute function public.notify_application_activity();

-- Private resume storage. Keep objects inside a folder named with the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', false, 10485760, array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;

create policy "Applicants can upload to their own resume folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Applicants can view their own resumes"
on storage.objects for select to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Applicants can replace their own resumes"
on storage.objects for update to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Applicants can delete their own resumes"
on storage.objects for delete to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Allow a hiring-team member to view a resume only when it belongs to an applicant
-- for one of that member's company vacancies.
create or replace function public.can_review_resume(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('admin') or exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    join public.company_members cm on cm.company_id = j.company_id
    where a.resume_path = object_name
      and cm.user_id = (select auth.uid())
  );
$$;

create policy "Hiring teams can read resumes for their applicants"
on storage.objects for select to authenticated
using (bucket_id = 'resumes' and public.can_review_resume(name));

-- Enable realtime for application and notification updates. Supabase creates this publication by default.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'applications'
  ) then
    alter publication supabase_realtime add table public.applications;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- Explicit API grants. RLS remains the row-level authorization boundary.
grant usage on schema public to anon, authenticated;
grant select on public.companies, public.jobs to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.company_members to authenticated;
grant insert, update, delete on public.jobs to authenticated;
grant select, insert, update on public.applications to authenticated;
grant select, insert on public.application_notes to authenticated;
grant select, insert, delete on public.saved_jobs to authenticated;
grant select, update on public.notifications to authenticated;
grant usage on type public.app_role, public.company_member_role, public.job_status,
  public.employment_type, public.work_mode, public.experience_level, public.application_status
  to anon, authenticated;
