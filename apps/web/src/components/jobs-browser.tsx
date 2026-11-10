"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { demoJobs, formatINRRange, titleCase, type Job } from "@careerconnect/shared";
import { createClient } from "@/lib/supabase/client";

export function JobsBrowser() {
  const [jobs, setJobs] = useState<Job[]>(demoJobs);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [source, setSource] = useState("sample");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const client = createClient();
        const { data, error } = await client
          .from("jobs")
          .select("id,title,slug,location,work_mode,employment_type,experience_level,salary_min,salary_max,salary_currency,description,status,created_at,companies(name)")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (!active) return;
        if (error || !data?.length) return;
        const normalized = data.map((row: any) => ({
          ...row,
          company: row.companies?.name ?? "Verified employer",
          requirements: []
        })) as Job[];
        setJobs(normalized);
        setSource("live");
      } catch {
        // Sample data keeps the interface usable before Supabase is configured.
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const searchable = `${job.title} ${job.company} ${job.location}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (mode === "all" || job.work_mode === mode);
  }), [jobs, query, mode]);

  return (
    <>
      <div className="demo-banner">
        <span style={{ width: 7, height: 7, background: source === "live" ? "#159875" : "#5879e5", borderRadius: 10 }} />
        {source === "live" ? "Showing published vacancies from your Supabase database." : "Showing sample opportunities. Add Supabase credentials and run the migration to load live vacancies."}
      </div>
      <div className="panel" style={{ marginBottom: 15 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label className="search-box" style={{ flex: "1 1 270px", width: "auto" }}>
            <Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies or locations..." aria-label="Search jobs" />
          </label>
          <label className="secondary-button"><SlidersHorizontal size={13} />
            <select value={mode} onChange={(event) => setMode(event.target.value)} style={{ outline: 0, background: "transparent", border: 0, color: "inherit", fontSize: 11 }} aria-label="Filter by work mode">
              <option value="all">All work modes</option><option value="onsite">On-site</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option>
            </select>
          </label>
        </div>
      </div>
      <div className="list-page">
        {filteredJobs.map((job) => (
          <article className="job-row" key={job.id}>
            <div style={{ display: "flex", gap: 13 }}>
              <div className="stat-icon" style={{ background: "#edf2ff", color: "#5273df", width: 39, height: 39, flexShrink: 0 }}><BriefcaseBusiness size={18} /></div>
              <div>
                <h3>{job.title}</h3>
                <p>{job.company} <span style={{ margin: "0 6px" }}>·</span><MapPin size={11} style={{ display: "inline", verticalAlign: "-2px" }} /> {job.location}</p>
                <div className="job-tags"><span className="job-tag">{titleCase(job.employment_type)}</span><span className="job-tag">{titleCase(job.work_mode)}</span><span className="job-tag">{titleCase(job.experience_level)} level</span><span className="job-tag">{formatINRRange(job.salary_min, job.salary_max)}</span></div>
                <p style={{ margin: "11px 0 0", lineHeight: 1.5, maxWidth: 720 }}>{job.description}</p>
              </div>
            </div>
            {source === "live" ? <Link className="secondary-button" href={`/jobs/${job.id}/apply`}>Apply now <ArrowUpRight size={12} /></Link> : <span className="secondary-button" title="Connect Supabase to apply">Sample role</span>}
          </article>
        ))}
        {filteredJobs.length === 0 && <div className="panel" style={{ textAlign: "center", color: "#8390a3", padding: 40 }}>No roles match those filters. Try another keyword or work mode.</div>}
      </div>
    </>
  );
}
