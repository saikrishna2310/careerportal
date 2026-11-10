"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Command, LoaderCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "recruiter">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function routeByAccountRole(supabase: ReturnType<typeof createClient>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      router.refresh();
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    router.push(profile?.role === "student" ? "/student" : "/");
    router.refresh();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName.trim(), role },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        if (authError) throw authError;
        if (data.session) {
          await routeByAccountRole(supabase);
        } else {
          setNotice("Account created. Check your email to confirm your address, then sign in.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        await routeByAccountRole(supabase);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-art">
        <Link href="/" className="brand" style={{ padding: 0, color: "white" }}>
          <div className="brand-mark"><Command size={19} /></div><div className="brand-name">CareerConnect</div>
        </Link>
        <div>
          <div className="eyebrow" style={{ color: "#a9bcff" }}>A better way to move forward</div>
          <h1>Where talent meets its next opportunity.</h1>
          <p>One workspace for discovering opportunities, building teams, and making meaningful career progress.</p>
        </div>
        <div style={{ color: "#91a4c7", fontSize: 10 }}>CareerConnect · Talent workspace</div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <div className="eyebrow">{mode === "login" ? "Welcome back" : "Get started"}</div>
          <h2>{mode === "login" ? "Sign in to your account" : "Create your account"}</h2>
          <p>{mode === "login" ? "Enter your details to access your CareerConnect workspace." : "Set up a profile and start connecting with opportunities."}</p>

          {mode === "signup" && <>
            <label className="field-label" htmlFor="fullName">Full name</label>
            <input id="fullName" className="field-input" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" autoComplete="name" required />
            <label className="field-label" htmlFor="role">I am joining as</label>
            <select id="role" className="field-input" value={role} onChange={(event) => setRole(event.target.value as "student" | "recruiter")}>
              <option value="student">Student / job seeker</option><option value="recruiter">Recruiter / employer</option>
            </select>
          </>}
          <label className="field-label" htmlFor="email">Email address</label>
          <input id="email" className="field-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" className="field-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required />

          {error && <div className="auth-error" role="alert">{error}</div>}
          {notice && <div className="demo-banner" role="status">{notice}</div>}
          <button type="submit" className="primary-button" disabled={busy} style={{ width: "100%", marginTop: 20, padding: 13, opacity: busy ? .7 : 1 }}>
            {busy && <LoaderCircle size={14} className="animate-spin" />}{mode === "login" ? "Sign in" : "Create account"}
          </button>
          <div className="auth-note">By continuing, you agree to use CareerConnect responsibly. Your account data is protected by Supabase authentication and database access policies.</div>
          <p style={{ marginTop: 24, textAlign: "center", color: "#7d8ba0" }}>
            {mode === "login" ? "New to CareerConnect? " : "Already have an account? "}
            <Link href={mode === "login" ? "/signup" : "/login"} style={{ color: "#4169e1", fontWeight: 700 }}>{mode === "login" ? "Create an account" : "Sign in"}</Link>
          </p>
          <div style={{ textAlign: "center", marginTop: 5 }}><Link href="/" style={{ color: "#9aa5b4", fontSize: 10 }}>← Back to dashboard preview</Link></div>
        </form>
      </section>
    </div>
  );
}
