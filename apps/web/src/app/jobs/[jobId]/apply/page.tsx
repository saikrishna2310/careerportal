import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ApplicationForm } from "@/components/application-form";
import { createClient } from "@/lib/supabase/server";

export default async function ApplyToJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase.from("jobs").select("id,title,location,description,companies(name)").eq("id", jobId).eq("status", "published").maybeSingle();
  if (!job) notFound();
  const company = Array.isArray(job.companies) ? job.companies[0] : job.companies;
  return <DashboardShell><div className="page-heading"><div><div className="eyebrow">Candidate application</div><h1>Apply to {job.title}</h1><p>{company?.name ?? "Company"} · {job.location}</p></div><Link className="secondary-button" href="/">Back to jobs</Link></div><ApplicationForm jobId={job.id} jobTitle={job.title} /></DashboardShell>;
}
