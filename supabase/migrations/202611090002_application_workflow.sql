-- Application workflow hardening and notification support.
-- Apply after 202611090001_initial_schema.sql.

-- A candidate may only create an application for their own account. The database
-- sets the initial state and timestamp, regardless of client-supplied values.
create or replace function public.guard_application_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.applicant_id <> (select auth.uid()) then
      raise exception 'You can only apply using your own account' using errcode = '42501';
    end if;
    if not public.has_role('student') then
      raise exception 'Only student accounts can submit applications' using errcode = '42501';
    end if;
    if new.resume_path is null then
      raise exception 'A resume is required to submit an application' using errcode = '23514';
    end if;
    if not exists (
      select 1 from public.jobs j
      where j.id = new.job_id and j.status = 'published'
        and (j.expires_at is null or j.expires_at > now())
    ) then
      raise exception 'This job is not accepting applications' using errcode = '23514';
    end if;
    new.status := 'submitted';
    new.submitted_at := now();
    return new;
  end if;

  -- Column-level grants below limit clients to status changes only.
  if new.status is not distinct from old.status then
    return new;
  end if;

  if old.applicant_id = (select auth.uid()) then
    if new.status <> 'withdrawn' or old.status not in ('submitted', 'reviewing') then
      raise exception 'Applicants may only withdraw an active application' using errcode = '42501';
    end if;
  elsif public.can_manage_job(old.job_id) or public.has_role('admin') then
    if not (
      (old.status = 'submitted' and new.status in ('reviewing', 'shortlisted', 'rejected')) or
      (old.status = 'reviewing' and new.status in ('shortlisted', 'interview', 'rejected')) or
      (old.status = 'shortlisted' and new.status in ('interview', 'rejected')) or
      (old.status = 'interview' and new.status in ('hired', 'rejected'))
    ) then
      raise exception 'This application stage transition is not allowed' using errcode = '23514';
    end if;
  else
    raise exception 'Not authorized to update this application' using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists applications_guard_write on public.applications;
create trigger applications_guard_write
before insert or update on public.applications
for each row execute function public.guard_application_write();

-- Remove broad row-level UPDATE privilege; expose only the status column.
revoke update on public.applications from anon, authenticated, public;
revoke insert, delete on public.applications from anon, public;
grant select, insert on public.applications to authenticated;
grant update (status) on public.applications to authenticated;

-- Ensure notifications cannot be forged by a client. Inserts are trigger-owned.
revoke insert, delete, update on public.notifications from anon, authenticated, public;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "Users can only mark their own notifications read"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Application records and notifications are published for Realtime.
alter table public.applications replica identity full;
alter table public.notifications replica identity full;

-- Helpful indexes for the student and recruiter inboxes.
create index if not exists applications_updated_at_idx
  on public.applications (updated_at desc);
create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- Recreate notification update policy to match column-level update access.
drop policy if exists "Users can mark their notifications read" on public.notifications;

-- Resume object paths must be namespaced to the applicant's own UUID folder.
create or replace function public.guard_application_resume_path()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.resume_path is not null and split_part(new.resume_path, '/', 1) <> new.applicant_id::text then
    raise exception 'Resume path must be inside the applicant private folder' using errcode = '42501';
  end if;
  return new;
end;
$$;
drop trigger if exists applications_guard_resume_path on public.applications;
create trigger applications_guard_resume_path
before insert or update of resume_path, applicant_id on public.applications
for each row execute function public.guard_application_resume_path();

-- Applicants can withdraw while the hiring team is reviewing; they cannot set any
-- other status because the trigger and column-level grant enforce that boundary.
drop policy if exists "Applicants can withdraw their applications" on public.applications;
create policy "Applicants can withdraw their applications"
on public.applications for update to authenticated
using (applicant_id = (select auth.uid()) and status in ('submitted', 'reviewing'))
with check (applicant_id = (select auth.uid()) and status = 'withdrawn');
