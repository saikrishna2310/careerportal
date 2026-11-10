import Link from "next/link";
import { ArrowUpRight, Bookmark, FileText, UserRoundCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { requireRole } from "@/lib/auth/require-role";
import { demoJobs } from "@careerconnect/shared";

const milestones = [
  { label: "Profile details", done: true },
  { label: "Skills and education", done: true },
  { label: "Resume uploaded", done: false },
  { label: "Career preferences", done: false }
];

export default async function StudentDashboardPage() {
  await requireRole(["student", "admin"]);
  return (
    <DashboardShell>
      <div className="page-heading">
        <div><div className="eyebrow">Student workspace</div><h1>Your career journey</h1><p>Keep your profile ready and discover roles that match your goals.</p></div>
        <Link href="/jobs" className="primary-button">Explore opportunities <ArrowUpRight size={13} /></Link>
      </div>
      <div className="demo-banner">Student workspace preview — figures and recommendations are illustrative sample data.</div>
      <div className="stats-grid">
        {[
          ["Applications submitted", "05", FileText, "#edf2ff", "#5273df"],
          ["Saved opportunities", "08", Bookmark, "#eaf8f4", "#159875"],
          ["Profile completion", "75%", UserRoundCheck, "#fff4e7", "#d58c34"],
          ["Upcoming interviews", "02", ArrowUpRight, "#fff0f3", "#d36c86"]
        ].map(([label, value, Icon, tint, color]) => {
          const MetricIcon = Icon as typeof FileText;
          return <article className="stat-card" key={label as string}><div className="stat-top"><span>{label as string}</span><span className="stat-icon" style={{ background: tint as string, color: color as string }}><MetricIcon size={16} /></span></div><div className="stat-value">{value as string}</div><div className="stat-foot">Your current career activity</div></article>;
        })}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-head"><div><h2>Recommended opportunities</h2><p>Roles to explore based on your skills and preferences</p></div><Link href="/jobs" className="secondary-button">Browse all</Link></div>
          <div className="list-page">
            {demoJobs.slice(0, 3).map((job) => <article key={job.id} className="job-row"><div><h3>{job.title}</h3><p>{job.company} · {job.location}</p><div className="job-tags"><span className="job-tag">{job.employment_type.replace("_", " ")}</span><span className="job-tag">{job.work_mode}</span></div></div><span className="status reviewing">Recommended</span></article>)}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head"><div><h2>Profile strength</h2><p>Complete these steps to improve recruiter visibility</p></div></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}><strong style={{ fontSize: 30, color: "#192943" }}>75%</strong><span style={{ color: "#8e9bad", fontSize: 10 }}>complete</span></div>
          <div className="funnel-track" style={{ margin: "12px 0 18px", height: 8 }}><div className="funnel-fill" style={{ width: "75%", height: "100%", background: "#5477e8" }} /></div>
          <div style={{ display: "grid", gap: 13 }}>{milestones.map((item) => <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 11, color: "#66758c" }}><span style={{ width: 17, height: 17, display: "grid", placeItems: "center", borderRadius: 20, background: item.done ? "#e5f6ef" : "#f2f4f8", color: item.done ? "#149775" : "#a0abba", fontSize: 10 }}>{item.done ? "✓" : "○"}</span>{item.label}</div>)}</div>
          <button className="primary-button" style={{ marginTop: 20, width: "100%" }}>Complete my profile</button>
        </section>
      </div>
    </DashboardShell>
  );
}
