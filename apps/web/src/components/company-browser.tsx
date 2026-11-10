"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Company = { id: string; name: string; industry: string | null; headquarters: string | null; description: string; };
const sampleCompanies: Company[] = [
  { id: "sample-1", name: "Northstar Digital", industry: "Software Development", headquarters: "Bengaluru, India", description: "Product engineering studio building digital experiences." },
  { id: "sample-2", name: "FinEdge Technologies", industry: "Financial Technology", headquarters: "Hyderabad, India", description: "Technology team developing secure financial products." },
  { id: "sample-3", name: "Meridian Insights", industry: "Data & Analytics", headquarters: "Remote, India", description: "Analytics team helping organizations make informed decisions." }
];

export function CompanyBrowser() {
  const [companies, setCompanies] = useState<Company[]>(sampleCompanies);
  const [live, setLive] = useState(false);
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("companies").select("id,name,industry,headquarters,description").eq("is_active", true).order("name");
        if (!error && data && active) { setCompanies(data); setLive(true); }
      } catch { /* retain sample view until the project is configured */ }
    }
    void load();
    return () => { active = false; };
  }, []);

  return <>
    <div className="demo-banner">{live ? "Showing active company records from Supabase." : "Showing illustrative employers. Connect Supabase to load live company records."}</div>
    <div className="list-page">
      {companies.map((company) => <article className="job-row" key={company.id}>
        <div style={{ display: "flex", gap: 13 }}><div className="stat-icon" style={{ background: "#edf2ff", color: "#5273df", width: 39, height: 39 }}><Building2 size={18} /></div><div><h3>{company.name}</h3><p>{company.industry ?? "Company"} · {company.headquarters ?? "Location not set"}</p><div style={{ fontSize: 11, color: "#8290a4", lineHeight: 1.5 }}>{company.description}</div></div></div>
        <span className="status shortlisted">Active</span>
      </article>)}
    </div>
  </>;
}
