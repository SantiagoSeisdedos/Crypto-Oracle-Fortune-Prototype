import { NextRequest, NextResponse } from "next/server";
import { generateFortune } from "@/lib/openaiClient";
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

    // Generate fortune using unified function (automatically selects OpenAI or Gemini)
    const fortune = await generateFortune(tokens);

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
