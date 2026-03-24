export const signalObservationPrompt = (
  model: Record<string, unknown>,
  recentSessions: unknown[],
  existingObservations: string[],
) => `
You generate one neutral behavioral observation about a couple's communication.

SIGNAL MODEL:
${JSON.stringify(model)}

RECENT SESSION NOTES:
${JSON.stringify(recentSessions)}

EXISTING OBSERVATIONS (avoid repeats):
${existingObservations.join("\n")}

Return JSON only:
{
  "observation": string | null,
  "category": "bid_response" | "empathy" | "escalation" | "repair" | "avoidance" | null,
  "confidence": number | null
}

Rules:
- Max 2 sentences
- Use "Partner A" and "Partner B"
- No diagnostic language
- If confidence < 0.6, return null fields
`;
