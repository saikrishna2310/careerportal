import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireRole(allowedRoles: Array<"student" | "recruiter" | "admin">) {
  const supabase = await createClient().catch(() => {
    redirect("/login");
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !allowedRoles.includes(profile.role)) redirect("/");
  return { user, role: profile.role };
}
