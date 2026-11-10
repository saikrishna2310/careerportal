import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { RecruiterApplications } from "@/components/recruiter-applications";
import { createClient } from "@/lib/supabase/server";

export default async function RecruiterApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/recruiter/applications");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["recruiter", "admin"].includes(profile.role)) redirect("/login");
  const { data } = await supabase.from("applications").select("id,status,submitted_at,resume_path,cover_letter,profiles(full_name,email),jobs(title,companies(name))").order("submitted_at", { ascending: false });
  return <DashboardShell><div className="page-heading"><div><div className="eyebrow">Recruitment workspace</div><h1>Applicant management</h1><p>Review candidates, securely open resumes and update hiring stages.</p></div></div><RecruiterApplications initialRows={(data ?? []) as never} /></DashboardShell>;
}
