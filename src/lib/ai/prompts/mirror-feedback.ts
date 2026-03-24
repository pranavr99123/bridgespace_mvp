export interface ShareData {
  situation: string;
  emotion: string;
  need: string;
  coreMessage: string;
}

export const mirrorFeedbackPrompt = (share: ShareData, reflection: string) => `
You are a neutral communication assistant for a couples app. Check whether the reflection captured emotional content.

SHARE:
Situation: ${share.situation}
Feeling(s): ${share.emotion}
Need: ${share.need}
Core message: ${share.coreMessage}

REFLECTION:
${reflection}

Respond ONLY with JSON:
{
  "captured_situation": boolean,
  "captured_emotion": boolean,
  "captured_need": boolean,
  "captured_core_message": boolean,
  "gentle_note": string | null,
  "suggestions": string[],
  "confidence": number
}

Rules:
- suggestions: 2-4 concrete, specific tips. Examples: "Name the exact feeling word Partner A used before adding your own." "Use 'I hear you needing X' before 'I felt Y'." "Repeat back the situation in your own words before reflecting the emotion."
- If something was missed, gentle_note explains what and suggestions include how to improve.
- Each suggestion is one short sentence, actionable.
- No diagnosis language and no blame framing.
`;
