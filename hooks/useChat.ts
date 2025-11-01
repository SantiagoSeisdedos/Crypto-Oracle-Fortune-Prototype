"use client";

import { useState } from "react";
import { useChatStore } from "@/store/useChatStore";

/**
 * Hook to manage chat with AI oracle
 */
export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    getCurrentChat,
    addMessage,
    canSendMessage,
    getRemainingMessages,
  } = useChatStore();

  const sendMessage = async (message: string) => {
    const currentChat = getCurrentChat();
    if (!currentChat) {
      throw new Error("No active chat session");
    }

    if (!canSendMessage()) {
      throw new Error("Message limit reached for this chat");
    }

    setIsLoading(true);

    try {
      // Add user message to chat
      addMessage("user", message);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          fortune: currentChat.fortune,
          tokens: currentChat.tokens,
          history: currentChat.chatHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      addMessage("assistant", data.response);
    } catch (error) {
      // Remove user message on error
      const updatedChat = getCurrentChat();
      if (updatedChat) {
        updatedChat.chatHistory.pop();
        // Save updated chat without the failed message
        const { saveChatSession } = await import("@/lib/chatStorage");
        saveChatSession(updatedChat);
        useChatStore.getState().loadChats();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    canSendMessage: canSendMessage(),
    remainingMessages: getRemainingMessages(),
  };
}

