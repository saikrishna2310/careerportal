"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Row = { id: string; status: string; submitted_at: string; resume_path: string | null; cover_letter: string | null; jobs: { title: string; location: string; companies: { name: string } | null } | null };

export function ApplicationStatusList({ initialRows }: { initialRows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel>;
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      channel = supabase.channel(`student-applications-${data.user.id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "applications", filter: `applicant_id=eq.${data.user.id}` }, (payload) => {
          setRows((current) => current.map((row) => row.id === payload.new.id ? { ...row, status: payload.new.status as string } : row));
          setMessage("An application status has just changed.");
        }).subscribe();
    });
    return () => { if (channel) void supabase.removeChannel(channel); };
  }, []);

  async function withdraw(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("applications").update({ status: "withdrawn" }).eq("id", id);
    setMessage(error ? error.message : "Application withdrawn.");
    if (!error) setRows((current) => current.map((row) => row.id === id ? { ...row, status: "withdrawn" } : row));
  }

  if (!rows.length) return <div className="panel"><h2>No applications yet</h2><p>Apply to a published role and your progress will appear here.</p><a className="primary-button" href="/">Explore jobs</a></div>;
  return <div className="panel table-panel"><div className="panel-head"><div><h2>Your applications</h2><p>Live status updates from hiring teams</p></div></div>{message && <p className="form-success" role="status">{message}</p>}<div className="table-scroll"><table className="data-table"><thead><tr><th>Position</th><th>Company</th><th>Applied</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.jobs?.title ?? "Job opening"}</td><td>{row.jobs?.companies?.name ?? "Company"}</td><td>{new Date(row.submitted_at).toLocaleDateString("en-IN")}</td><td><span className={`status ${row.status}`}>{row.status.replaceAll("_", " ")}</span></td><td>{["submitted", "reviewing"].includes(row.status) && <button className="text-button" onClick={() => void withdraw(row.id)}>Withdraw</button>}</td></tr>)}</tbody></table></div></div>;
}
