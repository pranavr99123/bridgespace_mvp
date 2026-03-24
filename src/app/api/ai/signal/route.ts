import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, MAX_TOKENS, MODEL } from "@/lib/ai/client";
import { signalObservationPrompt } from "@/lib/ai/prompts/signal";
import { hasAnthropicEnv } from "@/lib/env";

const schema = z.object({
  model: z.record(z.string(), z.unknown()).default({}),
  recentSessions: z.array(z.unknown()).default([]),
  existingObservations: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!hasAnthropicEnv()) {
    return NextResponse.json({
      observation:
        "Partner A and Partner B both stay more engaged when sessions start with specific appreciation before requests.",
      category: "repair",
      confidence: 0.71,
      mocked: true,
    });
  }

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: signalObservationPrompt(
          parsed.data.model,
          parsed.data.recentSessions,
          parsed.data.existingObservations,
        ),
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: "AI parse error" }, { status: 502 });
  }
}
