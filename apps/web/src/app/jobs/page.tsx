import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { JobsBrowser } from "@/components/jobs-browser";

export default function JobsPage() {
  return (
    <DashboardShell>
      <div className="page-heading">
        <div><div className="eyebrow">Talent acquisition</div><h1>Job listings</h1><p>Manage open roles and discover opportunities across the platform.</p></div>
        <Link href="/jobs/new" className="primary-button"><Plus size={14} /> Create job</Link>
      </div>
      <JobsBrowser />
    </DashboardShell>
  );
}
