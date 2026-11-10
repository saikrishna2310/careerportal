import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { CompanyForm } from "@/components/company-form";
import { requireRole } from "@/lib/auth/require-role";

export default async function NewCompanyPage() {
  await requireRole(["recruiter", "admin"]);
  return <DashboardShell>
    <div className="page-heading"><div><div className="eyebrow">Employer management</div><h1>Add a company</h1><p>Create an organization profile to associate with job listings.</p></div><Link href="/companies" className="secondary-button"><ArrowLeft size={13} /> Back to companies</Link></div>
    <CompanyForm />
  </DashboardShell>;
}
