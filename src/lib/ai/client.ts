import Anthropic from "@anthropic-ai/sdk";
import { hasAnthropicEnv } from "@/lib/env";

export const MODEL = "claude-sonnet-4-6";
export const MAX_TOKENS = 1024;

export function getAnthropicClient() {
  if (!hasAnthropicEnv()) {
    throw new Error("ANTHROPIC_API_KEY is missing.");
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}
