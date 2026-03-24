"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSafe } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";
import { LS_PARTNER_A } from "@/lib/partner-storage";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        localStorage.setItem(LS_PARTNER_A, yourName.trim());
      } catch {
        /* ignore */
      }
    }
    await sendPartnerInvite(userEmail);
    const next = searchParams.get("next") || "/home";
    router.push(next);
    router.refresh();
  };

  const submit = async () => {
    if (!hasSupabaseEnv()) {
      setMsg("Supabase is not configured. Use “Continue without account” below.");
      return;
    }
    const supabase = createClientSafe();
    if (!supabase) return;
    setMsg("");
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
      if (yourName.trim()) localStorage.setItem(LS_PARTNER_A, yourName.trim());
    } catch {
      /* ignore */
    }
    router.push("/home");
    router.refresh();
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-5 py-12">
    <section className="auth-card w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--panel)]/90 p-6 shadow-[0_20px_64px_rgba(0,0,0,0.14)] backdrop-blur-md">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Sign up with Google or email. Invite your partner when you’re ready.</p>

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

      <label className="text-xs text-[var(--muted)]">Your name</label>
      <input
        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5"
        placeholder="e.g. Alex"
        value={yourName}
        onChange={(e) => setYourName(e.target.value)}
      />

      <label className="mt-3 block text-xs text-[var(--muted)]">Email</label>
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="mt-3 block text-xs text-[var(--muted)]">Invite partner (optional)</label>
      <input
        className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2.5"
        placeholder="Partner’s email — we’ll send them an invite"
        type="email"
        value={partnerInviteEmail}
        onChange={(e) => setPartnerInviteEmail(e.target.value)}
      />
      <p className="mt-1 text-xs text-[var(--muted)]">You can add them later if you want.</p>

      <button
        type="button"
        className="mt-5 w-full rounded-full bg-[var(--accent)] py-3 font-semibold text-white shadow-md transition hover:brightness-[1.06]"
        onClick={submit}
      >
        Create account
      </button>

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--accent)] underline-offset-2 hover:underline">
          Sign in
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
