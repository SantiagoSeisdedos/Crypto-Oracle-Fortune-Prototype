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
  const { tokens, setError } = useAppStore();
  const { addChat, canCreateChat, getCurrentChat, updateChat } = useChatStore();

  const generateFortune = async () => {
    if (tokens.length === 0) {
      setError("Please connect your wallet and load tokens first.");
      return;
    }

    // Check if we can create a new chat or reuse current empty chat
    const currentChat = getCurrentChat();
    const canCreate = canCreateChat();
    
    // If current chat exists and has no messages, reuse it
    if (currentChat && currentChat.chatHistory.length === 0) {
      // Reuse existing empty chat
    } else if (!canCreate) {
      setError("Maximum number of chats reached. Please delete a chat to create a new one.");
      return;
    }

    setIsGenerating(true);
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

      // If current chat exists and is empty, update it instead of creating new one
      if (currentChat && currentChat.chatHistory.length === 0) {
        updateChat(currentChat.id, {
          fortune,
          tokens: tokenSummary,
          chatHistory: [
            {
              role: "assistant",
              content: fortune,
              timestamp: Date.now(),
            },
          ],
        });
      } else {
        // Create a new chat session with fortune as the first message
        // This will automatically add the fortune as the first assistant message
        addChat(fortune, tokenSummary);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to generate fortune"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateFortune,
    isGenerating,
  };
}

