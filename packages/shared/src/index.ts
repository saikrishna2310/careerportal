export type UserRole = "student" | "recruiter" | "admin";
export type JobStatus = "draft" | "published" | "paused" | "closed";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";
export type WorkMode = "onsite" | "hybrid" | "remote";
export type ExperienceLevel = "entry" | "junior" | "mid" | "senior";
export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired"
  | "withdrawn";

export interface Job {
  id: string;
  company_id?: string;
  title: string;
  slug?: string;
  company: string;
  company_name?: string;
  company_logo_url?: string | null;
  location: string;
  work_mode: WorkMode;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  description: string;
  requirements?: string[];
  status?: JobStatus;
  created_at?: string;
}

export interface Application {
  id: string;
  candidate: string;
  initials: string;
  role: string;
  company: string;
  appliedAt: string;
  status: ApplicationStatus;
}

export const demoJobs: Job[] = [
  {
    id: "demo-job-001",
    title: "Frontend Engineer",
    company: "Northstar Digital",
    location: "Bengaluru, India",
    work_mode: "hybrid",
    employment_type: "full_time",
    experience_level: "junior",
    salary_min: 600000,
    salary_max: 900000,
    salary_currency: "INR",
    description: "Build accessible, high-performance product experiences with React and TypeScript.",
    requirements: ["React", "TypeScript", "CSS", "API integration"],
    status: "published"
  },
  {
    id: "demo-job-002",
    title: "Backend Developer – Node.js",
    company: "FinEdge Technologies",
    location: "Hyderabad, India",
    work_mode: "onsite",
    employment_type: "full_time",
    experience_level: "entry",
    salary_min: 500000,
    salary_max: 750000,
    salary_currency: "INR",
    description: "Develop secure APIs and scalable services for a growing fintech platform.",
    requirements: ["Node.js", "PostgreSQL", "REST APIs", "Git"],
    status: "published"
  },
  {
    id: "demo-job-003",
    title: "Data Analyst Intern",
    company: "Meridian Insights",
    location: "Remote, India",
    work_mode: "remote",
    employment_type: "internship",
    experience_level: "entry",
    salary_min: 180000,
    salary_max: 240000,
    salary_currency: "INR",
    description: "Turn business data into clear dashboards, reports, and useful insights.",
    requirements: ["SQL", "Python", "Excel", "Data visualization"],
    status: "published"
  },
  {
    id: "demo-job-004",
    title: "Product Design Associate",
    company: "Loom & Logic",
    location: "Pune, India",
    work_mode: "hybrid",
    employment_type: "full_time",
    experience_level: "junior",
    salary_min: 450000,
    salary_max: 650000,
    salary_currency: "INR",
    description: "Work with product and engineering teams to shape intuitive user journeys.",
    requirements: ["Figma", "Design systems", "Prototyping", "User research"],
    status: "published"
  }
];

export const demoApplications: Application[] = [
  { id: "APP-1048", candidate: "Aarav Mehta", initials: "AM", role: "Frontend Engineer", company: "Northstar Digital", appliedAt: "Today, 10:42 AM", status: "reviewing" },
  { id: "APP-1047", candidate: "Ishita Rao", initials: "IR", role: "Backend Developer – Node.js", company: "FinEdge Technologies", appliedAt: "Today, 9:18 AM", status: "shortlisted" },
  { id: "APP-1046", candidate: "Kabir Shah", initials: "KS", role: "Data Analyst Intern", company: "Meridian Insights", appliedAt: "Yesterday", status: "interview" },
  { id: "APP-1045", candidate: "Ananya Iyer", initials: "AI", role: "Frontend Engineer", company: "Northstar Digital", appliedAt: "Yesterday", status: "submitted" },
  { id: "APP-1044", candidate: "Rohan Nair", initials: "RN", role: "Product Design Associate", company: "Loom & Logic", appliedAt: "12 Nov 2026", status: "hired" }
];

export function formatINRRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Compensation not disclosed";
  const format = (value: number) => `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)} LPA`;
  if (min != null && max != null) return `${format(min)} – ${format(max)}`;
  return min != null ? `From ${format(min)}` : `Up to ${format(max!)}`;
}

export function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
