import { NextRequest, NextResponse } from "next/server";
import { openai, CHAT_PROMPT_TEMPLATE } from "@/lib/openaiClient";

export async function POST(request: NextRequest) {
  try {
    const { question, fortune, tokens, history } = await request.json();

    if (!question || !fortune || !tokens) {
      return NextResponse.json(
        { error: "Question, fortune, and tokens are required" },
        { status: 400 }
      );
    }

    // Format conversation history
    const historyText = history
      ?.map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "User" : "Oracle"}: ${msg.content}`
      )
      .join("\n") || "No previous conversation.";

    // Format the prompt
    const prompt = CHAT_PROMPT_TEMPLATE.replace("{FORTUNE}", fortune)
      .replace("{TOKENS}", tokens)
      .replace("{HISTORY}", historyText)
      .replace("{QUESTION}", question);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a BaZi-inspired crypto oracle. Answer questions about crypto destiny using symbolic language. Refer back to the original fortune. Never give financial advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error generating chat response:", error);
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

