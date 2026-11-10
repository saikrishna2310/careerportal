import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { NotificationCenter } from "@/components/notification-center";
import { createClient } from "@/lib/supabase/server";
export default async function StudentNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data } = await supabase.from("notifications").select("id,title,body,read_at,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
  return <DashboardShell><div className="page-heading"><div><div className="eyebrow">Activity center</div><h1>Notifications</h1><p>Application updates appear here as soon as they happen.</p></div></div><NotificationCenter initialItems={data ?? []} /></DashboardShell>;
}
