"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/useChatStore";

export function ChatBox() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { sendMessage, isLoading, canSendMessage, remainingMessages } = useChat();
  const { getCurrentChat, canCreateChat } = useChatStore();
  const currentChat = getCurrentChat();

  useEffect(() => {
    // Reset input when chat changes
    setInput("");
    setError(null);
  }, [currentChat?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !canSendMessage) return;

    const message = input.trim();
    setInput("");
    setError(null);

    try {
      await sendMessage(message);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  const isBlocked = !canSendMessage && !canCreateChat();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-center flex-1">Chat with the Oracle</h3>
          {remainingMessages > 0 && (
            <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
              {remainingMessages} messages left
            </span>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Limit Reached Message */}
        {isBlocked && (
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3 mb-4 text-sm text-yellow-300">
            {!canSendMessage
              ? "You've reached the message limit for this chat. Delete a chat to start a new one."
              : "You've reached the maximum number of chats. Delete an existing chat to create a new one."}
          </div>
        )}

        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto mb-4 space-y-4 custom-scrollbar pr-2">
          {!currentChat || currentChat.chatHistory.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              Ask the oracle about your crypto destiny...
            </div>
          ) : (
            currentChat.chatHistory.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-purple-600/30 text-right text-white"
                      : "bg-blue-600/30 text-left text-white"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-blue-600/30 rounded-lg p-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isBlocked
                ? "Limit reached..."
                : canSendMessage
                ? "Ask the oracle..."
                : "Message limit reached for this chat"
            }
            className="flex-1 bg-gray-800/50 border border-purple-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500 text-white placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !canSendMessage}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !canSendMessage}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-semibold transition-all"
          >
            Send
          </button>
        </form>
      </div>
    </motion.div>
  );
}

