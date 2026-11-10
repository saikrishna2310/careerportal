import { DashboardShell } from "@/components/dashboard-shell";

export default function Page() {
  return (
    <DashboardShell>
      <div className="page-heading"><div><div className="eyebrow">Talent pool</div><h1>Candidate directory</h1><p>Discover and manage talent profiles in your hiring network.</p></div></div>
      <div className="demo-banner">Module scaffold — this page is ready for its database-backed workflow in the next implementation milestone.</div>
      <section className="panel" style={{ padding: 28 }}>
        <h2 style={{ margin: "0 0 9px", fontSize: 15 }}>Candidate directory workspace</h2>
        <p style={{ margin: 0, color: "#8390a3", fontSize: 12, lineHeight: 1.7 }}>The navigation, layout, design tokens, and responsive shell are in place. The production data workflow for this module will be connected to Supabase as it is implemented.</p>
      </section>
    </DashboardShell>
  );
}
