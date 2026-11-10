import { DashboardShell } from "@/components/dashboard-shell";

export default function Page() {
  return (
    <DashboardShell>
      <div className="page-heading"><div><div className="eyebrow">Administration</div><h1>Workspace settings</h1><p>Configure your organization, user access, and workspace preferences.</p></div></div>
      <div className="demo-banner">Module scaffold — this page is ready for its database-backed workflow in the next implementation milestone.</div>
      <section className="panel" style={{ padding: 28 }}>
        <h2 style={{ margin: "0 0 9px", fontSize: 15 }}>Workspace settings workspace</h2>
        <p style={{ margin: 0, color: "#8390a3", fontSize: 12, lineHeight: 1.7 }}>The navigation, layout, design tokens, and responsive shell are in place. The production data workflow for this module will be connected to Supabase as it is implemented.</p>
      </section>
    </DashboardShell>
  );
}
