import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (process.env.VERCEL || CRON_SECRET) {
    if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Bridgespace <onboarding@resend.dev>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (!url || !serviceRole) {
    return NextResponse.json({
      ok: false,
      message: "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  const admin = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profiles, error: profErr } = await admin
    .from("profiles")
    .select("id, couple_id")
    .not("couple_id", "is", null);

  if (profErr || !profiles?.length) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      note: profErr?.message || "no profiles with couple_id",
    });
  }

  const now = Date.now();
  const cadenceMs = (Number(process.env.REMINDER_CADENCE_DAYS) || 1) * 24 * 60 * 60 * 1000;

  let sent = 0;
  for (const row of profiles) {
    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(row.id);
    if (userErr || !userRes.user?.email) continue;
    const email = userRes.user.email;

    const { data: vaultRows } = await admin
      .from("vault_entries")
      .select("mode, created_at")
      .eq("couple_id", row.couple_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const lastPulse = vaultRows?.find((r) => r.mode === "pulse")?.created_at;
    const lastMirror = vaultRows?.find((r) => r.mode === "mirror")?.created_at;

    const needPulse = !lastPulse || now - new Date(lastPulse as string).getTime() > cadenceMs;
    const needMirror = !lastMirror || now - new Date(lastMirror as string).getTime() > cadenceMs;

    if (!needPulse && !needMirror) continue;

    if (!resendKey) {
      sent++;
      continue;
    }

    const parts: string[] = [];
    if (needPulse) parts.push("Pulse");
    if (needMirror) parts.push("Mirror");
    const subject = `Bridgespace: time for your ${parts.join(" & ")} check-in`;
    const html = `<p>Hi,</p><p>Your Bridgespace cadence suggests it’s time for a <strong>${parts.join("</strong> and <strong>")}</strong> check-in.</p>${appUrl ? `<p><a href="${appUrl}">Open Bridgespace</a></p>` : ""}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: email, subject, html }),
    });
    if (res.ok) sent++;
  }

  return NextResponse.json({ ok: true, sent });
}
