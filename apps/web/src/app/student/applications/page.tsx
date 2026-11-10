import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApplicationStatusList } from "@/components/application-status-list";
import { createClient } from "@/lib/supabase/server";

export default async function StudentApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/student/applications");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "student") redirect("/login");
  const { data } = await supabase.from("applications").select("id,status,submitted_at,resume_path,cover_letter,jobs(title,location,companies(name))").eq("applicant_id", user.id).order("submitted_at", { ascending: false });
  return <DashboardShell><div className="page-heading"><div><div className="eyebrow">Candidate workspace</div><h1>My applications</h1><p>Follow every application from submission through the hiring process.</p></div></div><ApplicationStatusList initialRows={(data ?? []) as never} /></DashboardShell>;
}
