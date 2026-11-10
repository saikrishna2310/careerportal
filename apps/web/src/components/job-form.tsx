"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type CompanyOption = { id: string; name: string };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function JobForm() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Hyderabad, India");
  const [workMode, setWorkMode] = useState("hybrid");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [experience, setExperience] = useState("entry");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState("published");
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCompanies() {
      try {
        const supabase = createClient();
        const { data, error: loadError } = await supabase.from("companies").select("id,name").eq("is_active", true).order("name");
        if (loadError) throw loadError;
        if (active) {
          const rows = data ?? [];
          setCompanies(rows);
          setCompanyId(rows[0]?.id ?? "");
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Unable to load companies.");
      } finally {
        if (active) setLoadingCompanies(false);
      }
    }
    void loadCompanies();
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    if (salaryMin && salaryMax && Number(salaryMin) > Number(salaryMax)) {
      setError("Minimum salary cannot be greater than maximum salary.");
      setBusy(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in with a recruiter account before posting a job.");
      if (!companyId) throw new Error("Create or select a company before posting a vacancy.");
      const slug = `${slugify(title)}-${Date.now().toString(36)}`;
      const { error: insertError } = await supabase.from("jobs").insert({
        company_id: companyId,
        created_by: user.id,
        title: title.trim(),
        slug,
        department,
        location: location.trim(),
        work_mode: workMode,
        employment_type: employmentType,
        experience_level: experience,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        salary_currency: "INR",
        description: description.trim(),
        requirements: requirements.split(",").map((item) => item.trim()).filter(Boolean),
        status,
        published_at: status === "published" ? new Date().toISOString() : null
      });
      if (insertError) throw insertError;
      router.push("/jobs");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create this job.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel" style={{ maxWidth: 850 }}>
      <div className="panel-head"><div><h2>Role details</h2><p>Write a clear, inclusive description of the opportunity.</p></div></div>
      {companies.length === 0 && !loadingCompanies ? <div className="demo-banner" style={{ display: "block" }}>No active company is available for this recruiter. <Link href="/companies/new" style={{ color: "#4169e1", fontWeight: 800 }}>Create a company first →</Link></div> : null}
      <label className="field-label" htmlFor="company">Employer</label>
      <select id="company" className="field-input" value={companyId} onChange={(event) => setCompanyId(event.target.value)} required disabled={loadingCompanies || companies.length === 0}>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>
      <label className="field-label" htmlFor="title">Job title</label>
      <input id="title" className="field-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Junior Frontend Developer" required minLength={3} maxLength={160} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
        <div><label className="field-label" htmlFor="department">Department</label><input id="department" className="field-input" value={department} onChange={(event) => setDepartment(event.target.value)} required /></div>
        <div><label className="field-label" htmlFor="location">Location</label><input id="location" className="field-input" value={location} onChange={(event) => setLocation(event.target.value)} required /></div>
        <div><label className="field-label" htmlFor="workMode">Work mode</label><select id="workMode" className="field-input" value={workMode} onChange={(event) => setWorkMode(event.target.value)}><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></div>
        <div><label className="field-label" htmlFor="employment">Employment type</label><select id="employment" className="field-input" value={employmentType} onChange={(event) => setEmploymentType(event.target.value)}><option value="full_time">Full-time</option><option value="part_time">Part-time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></div>
        <div><label className="field-label" htmlFor="experience">Experience level</label><select id="experience" className="field-input" value={experience} onChange={(event) => setExperience(event.target.value)}><option value="entry">Entry level</option><option value="junior">Junior</option><option value="mid">Mid level</option><option value="senior">Senior</option></select></div>
        <div><label className="field-label" htmlFor="status">Publishing status</label><select id="status" className="field-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="published">Publish now</option><option value="draft">Save as draft</option></select></div>
        <div><label className="field-label" htmlFor="salaryMin">Minimum annual salary (INR)</label><input id="salaryMin" type="number" min="0" className="field-input" value={salaryMin} onChange={(event) => setSalaryMin(event.target.value)} placeholder="e.g. 500000" /></div>
        <div><label className="field-label" htmlFor="salaryMax">Maximum annual salary (INR)</label><input id="salaryMax" type="number" min="0" className="field-input" value={salaryMax} onChange={(event) => setSalaryMax(event.target.value)} placeholder="e.g. 800000" /></div>
      </div>
      <label className="field-label" htmlFor="description">Job description</label>
      <textarea id="description" className="field-input" style={{ minHeight: 135, resize: "vertical" }} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the role, responsibilities, team, and expected outcomes..." required minLength={30} />
      <label className="field-label" htmlFor="requirements">Required skills (comma separated)</label>
      <input id="requirements" className="field-input" value={requirements} onChange={(event) => setRequirements(event.target.value)} placeholder="React, TypeScript, REST APIs, Git" />
      {error && <div className="auth-error">{error}</div>}
      <div style={{ display: "flex", gap: 9, marginTop: 20 }}><button className="primary-button" type="submit" disabled={busy || loadingCompanies || companies.length === 0}>{busy && <LoaderCircle size={13} className="animate-spin" />}{status === "published" ? "Publish job" : "Save draft"}</button><Link className="secondary-button" href="/jobs">Cancel</Link></div>
    </form>
  );
}
