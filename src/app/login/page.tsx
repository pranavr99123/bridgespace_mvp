"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSafe } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";
import { LS_PARTNER_A } from "@/lib/partner-storage";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setMsg("Sign-in failed. Try again.");
    }
  }, [searchParams]);

  const signInWithGoogle = async () => {
    if (!hasSupabaseEnv()) {
      setMsg("Supabase is not configured.");
      return;
    }
    const supabase = createClientSafe();
    if (!supabase) return;
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/home`,
      },
    });
  };

  const submit = async () => {
    if (!hasSupabaseEnv()) {
      setMsg("Supabase is not configured. Use sign up on the home flow or local demo from the sign-up page.");
      return;
    }
    const supabase = createClientSafe();
    if (!supabase) return;
    setMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const meta = user?.user_metadata as Record<string, string | undefined> | undefined;
    const name = meta?.display_name || meta?.full_name || meta?.name || meta?.given_name;
    if (name) {
      try {
        localStorage.setItem(LS_PARTNER_A, name);
      } catch {
        /* ignore */
      }
    }
    const next = searchParams.get("next") || "/home";
    router.push(next);
    router.refresh();
  };

  const continueLocal = () => {
    try {
      localStorage.setItem("bridgespace-local-session", "1");
    } catch {
      /* ignore */
    }
    router.push("/home");
    router.refresh();
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-5 py-12">
    <section className="auth-card w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--panel)]/90 p-6 shadow-[0_20px_64px_rgba(0,0,0,0.14)] backdrop-blur-md">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Sign in to continue to your space.</p>

      {hasSupabaseEnv() && (
        <>
          <button
            type="button"
            className="mt-5 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 text-sm font-medium shadow-sm transition hover:border-[var(--accent)]/50"
            onClick={signInWithGoogle}
          >
            Continue with Google
          </button>
          <p className="my-4 text-center text-xs text-[var(--muted)]">or</p>
        </>
      )}

      <label className="text-xs text-[var(--muted)]">Email</label>
      <input
        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5"
        placeholder="you@email.com"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="mt-3 block text-xs text-[var(--muted)]">Password</label>
      <input
        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5"
        placeholder="••••••••"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        type="button"
        className="mt-5 w-full rounded-full bg-[var(--accent)] py-3 font-semibold text-white shadow-md transition hover:brightness-[1.06]"
        onClick={submit}
      >
        Sign in
      </button>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        New here?{" "}
        <Link href="/signup" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>

      {!hasSupabaseEnv() && (
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-[var(--input-border)] py-2.5 text-sm"
          onClick={continueLocal}
        >
          Continue without account (local demo)
        </button>
      )}

      <p className="mt-4 text-center text-xs">
        <Link href="/" className="text-[var(--muted)] underline-offset-2 hover:underline">
          ← Back to home
        </Link>
      </p>

      {msg && <p className="mt-3 text-sm text-[#ffbdc4]">{msg}</p>}
    </section>
    </div>
  );
}
