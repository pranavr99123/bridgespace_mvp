import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, MAX_TOKENS, MODEL } from "@/lib/ai/client";
import { forgeRefereePrompt } from "@/lib/ai/prompts/forge-referee";
import { hasAnthropicEnv } from "@/lib/env";

const schema = z.object({
  turnContent: z.string().min(1),
  turnNumber: z.number().int().min(1).max(7),
  transcript: z.string(),
  signalModel: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!hasAnthropicEnv()) {
    return NextResponse.json({
      intervention_needed: false,
      intervention_type: null,
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
        content: forgeRefereePrompt(
          parsed.data.turnContent,
          parsed.data.turnNumber,
          parsed.data.transcript,
          parsed.data.signalModel,
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
