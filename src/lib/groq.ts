import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default to the higher-limit 8B model for standard tasks
const DEFAULT_MODEL = "llama-3.1-8b-instant";
// Use the 70B model for more complex tasks requiring higher quality
const QUALITY_MODEL = "llama-3.3-70b-versatile";

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
  const primaryModel = options.model || DEFAULT_MODEL;

  try {
    // Attempt with the primary model
    const completion = await groq.chat.completions.create({
      messages,
      model: primaryModel,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      response_format: options.response_format,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    // If we hit a rate limit (429) or other token-related error and we weren't already using the fallback
    const isRateLimit = error?.status === 429 || error?.message?.includes("rate_limit_exceeded");
    
    if (isRateLimit && primaryModel !== DEFAULT_MODEL) {
      console.warn(`Primary model ${primaryModel} failed with rate limit, falling back to ${DEFAULT_MODEL}`);
      
      try {
        const fallbackCompletion = await groq.chat.completions.create({
          messages,
          model: DEFAULT_MODEL,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1024,
          response_format: options.response_format,
        });

        return fallbackCompletion.choices[0]?.message?.content || "";
      } catch (fallbackError: any) {
        console.error("Fallback model also failed:", fallbackError);
        throw formatGroqError(fallbackError);
      }
    }

    throw formatGroqError(error);
  }
}

function formatGroqError(error: any) {
  if (error?.status === 429 || error?.message?.includes("rate_limit_exceeded")) {
    return new Error("The AI service is currently at daily capacity. Please try again tomorrow or contact support.");
  }
  return error;
}

export { QUALITY_MODEL, DEFAULT_MODEL };
