"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Notice = { id: string; title: string; body: string; read_at: string | null; created_at: string };
export function NotificationCenter({ initialItems }: { initialItems: Notice[] }) {
  const [items, setItems] = useState(initialItems);
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel>;
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      channel = supabase.channel(`notifications-${data.user.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${data.user.id}` }, (payload) => setItems((current) => [payload.new as Notice, ...current]));
      channel.subscribe();
    });
    return () => { if (channel) void supabase.removeChannel(channel); };
  }, []);
  async function markRead(id: string) {
    const readAt = new Date().toISOString();
    const { error } = await createClient().from("notifications").update({ read_at: readAt }).eq("id", id);
    if (!error) setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: readAt } : item));
  }
  return <section className="panel"><div className="panel-head"><div><h2>Notifications</h2><p>Live updates about applications and hiring activity</p></div><span className="select-pill">{items.filter((item) => !item.read_at).length} unread</span></div>{items.length ? <div className="notification-list">{items.map((item) => <article key={item.id} className="notification-item"><div><strong>{item.title}</strong><p>{item.body}</p><small>{new Date(item.created_at).toLocaleString("en-IN")}</small></div>{!item.read_at && <button className="text-button" onClick={() => void markRead(item.id)}>Mark read</button>}</article>)}</div> : <p>You are all caught up.</p>}</section>;
}
