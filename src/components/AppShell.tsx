"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppProvider } from "@/lib/store";

const links = [
  { href: "/home", label: "Home" },
  { href: "/pulse", label: "Pulse" },
  { href: "/mirror", label: "Mirror" },
  { href: "/vault", label: "Vault" },
  { href: "/signal", label: "Signal" },
];

function Header() {
  const pathname = usePathname();
  const onLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="border-b border-[#2d3a52] bg-[#1a2332]">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-accent">Bridgespace</p>
          <p className="text-xs subtle">Structured couple communication game</p>
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
        </nav>
        <button
          className="rounded-full bg-[#2b386f] px-3 py-2 text-xs"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6">{children}</main>
    </AppProvider>
  );
}
