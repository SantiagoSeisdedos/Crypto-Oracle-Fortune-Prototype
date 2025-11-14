import OpenAI from "openai";

// Initialize OpenAI client (only if API key is available)
export const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Initialize Gemini client lazily (server-side only)
let geminiClient: any = null;
function getGeminiClient() {
  if (typeof window !== "undefined") {
    return null; // Client-side, return null
  }
  
  if (geminiClient !== null) {
    return geminiClient; // Already initialized
  }

  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    // Dynamic require for server-side only
    const { GoogleGenAI } = require("@google/genai");
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return geminiClient;
  } catch (error) {
    console.warn("Failed to initialize Gemini client:", error);
    return null;
  }
}

export const gemini = getGeminiClient();

// Determine which AI provider to use
export function getAIProvider() {
  // Prefer OpenAI if available, otherwise use Gemini
  if (openai && process.env.OPENAI_API_KEY) {
    return "openai";
  }
  const geminiInstance = getGeminiClient();
  if (geminiInstance && process.env.GEMINI_API_KEY) {
    return "gemini";
  }
  throw new Error("No AI provider API key available");
}

// Fortune generation prompt template
export const FORTUNE_PROMPT_TEMPLATE = `You are a BaZi-inspired crypto oracle.
Interpret the user's wallet as if each token represents an element of destiny.
Create a symbolic, mystical "crypto fortune" that connects their top tokens to personal traits and cosmic forces.
Use dynamic, metaphysics-inspired and poetic responses, wise tone — no financial advice.

User's Top Tokens:
{TOKENS}

Generate a 2-3 paragraph fortune (max 200 words) that is mystical, metaphorical, and enlightening.`;

// Chat prompt template
export const CHAT_PROMPT_TEMPLATE = `Continue as the same Crypto Oracle.
Answer questions about the user's "crypto destiny" using symbolic language.
Refer back to the original fortune and tokens whenever possible.
Always keep a positive, enlightening tone — never give investment advice.

Original Fortune:
{FORTUNE}

User's Tokens:
{TOKENS}

Conversation History:
{HISTORY}

Generate a 2-3 paragraph response (max 200 words) that is mystical, metaphorical, and enlightening.

Answer the user's question: {QUESTION}`;

// Unified function to generate fortune
export async function generateFortune(tokens: string): Promise<string> {
  const prompt = FORTUNE_PROMPT_TEMPLATE.replace("{TOKENS}", tokens);
  const systemPrompt =
    "You are a BaZi-inspired crypto oracle. Create mystical, poetic fortunes based on crypto wallet data. Never give financial advice.";

  try {
    const provider = getAIProvider();

    if (provider === "openai" && openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 400,
      });
      return completion.choices[0]?.message?.content || "";
    }

    if (provider === "gemini") {
      const geminiInstance = getGeminiClient();
      if (geminiInstance) {
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;
        const result = await geminiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });
        // Handle different response structures
        if (result.text) return result.text;
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          return result.candidates[0].content.parts[0].text;
        }
        return "";
      }
    }
  } catch (error) {
    // Fallback to Gemini if OpenAI fails
    const geminiInstance = getGeminiClient();
    if (geminiInstance && process.env.GEMINI_API_KEY) {
      try {
        if (geminiInstance) {
          const systemPrompt =
            "You are a BaZi-inspired crypto oracle. Create mystical, poetic fortunes based on crypto wallet data. Never give financial advice.";
          const fullPrompt = `${systemPrompt}\n\n${prompt}`;
          const result = await geminiInstance.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          });
          // Handle different response structures
          if (result.text) return result.text;
          if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
          }
          return "";
        }
      } catch (fallbackError) {
        throw new Error(
          `Both AI providers failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
    throw error;
  }

  throw new Error("No AI provider available");
}

// Unified function to generate chat response
export async function generateChatResponse(
  question: string,
  fortune: string,
  tokens: string,
  history: Array<{ role: string; content: string }>
): Promise<string> {
  const historyText =
    history
      ?.map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "User" : "Oracle"}: ${msg.content}`
      )
      .join("\n") || "No previous conversation.";

  const prompt = CHAT_PROMPT_TEMPLATE.replace("{FORTUNE}", fortune)
    .replace("{TOKENS}", tokens)
    .replace("{HISTORY}", historyText)
    .replace("{QUESTION}", question);

  const systemPrompt =
    "You are a BaZi-inspired crypto oracle. Answer questions about crypto destiny using symbolic language. Refer back to the original fortune. Never give financial advice.";

  try {
    const provider = getAIProvider();

    if (provider === "openai" && openai) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 400,
      });
      return completion.choices[0]?.message?.content || "";
    }

    if (provider === "gemini") {
      const geminiInstance = getGeminiClient();
      if (geminiInstance) {
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;
        const result = await geminiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });
        // Handle different response structures
        if (result.text) return result.text;
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          return result.candidates[0].content.parts[0].text;
        }
        return "";
      }
    }
  } catch (error) {
    // Fallback to Gemini if OpenAI fails
    const geminiInstance = getGeminiClient();
    if (geminiInstance && process.env.GEMINI_API_KEY) {
      try {
        const fullPrompt = `${systemPrompt}\n\n${prompt}`;
        const result = await geminiInstance.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        });
        // Handle different response structures
        if (result.text) return result.text;
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
          return result.candidates[0].content.parts[0].text;
        }
        return "";
      } catch (fallbackError) {
        throw new Error(
          `Both AI providers failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
    throw error;
  }

  throw new Error("No AI provider available");
}
