import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  to: z.string().email(),
  fromEmail: z.string().email().optional(),
  inviterName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { to, fromEmail, inviterName } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "Bridgespace <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json({ ok: true, sent: false, reason: "RESEND_API_KEY not set" });
  }

  const subject = `${inviterName || "Your partner"} invited you to Bridgespace`;
  const html = `
    <p>Hi,</p>
    <p>${inviterName || "Someone"} (${fromEmail || "your partner"}) invited you to join them on <strong>Bridgespace</strong> — a space for daily connection (Pulse) and empathy practice (Mirror).</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://bridgespace.app"}">Open Bridgespace</a></p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sent: true });
}
