"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClientSafe } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";
import { AppProvider, useAppStore } from "@/lib/store";

const links = [
  { href: "/home", label: "Home" },
  { href: "/pulse", label: "Pulse" },
  { href: "/mirror", label: "Mirror" },
  { href: "/vault", label: "Vault" },
  { href: "/signal", label: "Signal" },
];

function PartnerAddModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { couple, setPartnerNames } = useAppStore();
  const [nameB, setNameB] = useState(couple.partnerBName === "Partner B" ? "" : couple.partnerBName);
  const [inviteEmail, setInviteEmail] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setNameB(couple.partnerBName === "Partner B" ? "" : couple.partnerBName);
    }
  }, [open, couple.partnerBName]);

  const save = async () => {
    const b = nameB.trim() || "Partner B";
    setPartnerNames(couple.partnerAName, b);
    if (inviteEmail.trim()) {
      setBusy(true);
      try {
        await fetch("/api/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: inviteEmail.trim(),
            inviterName: couple.partnerAName,
          }),
        });
      } finally {
        setBusy(false);
      }
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" role="dialog">
      <div className="card max-w-md w-full border-[var(--card-border)] bg-[var(--panel)] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Add your partner</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Save their name for when they join. Optionally send an email invite—they won’t appear in the top menu until you confirm they’ve joined (on Home).
        </p>
        <label className="mt-3 block text-xs text-[var(--muted)]">Partner name</label>
        <input
          className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2"
          placeholder="Their name"
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
        />
        <label className="mt-3 block text-xs text-[var(--muted)]">Invite by email (optional)</label>
        <input
          className="mt-1 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-2"
          placeholder="partner@email.com"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <div className="mt-4 flex gap-2 justify-end">
          <button type="button" className="rounded-full bg-[var(--panel-soft)] px-3 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:brightness-[1.06]"
            disabled={busy}
            onClick={save}
          >
            {busy ? "Sending…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  const { couple, partnerBJoinedConfirmed } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);

  const showPartnerPlus = !partnerBJoinedConfirmed;

  const onLogout = async () => {
    try {
      try {
        localStorage.removeItem("bridgespace-local-session");
      } catch {
        /* ignore */
      }
      if (hasSupabaseEnv()) {
        const supabase = createClientSafe();
        await supabase?.auth.signOut();
      }
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <>
      <header
        className="border-b bg-[var(--header-bg)] shadow-[0_6px_28px_rgba(0,0,0,0.1)]"
        style={{ borderColor: "var(--header-border)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-pink)] bg-clip-text text-sm font-bold tracking-wide text-transparent">
              Bridgespace
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-[var(--muted)]">
              <span className="font-medium text-[var(--foreground)]">{couple.partnerAName}</span>
              {showPartnerPlus && (
                <button
                  type="button"
                  className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--panel-soft)] text-[var(--accent)] hover:bg-[var(--panel)] hover:ring-1 hover:ring-[var(--accent)]/35"
                  title="Add or invite partner"
                  aria-label="Add or invite partner"
                  onClick={() => setAddOpen(true)}
                >
                  +
                </button>
              )}
              {partnerBJoinedConfirmed && (
                <>
                  <span className="mx-1 text-[var(--muted)]">·</span>
                  <span className="font-medium text-[var(--foreground)]">{couple.partnerBName}</span>
                </>
              )}
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "bg-[var(--panel-soft)] text-[var(--foreground)] hover:ring-1 hover:ring-[var(--accent)]/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith("/settings")
                  ? "bg-[var(--accent-2)] text-white shadow-sm"
                  : "bg-[var(--panel-soft)] text-[var(--foreground)] hover:ring-1 hover:ring-[var(--accent)]/40"
              }`}
            >
              Settings
            </Link>
          </nav>
          <button
            className="rounded-full border border-[var(--card-border)] bg-[var(--panel-soft)] px-3 py-2 text-xs font-medium"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>
      <PartnerAddModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideHeader = pathname === "/login" || pathname === "/signup" || pathname === "/";

  return (
    <>
      {!hideHeader && <Header />}
      <main
        className={`mx-auto w-full max-w-6xl flex-1 px-5 py-6 ${hideHeader ? "max-w-none px-0 py-0" : ""}`}
      >
        {children}
      </main>
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppProvider>
  );
}
