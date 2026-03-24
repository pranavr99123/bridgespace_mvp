import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, MAX_TOKENS, MODEL } from "@/lib/ai/client";
import { signalInsightsPrompt } from "@/lib/ai/prompts/signal-insights";
import { hasAnthropicEnv } from "@/lib/env";

const schema = z.object({
  vaultEntries: z.array(
    z.object({
      mode: z.string(),
      responseContent: z.string().optional(),
      summary: z.string(),
    })
  ),
  observations: z.array(
    z.object({
      observation: z.string(),
      category: z.string(),
    })
  ),
  harshLanguageDetected: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!hasAnthropicEnv()) {
    const behaviorChange = parsed.data.harshLanguageDetected
      ? "When frustration comes up, try pausing for one breath, then saying 'I feel frustrated when...' instead of stronger words. Name the feeling first, then the need."
      : "Before your next Mirror, try naming one exact feeling word before reflecting what you heard.";
    return NextResponse.json({
      themes: ["daily connection", "feeling heard", "emotional bids"],
      behaviorChange,
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
        content: signalInsightsPrompt(
          parsed.data.vaultEntries,
          parsed.data.observations,
          { harshLanguageDetected: parsed.data.harshLanguageDetected },
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
