"use client";

import { useCallback, useState } from "react";
import { useChatStore } from "@/store/useChatStore";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

// Maximum AI responses per chat (includes the initial fortune message)
export const MAX_AI_MESSAGES_PER_CHAT = 5;
export const MAX_CHATS = 3;

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, getCurrentChat, getChatsCount } = useChatStore();

  const currentChat = getCurrentChat();
  // Count only AI/assistant messages (includes the fortune message)
  const aiMessageCount = currentChat?.chatHistory.filter(
    (msg) => msg.role === "assistant"
  ).length ?? 0;
  const chatCount = getChatsCount();

  // User can send messages if AI hasn't reached the limit
  // Each user message will generate an AI response, so we check if adding one would exceed the limit
  const canSendMessage = aiMessageCount < MAX_AI_MESSAGES_PER_CHAT;
  // Remaining AI responses (the fortune counts as 1, so if aiMessageCount is 1, remaining is 4)
  const remainingMessages = Math.max(0, MAX_AI_MESSAGES_PER_CHAT - aiMessageCount);

  // Get fortune and tokens from chat
  // Chats store their own fortune and tokens
  const fortune = currentChat?.fortune || "";
  const tokens = currentChat?.tokens || "";

  const sendMessage = useCallback(
    async (userMessage: string) => {
      // Check if we can add another AI response (current count + 1 for the upcoming response)
      const currentAiCount = currentChat?.chatHistory.filter(
        (msg) => msg.role === "assistant"
      ).length ?? 0;
      
      if (!currentChat || currentAiCount >= MAX_AI_MESSAGES_PER_CHAT) {
        throw new Error("Cannot send message: AI response limit reached or no chat active");
      }

      // If chat has no fortune/tokens but has messages, try to continue anyway
      // This allows users to chat even if fortune wasn't generated
      if (!fortune || !tokens) {
        // Only require fortune/tokens if chat is completely empty
        if (currentChat.chatHistory.length === 0) {
          throw new Error(
            "Please generate a fortune first. Connect your wallet and generate a fortune to start chatting."
          );
        }
      }

      setIsLoading(true);

      try {
        // Get conversation history before adding the new message
        const history = currentChat.chatHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        // Add user message
        addMessage(currentChat.id, {
          role: "user",
          content: userMessage,
          timestamp: Date.now(),
        });

        // Call chat API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: userMessage,
            fortune,
            tokens,
            history,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to get oracle response");
        }

        const data = await response.json();

        // Add assistant message
        addMessage(currentChat.id, {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        });
      } catch (error) {
        // Remove user message on error
        const updatedChat = getCurrentChat();
        if (updatedChat && updatedChat.chatHistory.length > 0) {
          updatedChat.chatHistory.pop();
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [canSendMessage, currentChat, addMessage, fortune, tokens, getCurrentChat]
  );

  return {
    sendMessage,
    isLoading,
    canSendMessage,
    remainingMessages,
    messageCount: aiMessageCount, // Return AI message count for clarity
    canCreateNewChat: chatCount < MAX_CHATS,
  };
}
