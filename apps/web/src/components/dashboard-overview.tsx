import Link from "next/link";
import {
  ArrowDownRight, ArrowUpRight, BriefcaseBusiness, CalendarDays,
  Download, FileText, Plus, UsersRound, Video
} from "lucide-react";
import { demoApplications } from "@careerconnect/shared";

const stats = [
  { label: "Active job posts", value: "24", change: "+12.5%", detail: "vs. previous month", icon: BriefcaseBusiness, tint: "#edf2ff", color: "#5273df" },
  { label: "Total applications", value: "1,284", change: "+8.2%", detail: "vs. previous month", icon: FileText, tint: "#eaf8f4", color: "#159875" },
  { label: "Candidates shortlisted", value: "68", change: "+4.6%", detail: "vs. previous month", icon: UsersRound, tint: "#fff4e7", color: "#d58c34" },
  { label: "Interviews scheduled", value: "32", change: "+16.3%", detail: "vs. previous month", icon: Video, tint: "#fff0f3", color: "#d36c86" }
];

const barData = [
  { label: "May", applications: 48, hires: 25 },
  { label: "Jun", applications: 61, hires: 31 },
  { label: "Jul", applications: 55, hires: 28 },
  { label: "Aug", applications: 76, hires: 38 },
  { label: "Sep", applications: 68, hires: 35 },
  { label: "Oct", applications: 88, hires: 45 },
  { label: "Nov", applications: 96, hires: 52 }
];

const funnel = [
  { label: "Applications received", value: 1284, width: "100%", color: "#6e89eb" },
  { label: "Under review", value: 486, width: "72%", color: "#8aa0ef" },
  { label: "Shortlisted", value: 168, width: "49%", color: "#59bba1" },
  { label: "Interview stage", value: 92, width: "34%", color: "#e7b36c" },
  { label: "Offers extended", value: 28, width: "18%", color: "#d9859a" }
];

function Status({ status }: { status: string }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`status ${status}`}>{label}</span>;
}

export function DashboardOverview() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Monday, 9 November 2026</div>
          <h1>Hiring overview</h1>
          <p>Here’s what’s happening across your talent pipeline.</p>
        </div>
        <div style={{ display: "flex", gap: 9 }}>
          <button className="secondary-button"><Download size={13} /> Export report</button>
          <Link href="/jobs/new" className="primary-button"><Plus size={14} /> Post a job</Link>
        </div>
      </div>

      <div className="demo-banner">
        <span style={{ display: "inline-block", width: 7, height: 7, background: "#5879e5", borderRadius: 10 }} />
        <strong>Preview workspace</strong> — dashboard figures and candidate records below are illustrative sample data. Connect Supabase to use live records.
      </div>

      <section className="stats-grid" aria-label="Hiring metrics">
        {stats.map(({ label, value, change, detail, icon: Icon, tint, color }) => (
          <article className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-icon" style={{ background: tint, color }}><Icon size={16} /></span>
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-foot"><strong><ArrowUpRight size={11} style={{ display: "inline", verticalAlign: "-2px" }} /> {change}</strong> &nbsp;{detail}</div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-head">
            <div><h2>Hiring activity</h2><p>Application volume and successful hires over time</p></div>
            <select className="select-pill" defaultValue="7 months" aria-label="Chart period">
              <option>7 months</option><option>30 days</option><option>12 months</option>
            </select>
          </div>
          <div className="chart-legend">
            <span><i className="legend-dot" style={{ background: "#5477e8" }} /> Applications</span>
            <span><i className="legend-dot" style={{ background: "#b9c7fb" }} /> Hires</span>
          </div>
          <div className="bar-chart" role="img" aria-label="Illustrative bar chart of applications and hires from May to November">
            {barData.map((item) => (
              <div className="bar-group" key={item.label}>
                <div className="bar" style={{ height: `${item.applications}%` }} />
                <div className="bar alt" style={{ height: `${item.hires}%` }} />
              </div>
            ))}
          </div>
          <div className="chart-labels">{barData.map((item) => <span key={item.label}>{item.label}</span>)}</div>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div><h2>Application funnel</h2><p>Candidate progression by stage</p></div>
            <button className="select-pill">This month</button>
          </div>
          <div className="funnel-list">
            {funnel.map((item) => (
              <div className="funnel-row" key={item.label}>
                <div className="funnel-meta"><span>{item.label}</span><strong>{item.value.toLocaleString("en-IN")}</strong></div>
                <div className="funnel-track"><div className="funnel-fill" style={{ width: item.width, background: item.color }} /></div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel table-panel">
        <div className="panel-head">
          <div><h2>Recent applications</h2><p>Latest candidate activity across your open roles</p></div>
          <Link href="/applications" className="secondary-button">View all applications <ArrowDownRight size={12} /></Link>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Candidate</th><th>Position</th><th>Company</th><th>Applied</th><th>Status</th></tr></thead>
            <tbody>
              {demoApplications.map((application) => (
                <tr key={application.id}>
                  <td><div className="candidate-cell"><span className="avatar">{application.initials}</span>{application.candidate}</div></td>
                  <td>{application.role}</td>
                  <td>{application.company}</td>
                  <td>{application.appliedAt}</td>
                  <td><Status status={application.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9aa5b4", fontSize: 10, marginTop: 19 }}>
        <span>CareerConnect workspace · Sample analytics</span>
        <span><CalendarDays size={11} style={{ display: "inline", verticalAlign: "-2px" }} /> Reporting period: May – November 2026</span>
      </div>
    </>
  );
}
