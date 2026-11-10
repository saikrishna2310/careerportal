import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = "/";
  redirectTo.search = "";

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return NextResponse.redirect(redirectTo);

    const response = NextResponse.redirect(redirectTo);
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      }
    });
    await supabase.auth.exchangeCodeForSession(code);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role === "student") redirectTo.pathname = "/student";
    }
    response.headers.set("Location", redirectTo.toString());
    return response;
  }

  return NextResponse.redirect(redirectTo);
}
