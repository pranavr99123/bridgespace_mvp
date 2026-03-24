import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ observations: [], mocked: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .single();
  if (!profile?.couple_id) return NextResponse.json({ observations: [] });

  const { data, error } = await supabase
    .from("signal_observations")
    .select("*")
    .eq("couple_id", profile.couple_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ observations: data ?? [] });
}
