import { DashboardShell } from "@/components/dashboard-shell";
import { demoApplications } from "@careerconnect/shared";

export default function ApplicationsPage() {
  return (
    <DashboardShell>
      <div className="page-heading"><div><div className="eyebrow">Talent pipeline</div><h1>Applications</h1><p>Review candidate activity and move applicants through your hiring process.</p></div><button className="secondary-button">Export CSV</button></div>
      <div className="demo-banner">Preview data — these candidate records are sample data for the interface.</div>
      <section className="panel table-panel" style={{ marginTop: 0 }}>
        <div className="panel-head"><div><h2>All applications</h2><p>5 sample records · Sorted by most recent</p></div><span className="select-pill">All statuses</span></div>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Reference</th><th>Candidate</th><th>Position</th><th>Employer</th><th>Applied</th><th>Status</th></tr></thead><tbody>
          {demoApplications.map((app) => <tr key={app.id}><td style={{ color: "#687895", fontWeight: 700 }}>{app.id}</td><td><div className="candidate-cell"><span className="avatar">{app.initials}</span>{app.candidate}</div></td><td>{app.role}</td><td>{app.company}</td><td>{app.appliedAt}</td><td><span className={`status ${app.status}`}>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></td></tr>)}
        </tbody></table></div>
      </section>
    </DashboardShell>
  );
}
