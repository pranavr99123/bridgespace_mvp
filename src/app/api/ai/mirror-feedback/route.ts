import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAnthropicClient, MAX_TOKENS, MODEL } from "@/lib/ai/client";
import { mirrorFeedbackPrompt } from "@/lib/ai/prompts/mirror-feedback";
import { hasAnthropicEnv } from "@/lib/env";

const schema = z.object({
  share: z.object({
    situation: z.string().min(1),
    emotion: z.string().min(1),
    need: z.string().min(1),
    coreMessage: z.string().min(1),
  }),
  reflection: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!hasAnthropicEnv()) {
    return NextResponse.json({
      captured_situation: true,
      captured_emotion: true,
      captured_need: false,
      captured_core_message: true,
      gentle_note:
        "The need was not named directly in the reflection. Try starting with 'What I hear you needing is...'",
      suggestions: [
        "Name the exact feeling word before adding your own perspective.",
        "Use 'I hear you needing X' before 'I felt Y' or offering solutions.",
        "Repeat back the situation in your own words before reflecting the emotion.",
      ],
      confidence: 0.65,
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
        content: mirrorFeedbackPrompt(parsed.data.share, parsed.data.reflection),
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
