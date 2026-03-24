import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "@/components/marketing/LandingPage";

export default async function RootPage() {
  if (hasSupabaseEnv()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) redirect("/home");
    } catch {
      /* missing env at runtime */
    }
  }
  return <LandingPage />;
}
