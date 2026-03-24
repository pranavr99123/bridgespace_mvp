"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientSafe } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/env";

type Theme = "dark" | "light";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("dark");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    try {
      const t = localStorage.getItem("bridgespace-theme") as Theme | null;
      if (t === "light" || t === "dark") setTheme(t);
    } catch {
      /* ignore */
    }
  }, []);

  const applyTheme = (t: Theme) => {
    setTheme(t);
    try {
      localStorage.setItem("bridgespace-theme", t);
      document.documentElement.dataset.theme = t;
    } catch {
      /* ignore */
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
    setDeleteBusy(true);
    setMsg("");
    try {
      if (!hasSupabaseEnv()) {
        try {
          localStorage.clear();
        } catch {
          /* ignore */
        }
        router.push("/login");
        router.refresh();
        return;
      }
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || "Could not delete account.");
        setDeleteBusy(false);
        return;
      }
      const supabase = createClientSafe();
      await supabase?.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setDeleteBusy(false);
    }
  };

  return (
    <section className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm subtle">Appearance and account</p>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Theme</h2>
        <p className="mt-1 text-sm subtle">Choose light or dark mode.</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${theme === "dark" ? "bg-accent text-white" : "bg-[var(--panel-soft)]"}`}
            onClick={() => applyTheme("dark")}
          >
            Dark
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${theme === "light" ? "bg-accent text-white" : "bg-[var(--panel-soft)]"}`}
            onClick={() => applyTheme("light")}
          >
            Light
          </button>
        </div>
      </div>

      <div className="card border-l-4 border-[var(--danger)] p-5">
        <h2 className="font-semibold">Delete account</h2>
        <p className="mt-1 text-sm subtle">Removes your Bridgespace account and session.</p>
        <button
          type="button"
          className="mt-4 rounded-lg bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white"
          disabled={deleteBusy}
          onClick={deleteAccount}
        >
          {deleteBusy ? "Deleting…" : "Delete my account"}
        </button>
        {msg && <p className="mt-2 text-sm text-[#ffbdc4]">{msg}</p>}
      </div>
    </section>
  );
}
