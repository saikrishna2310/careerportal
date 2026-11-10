"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type RecruiterApplication = {
  id: string; status: string; submitted_at: string; resume_path: string | null;
  cover_letter: string | null;
  profiles: { full_name: string; email: string | null } | null;
  jobs: { title: string; companies: { name: string } | null } | null;
};
const stages = ["reviewing", "shortlisted", "interview", "rejected", "hired"];

export function RecruiterApplications({ initialRows }: { initialRows: RecruiterApplication[] }) {
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function updateStage(id: string, status: string) {
    setBusyId(id); setNotice("");
    const supabase = createClient();
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) setNotice(error.message);
    else setRows((current) => current.map((row) => row.id === id ? { ...row, status } : row));
    setBusyId(null);
  }

  async function openResume(path: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("resumes").createSignedUrl(path, 60);
    if (error || !data?.signedUrl) return setNotice(error?.message ?? "Unable to open resume.");
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return <section className="panel table-panel"><div className="panel-head"><div><h2>Candidate pipeline</h2><p>Only applications for companies you are authorized to manage are returned.</p></div></div>{notice && <p className="form-error" role="alert">{notice}</p>}{!rows.length ? <p>No candidate applications have arrived yet.</p> : <div className="table-scroll"><table className="data-table"><thead><tr><th>Candidate</th><th>Position</th><th>Applied</th><th>Resume</th><th>Stage</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><strong>{row.profiles?.full_name || "Candidate"}</strong><br/><small>{row.profiles?.email}</small></td><td>{row.jobs?.title}<br/><small>{row.jobs?.companies?.name}</small></td><td>{new Date(row.submitted_at).toLocaleDateString("en-IN")}</td><td>{row.resume_path ? <button className="text-button" onClick={() => void openResume(row.resume_path!)}>View resume</button> : "—"}</td><td><select aria-label={`Update status for ${row.profiles?.full_name ?? "candidate"}`} value={row.status} disabled={busyId === row.id || row.status === "withdrawn"} onChange={(event) => void updateStage(row.id, event.target.value)}>{[row.status, ...stages.filter((stage) => stage !== row.status)].map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_", " ")}</option>)}</select></td></tr>)}</tbody></table></div>}</section>;
}
