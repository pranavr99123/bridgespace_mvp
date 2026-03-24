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
    try {
      if (b !== "Partner B" || inviteEmail.trim()) localStorage.setItem("bridgespace-partner-b-linked", "1");
    } catch {
      /* ignore */
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4" role="dialog">
      <div className="card max-w-md p-5 w-full">
        <h2 className="text-lg font-semibold">Add your partner</h2>
        <p className="mt-1 text-sm subtle">Their name appears in the app. Optionally email them an invite.</p>
        <label className="mt-3 block text-xs subtle">Partner name</label>
        <input
          className="mt-1 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
          placeholder="Partner B name"
          value={nameB}
          onChange={(e) => setNameB(e.target.value)}
        />
        <label className="mt-3 block text-xs subtle">Invite by email (optional)</label>
        <input
          className="mt-1 w-full rounded-lg border border-[#34417a] bg-[#121a35] p-2"
          placeholder="partner@email.com"
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <div className="mt-4 flex gap-2 justify-end">
          <button type="button" className="rounded-lg bg-[#233064] px-3 py-2 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="rounded-lg bg-accent px-3 py-2 text-sm text-[#09122a]" disabled={busy} onClick={save}>
            {busy ? "Sending…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Header() {
  const pathname = usePathname();
  const { couple } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [showPartnerPlus, setShowPartnerPlus] = useState(false);

  useEffect(() => {
    try {
      const linked = localStorage.getItem("bridgespace-partner-b-linked") === "1";
      const defaultB = couple.partnerBName === "Partner B" || !couple.partnerBName.trim();
      setShowPartnerPlus(!linked && defaultB);
    } catch {
      setShowPartnerPlus(couple.partnerBName === "Partner B");
    }
  }, [couple.partnerBName]);

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
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <>
      <header className="border-b bg-[var(--header-bg)]" style={{ borderColor: "var(--header-border)" }}>
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-sm font-semibold tracking-wide text-accent">Bridgespace</p>
            <div className="mt-1 flex flex-wrap items-center gap-1 text-xs subtle">
              <span>{couple.partnerAName}</span>
              {showPartnerPlus && (
                <button
                  type="button"
                  className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/20 text-accent hover:bg-accent/30"
                  title="Add partner"
                  aria-label="Add partner"
                  onClick={() => setAddOpen(true)}
                >
                  +
                </button>
              )}
              <span className="mx-1">·</span>
              <span>{couple.partnerBName}</span>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    active ? "bg-accent text-white" : "bg-panel-soft text-[#c5d0f8] hover:bg-[#2d3a52]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/settings"
              className={`rounded-full px-3 py-1 text-sm transition ${
                pathname.startsWith("/settings")
                  ? "bg-accent text-white"
                  : "bg-panel-soft text-[#c5d0f8] hover:bg-[#2d3a52]"
              }`}
            >
              Settings
            </Link>
          </nav>
          <button className="rounded-full bg-[#2b386f] px-3 py-2 text-xs" onClick={onLogout}>
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
  const hideHeader = pathname === "/login";

  return (
    <>
      {!hideHeader && <Header />}
      <main className={`mx-auto w-full max-w-6xl flex-1 px-5 py-6 ${hideHeader ? "pt-10" : ""}`}>{children}</main>
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
