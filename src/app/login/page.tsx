"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSafe } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerInviteEmail, setPartnerInviteEmail] = useState("");
  const [yourName, setYourName] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setMsg("Sign-in failed. Try again.");
    }
  }, [searchParams]);

  const sendPartnerInvite = async (inviterEmail: string) => {
    if (!partnerInviteEmail.trim()) return;
    try {
      await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: partnerInviteEmail.trim(),
          fromEmail: inviterEmail,
          inviterName: yourName.trim() || "Your partner",
        }),
      });
    } catch {
      /* optional */
    }
  };

  const afterAuth = async (userEmail: string) => {
    if (yourName.trim()) {
      try {
        localStorage.setItem("bridgespace-partner-a", yourName.trim());
      } catch {
        /* ignore */
      }
    }
    await sendPartnerInvite(userEmail);
    const next = searchParams.get("next") || "/home";
    router.push(next);
    router.refresh();
  };

  const submitEmailAuth = async () => {
    if (!hasSupabaseEnv()) {
      setMsg("Supabase is not configured. Use “Continue without account” below.");
      return;
    }
    const supabase = createClientSafe();
    if (!supabase) return;
    setMsg("");
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: yourName.trim(),
            invited_partner_email: partnerInviteEmail.trim() || null,
          },
        },
      });
      if (error) {
        setMsg(error.message);
        return;
      }
      if (data.user) await afterAuth(email);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMsg(error.message);
        return;
      }
      await afterAuth(email);
    }
  };

  const signInWithGoogle = async () => {
    if (!hasSupabaseEnv()) {
      setMsg("Supabase is not configured.");
      return;
    }
    const supabase = createClientSafe();
    if (!supabase) return;
    if (partnerInviteEmail.trim()) {
      try {
        sessionStorage.setItem("bridgespace-pending-invite", partnerInviteEmail.trim());
      } catch {
        /* ignore */
      }
    }
    if (yourName.trim()) {
      try {
        sessionStorage.setItem("bridgespace-pending-name", yourName.trim());
      } catch {
        /* ignore */
      }
    }
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=/home`,
      },
    });
  };

  const continueLocal = () => {
    try {
      localStorage.setItem("bridgespace-local-session", "1");
      if (yourName.trim()) localStorage.setItem("bridgespace-partner-a", yourName.trim());
    } catch {
      /* ignore */
    }
    router.push("/home");
    router.refresh();
  };

  return (
    <section className="mx-auto w-full max-w-md card p-6">
      <h1 className="text-2xl font-semibold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-1 text-sm subtle">
        {mode === "signup"
          ? "Sign up with Google or email, then invite your partner."
          : "Sign in to continue."}
      </p>

      {hasSupabaseEnv() && (
        <>
          <button
            type="button"
            className="mt-5 w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] py-2.5 text-sm font-medium"
            onClick={signInWithGoogle}
          >
            Continue with Google
          </button>
          <p className="my-4 text-center text-xs subtle">or</p>
        </>
      )}

      <label className="text-xs subtle">Your name (shown as Partner A)</label>
      <input
        className="mt-1 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
        placeholder="e.g. Alex"
        value={yourName}
        onChange={(e) => setYourName(e.target.value)}
      />

      <label className="mt-3 block text-xs subtle">Email</label>
      <input
        className="mt-1 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
        placeholder="you@email.com"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label className="mt-3 block text-xs subtle">Password</label>
      <input
        className="mt-1 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
        placeholder="••••••••"
        type="password"
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {mode === "signup" && (
        <>
          <label className="mt-3 block text-xs subtle">Invite partner (optional)</label>
          <input
            className="mt-1 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
            placeholder="Partner’s email — we’ll send them an invite"
            type="email"
            value={partnerInviteEmail}
            onChange={(e) => setPartnerInviteEmail(e.target.value)}
          />
          <p className="mt-1 text-xs subtle">You can add or invite them later from Home if you skip this.</p>
        </>
      )}

      <button
        type="button"
        className="mt-4 w-full rounded-lg bg-accent py-2.5 font-medium text-[#09122a]"
        onClick={submitEmailAuth}
      >
        {mode === "signup" ? "Create account" : "Sign in"}
      </button>

      <button
        type="button"
        className="mt-2 w-full rounded-lg bg-[#233064] py-2 text-sm"
        onClick={() => {
          setMode((m) => (m === "signup" ? "signin" : "signup"));
          setMsg("");
        }}
      >
        {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
      </button>

      {!hasSupabaseEnv() && (
        <button type="button" className="mt-4 w-full rounded-lg border border-[#34417a] py-2 text-sm" onClick={continueLocal}>
          Continue without account (local demo)
        </button>
      )}

      {msg && <p className="mt-3 text-sm text-[#ffbdc4]">{msg}</p>}
    </section>
  );
}
