"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CompanyForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Software Development");
  const [headquarters, setHeadquarters] = useState("India");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sign in with a recruiter account before creating a company.");
      const slug = `${slugify(name)}-${user.id.slice(0, 6)}`;
      const { error: insertError } = await supabase.from("companies").insert({
        owner_id: user.id,
        name: name.trim(),
        slug,
        industry,
        headquarters: headquarters.trim(),
        website: website.trim() || null,
        description: description.trim()
      });
      if (insertError) throw insertError;
      router.push("/companies");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create company.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel" style={{ maxWidth: 760 }}>
      <div className="panel-head"><div><h2>Company profile</h2><p>Set up the employer identity used on your job posts.</p></div></div>
      <label className="field-label" htmlFor="company-name">Company name</label>
      <input id="company-name" className="field-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Northstar Digital" required minLength={2} maxLength={140} />
      <label className="field-label" htmlFor="industry">Industry</label>
      <select id="industry" className="field-input" value={industry} onChange={(event) => setIndustry(event.target.value)}><option>Software Development</option><option>Financial Technology</option><option>Data & Analytics</option><option>Education</option><option>Healthcare</option><option>Design & Technology</option><option>Other</option></select>
      <label className="field-label" htmlFor="headquarters">Headquarters</label>
      <input id="headquarters" className="field-input" value={headquarters} onChange={(event) => setHeadquarters(event.target.value)} placeholder="City, Country" required />
      <label className="field-label" htmlFor="website">Website (optional)</label>
      <input id="website" type="url" className="field-input" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://company.com" />
      <label className="field-label" htmlFor="description">Company description</label>
      <textarea id="description" className="field-input" style={{ minHeight: 115, resize: "vertical" }} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What does your organization do?" maxLength={2500} />
      {error && <div className="auth-error">{error}</div>}
      <div style={{ display: "flex", gap: 9, marginTop: 20 }}><button className="primary-button" type="submit" disabled={busy}>{busy && <LoaderCircle size={13} className="animate-spin" />}Create company</button><Link className="secondary-button" href="/companies">Cancel</Link></div>
    </form>
  );
}
