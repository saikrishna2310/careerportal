import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { JobForm } from "@/components/job-form";
import { requireRole } from "@/lib/auth/require-role";

export default async function NewJobPage() {
  await requireRole(["recruiter", "admin"]);
  return <DashboardShell>
    <div className="page-heading"><div><div className="eyebrow">Talent acquisition</div><h1>Create a job</h1><p>Publish a new opportunity for candidates to discover.</p></div><Link href="/jobs" className="secondary-button"><ArrowLeft size={13} /> Back to jobs</Link></div>
    <JobForm />
  </DashboardShell>;
}
