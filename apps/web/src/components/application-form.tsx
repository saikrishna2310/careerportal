"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!resume) return setError("Choose a PDF or Word resume to continue.");
    if (!ALLOWED_TYPES.includes(resume.type)) return setError("Resume must be PDF, DOC or DOCX.");
    if (resume.size > MAX_RESUME_BYTES) return setError("Resume must be 10 MB or smaller.");

    setBusy(true);
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setBusy(false);
      router.push(`/login?next=${encodeURIComponent(`/jobs/${jobId}/apply`)}`);
      return;
    }

    const safeName = resume.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const resumePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const upload = await supabase.storage.from("resumes").upload(resumePath, resume, {
      contentType: resume.type,
      upsert: false,
    });
    if (upload.error) {
      setBusy(false);
      return setError(upload.error.message);
    }

    const result = await supabase.from("applications").insert({
      job_id: jobId,
      applicant_id: user.id,
      resume_path: resumePath,
      cover_letter: coverLetter.trim() || null,
    });

    if (result.error) {
      await supabase.storage.from("resumes").remove([resumePath]);
      setBusy(false);
      return setError(result.error.code === "23505" ? "You have already applied for this job." : result.error.message);
    }

    setBusy(false);
    setSuccess(true);
  }

  if (success) {
    return <div className="panel" role="status"><h2>Application submitted</h2><p>Your application for {jobTitle} has been received. You can track its progress in your student dashboard.</p><a className="primary-button" href="/student/applications">Track application</a></div>;
  }

  return <form className="panel form-stack" onSubmit={submit}>
    <div><h2>Apply for {jobTitle}</h2><p>Your resume is stored privately and shared only with the hiring team for this vacancy.</p></div>
    <label className="field-label">Resume (PDF, DOC or DOCX · max 10 MB)<input required type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setResume(e.target.files?.[0] ?? null)} /></label>
    <label className="field-label">Cover letter (optional)<textarea rows={6} maxLength={5000} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the hiring team why you're a good fit..." /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-button" disabled={busy}>{busy ? "Submitting..." : "Submit application"}</button>
  </form>;
}
