import { DashboardShell } from "@/components/dashboard-shell";

const metrics = [
  ["Time to shortlist", "4.8 days", "Median time from application to shortlist"],
  ["Interview-to-offer", "30.4%", "Illustrative conversion rate"],
  ["Offer acceptance", "82.1%", "Illustrative acceptance rate"],
  ["Open positions", "24", "Across 8 sample departments"]
];

export default function AnalyticsPage() {
  return <DashboardShell>
    <div className="page-heading"><div><div className="eyebrow">Reporting & insights</div><h1>Hiring analytics</h1><p>Understand pipeline health, speed, and conversion trends.</p></div><button className="secondary-button">Last 90 days</button></div>
    <div className="demo-banner">Illustrative analytics — connect your database and implement event tracking before using these figures for business decisions.</div>
    <div className="stats-grid">{metrics.map(([label, value, description]) => <article className="stat-card" key={label}><div className="stat-top">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{description}</div></article>)}</div>
    <div className="dashboard-grid"><article className="panel"><div className="panel-head"><div><h2>Pipeline health</h2><p>Sample distribution by hiring stage</p></div></div><div className="funnel-list">{[["New applications", "100%", "#6e89eb"],["Screening", "74%", "#879eed"],["Shortlisted", "48%", "#59bba1"],["Interview", "31%", "#e7b36c"],["Offer", "15%", "#d9859a"]].map(([name,width,color]) => <div className="funnel-row" key={name}><div className="funnel-meta"><span>{name}</span><strong>{width}</strong></div><div className="funnel-track"><div className="funnel-fill" style={{ width, background: color }} /></div></div>)}</div></article><article className="panel"><div className="panel-head"><div><h2>Reporting notes</h2><p>Recommended production metrics</p></div></div><ul style={{ margin: 0, paddingLeft: 18, color: "#718097", fontSize: 11, lineHeight: 2.1 }}><li>Source metrics from application and status-change events.</li><li>Calculate time-to-hire from accepted offer timestamps.</li><li>Segment by role, department, location, and source.</li><li>Exclude withdrawn and duplicate applications.</li></ul></article></div>
  </DashboardShell>;
}
