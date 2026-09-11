import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Prefer the higher-end model when available, but fall back to a stable model if the account
// does not have access to the 70B variant or the model ID is unavailable in the current environment.
const DEFAULT_MODEL = "llama-3.1-8b-instant";
const QUALITY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODELS = [QUALITY_MODEL, DEFAULT_MODEL];

interface CompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" | "text" };
}

export async function generateChatCompletion(
  messages: { role: "user" | "system" | "assistant"; content: string }[],
  options: CompletionOptions = {}
) {
  const requestedModel = options.model || QUALITY_MODEL;
  const modelCandidates = Array.from(new Set([requestedModel, ...FALLBACK_MODELS]));

  for (const model of modelCandidates) {
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1024,
        response_format: options.response_format,
      });

      return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
      const isModelUnavailable =
        error?.status === 404 ||
        error?.code === "model_not_found" ||
        error?.message?.includes("model_not_found") ||
        error?.message?.includes("not exist") ||
        error?.message?.includes("does not exist");

      const isRateLimit = error?.status === 429 || error?.message?.includes("rate_limit_exceeded");

      if (isModelUnavailable && model !== modelCandidates[modelCandidates.length - 1]) {
        console.warn(`Model ${model} is unavailable; retrying with fallback model.`);
        continue;
      }

      if (isRateLimit && model !== DEFAULT_MODEL) {
        console.warn(`Model ${model} hit a rate limit; retrying with ${DEFAULT_MODEL}.`);
        continue;
      }

      throw formatGroqError(error);
    }
  }

  throw new Error("No Groq model was available to process this request.");
}

function formatGroqError(error: any) {
  if (error?.status === 404 || error?.code === "model_not_found" || error?.message?.includes("model_not_found")) {
    return new Error("The selected Groq model is unavailable on this account. The app has automatically retried with a supported fallback model, or please contact support.");
  }

  if (error?.status === 429 || error?.message?.includes("rate_limit_exceeded")) {
    return new Error("The AI service is currently at daily capacity. Please try again tomorrow or contact support.");
  }

  return error;
}

export { QUALITY_MODEL, DEFAULT_MODEL };
