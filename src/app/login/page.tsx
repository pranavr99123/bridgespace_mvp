"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [msg, setMsg] = useState("");

  const submit = async () => {
    if (!hasSupabaseEnv()) {
      setMsg("Supabase env not configured. App is running in local MVP mode.");
      return;
    }
    const supabase = createClient();
    const result = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      setMsg(result.error.message);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/home";
    router.push(next);
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-md card p-5">
      <h1 className="text-2xl font-semibold">{isSignup ? "Create account" : "Login"}</h1>
      <p className="mt-1 subtle">Use Supabase Auth email/password.</p>
      <input
        className="mt-4 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="mt-2 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="mt-3 w-full rounded-lg bg-accent p-2 text-[#09122a]" onClick={submit}>
        {isSignup ? "Sign up" : "Sign in"}
      </button>
      <button
        className="mt-2 w-full rounded-lg bg-[#233064] p-2"
        onClick={() => setIsSignup((v) => !v)}
      >
        {isSignup ? "Already have an account" : "Need an account"}
      </button>
      {msg && <p className="mt-3 text-sm text-[#ffbdc4]">{msg}</p>}
    </section>
  );
}
