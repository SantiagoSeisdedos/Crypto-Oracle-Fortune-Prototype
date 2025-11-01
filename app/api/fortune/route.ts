import { NextRequest, NextResponse } from "next/server";
import { openai, FORTUNE_PROMPT_TEMPLATE } from "@/lib/openaiClient";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { tokens } = await request.json();

    if (!tokens) {
      return NextResponse.json(
        { error: "Tokens are required" },
        { status: 400 }
      );
    }

    // Format the prompt with user's tokens
    const prompt = FORTUNE_PROMPT_TEMPLATE.replace("{TOKENS}", tokens);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o-mini for cost efficiency
      messages: [
        {
          role: "system",
          content:
            "You are a BaZi-inspired crypto oracle. Create mystical, poetic fortunes based on crypto wallet data. Never give financial advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9,
      max_tokens: 400,
    });

    const fortune = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ fortune });
  } catch (error) {
    logger.error("Error generating fortune:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate fortune",
      },
      { status: 500 }
    );
  }
}
