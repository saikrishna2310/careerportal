import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { CompanyBrowser } from "@/components/company-browser";

export default function CompaniesPage() {
  return <DashboardShell>
    <div className="page-heading"><div><div className="eyebrow">Employer management</div><h1>Companies</h1><p>Manage employer profiles and the organizations behind your open roles.</p></div><Link href="/companies/new" className="primary-button"><Plus size={14} /> Add company</Link></div>
    <CompanyBrowser />
  </DashboardShell>;
}
