import { NextRequest, NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/openaiClient";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { question, fortune, tokens, history } = await request.json();

    if (!question || !fortune || !tokens) {
      return NextResponse.json(
        { error: "Question, fortune, and tokens are required" },
        { status: 400 }
      );
    }

    // Generate chat response using unified function (automatically selects OpenAI or Gemini)
    const response = await generateChatResponse(question, fortune, tokens, history || []);

    return NextResponse.json({ response });
  } catch (error) {
    logger.error("Error generating chat response:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate response",
      },
      { status: 500 }
    );
  }
}
