"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, ChevronDown,
  CircleHelp, Command, FileText, LayoutDashboard, Search, Settings2,
  UsersRound, UserRoundSearch
} from "lucide-react";
import type { ReactNode } from "react";

const navigation = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Student portal", href: "/student", icon: UsersRound },
  { label: "Job listings", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "My applications", href: "/student/applications", icon: FileText },
  { label: "Applicant management", href: "/recruiter/applications", icon: UsersRound },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Candidates", href: "/candidates", icon: UserRoundSearch },
  { label: "Companies", href: "/companies", icon: Building2 }
];

const workspace = [
  { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
  { label: "Settings", href: "/settings", icon: Settings2 }
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <div className="brand-mark"><Command size={19} strokeWidth={2.5} /></div>
          <div className="brand-copy">
            <div className="brand-name">CareerConnect</div>
            <div className="brand-sub">Talent workspace</div>
          </div>
        </Link>

        <div className="nav-caption">Workspace</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}>
                <Icon size={17} strokeWidth={1.9} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="nav-caption" style={{ marginTop: 18 }}>Manage</div>
        <nav className="nav-list" aria-label="Workspace management">
          {workspace.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}>
                <Icon size={17} strokeWidth={1.9} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="plan-card">
            <strong>Workspace setup</strong>
            <p>Connect your Supabase project to activate live hiring data.</p>
            <div className="plan-track"><span /></div>
          </div>
          <div className="profile-mini">
            <div className="avatar">CC</div>
            <div><strong>CareerConnect Demo</strong><span>Preview workspace</span></div>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span style={{ color: "#c4ccda", margin: "0 7px" }}>/</span> <strong style={{ color: "#506078", fontWeight: 650 }}>{pathname === "/" ? "Overview" : pathname.split("/")[1]?.replace(/^./, (c) => c.toUpperCase())}</strong></div>
          <div className="topbar-actions">
            <label className="search-box">
              <Search size={14} />
              <input aria-label="Search workspace" placeholder="Search anything..." />
              <span style={{ fontSize: 9, border: "1px solid #e4e9f1", padding: "2px 4px", borderRadius: 4 }}>⌘K</span>
            </label>
            <button className="icon-button" aria-label="Help"><CircleHelp size={16} /></button>
            <Link className="icon-button" aria-label="Notifications" href="/notifications"><Bell size={16} /></Link>
            <Link href="/login" className="top-profile">
              <div className="avatar">JD</div>
              <div><strong>Workspace demo</strong><span>Sign in to continue</span></div>
              <ChevronDown size={13} color="#9aa5b5" />
            </Link>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
