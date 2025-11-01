"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useChatStore } from "@/store/useChatStore";
import { formatTokenSummary } from "@/lib/formatTokens";

/**
 * Hook to generate fortune from wallet tokens
 */
export function useFortune() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { tokens, setFortune, setError, setLoading } = useAppStore();
  const { createNewChat } = useChatStore();

  const generateFortune = async () => {
    if (tokens.length === 0) {
      setError("Please connect your wallet and load tokens first.");
      return;
    }

    setIsGenerating(true);
    setLoading(true);
    setError(null);

    try {
      const tokenSummary = formatTokenSummary(tokens);
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tokens: tokenSummary }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate fortune");
      }

      const data = await response.json();
      const fortune = data.fortune;
      setFortune(fortune);

      // Create a new chat session with this fortune
      createNewChat(fortune, tokenSummary);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to generate fortune"
      );
    } finally {
      setIsGenerating(false);
      setLoading(false);
    }
  };

  return {
    generateFortune,
    isGenerating,
  };
}

