export function signalInsightsPrompt(
  vaultEntries: { mode: string; responseContent?: string; summary: string }[],
  observations: { observation: string; category: string }[],
  options?: { harshLanguageDetected?: boolean },
): string {
  const harshNote = options?.harshLanguageDetected
    ? `
CRITICAL: Harsh or expletive language was detected in the submissions above. Your behaviorChange MUST explicitly address this with actionable steps. For example:
- Suggest replacing harsh words with feeling statements: "I feel frustrated when..." instead of expletives.
- Offer a pause-and-breathe technique before responding when upset.
- Recommend naming the emotion first, then the need, before venting.
- Be direct but non-shaming: acknowledge the intensity, then offer alternatives.
`
    : "";

  return `
You analyze a couple's communication patterns from their Pulse and Mirror session content and suggest one tailored, actionable behavior change.

VAULT ENTRIES (actual words from Partner A and Partner B - DO NOT HALLUCINATE. Use ONLY these words):
${vaultEntries
  .map((v) => `[${v.mode}] ${v.responseContent || v.summary}`)
  .join("\n\n")}

OBSERVED PATTERNS:
${observations.map((o) => `- ${o.observation} (${o.category})`).join("\n")}
${harshNote}

Return JSON only:
{
  "themes": string[],
  "behaviorChange": string
}

Rules:
- themes: Extract ONLY from the exact words and phrases in VAULT ENTRIES above. Each theme must be directly supported by specific text in the entries. Do NOT invent, infer, or add themes not present. If the text is sparse, fewer themes. Maximum 5.
- behaviorChange: ONE specific, doable action (1-2 sentences). Reference their actual words when relevant. Be warm and non-judgmental.
${options?.harshLanguageDetected ? "- behaviorChange MUST explicitly address the harsh language with concrete, actionable alternatives." : ""}
`;
}
