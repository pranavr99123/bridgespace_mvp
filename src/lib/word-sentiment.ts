const HARSH_WORDS = [
  "never", "always", "ridiculous", "stupid", "dumb", "wrong", "crazy", "whatever", "obviously", "typical",
];
const HARSH_EXPLETIVES = [
  "fuck", "fucking", "shit", "asshole", "damn", "terrible", "annoying", "hate", "screw",
  "crap", "bullshit", "idiot", "worthless", "useless", "pathetic", "disgusting",
];
const LOVING_WORDS = ["love", "appreciate", "thank", "understand", "heard", "support", "care", "sorry", "together"];

export function hasHarshWords(text: string): boolean {
  const lower = text.toLowerCase();
  return HARSH_WORDS.some((w) => lower.includes(w));
}

export function hasHarshExpletives(text: string): boolean {
  const lower = text.toLowerCase();
  return HARSH_EXPLETIVES.some((w) => lower.includes(w));
}

export function hasHarshOrExpletiveLanguage(text: string): boolean {
  return hasHarshWords(text) || hasHarshExpletives(text);
}

export function hasLovingWords(text: string): boolean {
  const lower = text.toLowerCase();
  return LOVING_WORDS.some((w) => lower.includes(w));
}
