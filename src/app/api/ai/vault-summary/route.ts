import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, MAX_TOKENS, MODEL } from "@/lib/ai/client";
import { hasAnthropicEnv } from "@/lib/env";

const schema = z.object({
  responseContent: z.string().min(1),
  mode: z.enum(["pulse", "mirror"]),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!hasAnthropicEnv()) {
    return NextResponse.json({
      summary: parsed.data.mode === "pulse"
        ? "A brief exchange between partners."
        : "A reflection on feelings and needs.",
      mocked: true,
    });
  }

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `Summarize this ${parsed.data.mode} session in 1-2 short sentences. Use only what was discussed. Be neutral and factual.\n\n${parsed.data.responseContent}\n\nReply with the summary only, no JSON.`,
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text.trim() : "";
  return NextResponse.json({ summary: text || "Session reflection." });
}
