"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/useChatStore";
import { useAppStore } from "@/store/useAppStore";
import { useFortune } from "@/hooks/useFortune";
import { useWallet } from "@/hooks/useWallet";
import { Check, Copy, Send, Plus } from "lucide-react";

export function ChatBox() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, isLoading, canSendMessage, remainingMessages } =
    useChat();
  const { getCurrentChat, canCreateChat } = useChatStore();
  const { tokens } = useAppStore();
  const { generateFortune, isGenerating } = useFortune();
  const { isFetchingTokens } = useWallet();
  const currentChat = getCurrentChat();

  // Check if chat has no messages (needs fortune)
  const hasNoMessages = !currentChat || currentChat.chatHistory.length === 0;

  // Fix hydration error - only render after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.chatHistory, isLoading]);

  useEffect(() => {
    setInput("");
    setError(null);
  }, [currentChat?.id]);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = "auto";

    // Calculate new height (min 1 line, max 6 lines or 150px)
    const lineHeight = 24; // Approximate line height in pixels
    const minHeight = lineHeight * 1 + 24; // 1 line + padding
    const maxHeight = 150; // Max height in pixels (approximately 6 lines)
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight
    );

    textarea.style.height = `${newHeight}px`;
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

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

  const handleCopyMessage = async (content: string, msgId: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const formatMessageTime = (timestamp: number): string => {
    if (!isMounted) {
      // Return consistent format during SSR
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    }

    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const isBlocked = !canSendMessage && !canCreateChat();

  // Helper to format date consistently
  const formatGroupDate = (timestamp: number): string => {
    if (!isMounted) {
      // Return ISO format during SSR for consistency
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;
    }
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Memoize groupedMessages to ensure consistency between server and client
  const groupedMessages =
    currentChat?.chatHistory.reduce((groups: any[], msg, idx) => {
      // Use existing timestamp or fallback to a fixed value during SSR to avoid hydration mismatch
      // Always use 0 during SSR to ensure consistent grouping
      const timestamp = msg.timestamp || 0;
      const dateKey =
        timestamp > 0 ? new Date(timestamp).setHours(0, 0, 0, 0) : 0; // Use start of day as key for grouping
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.dateKey !== dateKey) {
        groups.push({
          dateKey,
          dateTimestamp: timestamp,
          messages: [{ ...msg, id: idx, timestamp }],
        });
      } else {
        lastGroup.messages.push({ ...msg, id: idx, timestamp });
      }
      return groups;
    }, []) || [];

  // Use a static wrapper to avoid hydration mismatch
  // The motion.div will be applied only after mount
  const content = (
    <div className="bg-linear-to-br from-slate-900/40 via-purple-900/30 to-slate-900/40 border border-purple-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <h3 className="text-xl font-bold bg-linear-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Oracle Insight
          </h3>
        </div>
        {remainingMessages > 0 && (
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xs font-medium text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30"
          >
            {remainingMessages} AI response
            {remainingMessages !== 1 ? "s" : ""} left
          </motion.span>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-4 text-sm text-red-300 flex items-start gap-3"
          >
            <span className="text-lg mt-0.5">⚠️</span>
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Limit Reached Message */}
      <AnimatePresence>
        {isBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4 mb-4 text-sm text-amber-300 flex items-start gap-3"
          >
            <span className="text-lg mt-0.5">🔒</span>
            <span>
              {!canSendMessage
                ? "You've reached the message limit for this chat. Delete a chat to start a new one."
                : "You've reached the maximum number of chats. Delete an existing chat to create a new one."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages Container */}
      <div
        ref={messagesContainerRef}
        className="h-[400px] sm:h-[500px] overflow-y-auto mb-4 sm:mb-6 space-y-4 pr-3 custom-scrollbar"
      >
        {!currentChat || currentChat.chatHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="text-5xl mb-4">🔮</div>
            <>
              <p className="text-gray-300 text-lg font-medium mb-2">
                Begin Your Cosmic Conversation
              </p>
              <p className="text-gray-400 text-sm max-w-sm">
                Ask the oracle about your crypto destiny, market insights, or
                spiritual guidance aligned with your blockchain fortune.
              </p>
            </>
          </motion.div>
        ) : (
          <>
            {groupedMessages.map((group, groupIdx) => (
              <div key={groupIdx}>
                {groupIdx > 0 && (
                  <div className="flex items-center gap-3 my-4 px-2">
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent"></div>
                    <span className="text-xs text-gray-500 font-medium">
                      {formatGroupDate(group.dateTimestamp)}
                    </span>
                    <div className="flex-1 h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent"></div>
                  </div>
                )}

                <AnimatePresence>
                  {group.messages.map((msg: any) => (
                    <motion.div
                      key={msg.id}
                      initial={{
                        opacity: 0,
                        x: msg.role === "user" ? 20 : -20,
                        y: 10,
                      }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25,
                      }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      } gap-4 group my-4`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 relative ${
                          msg.role === "user"
                            ? "bg-linear-to-br from-purple-600 to-purple-700 text-white shadow-lg"
                            : "bg-linear-to-br from-blue-600/70 to-blue-700/70 text-blue-50 shadow-lg border border-blue-500/30"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
                          <span className="text-xs opacity-70 font-medium">
                            {formatMessageTime(msg.timestamp)}
                          </span>

                          {/* Copy button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleCopyMessage(msg.content, msg.id)
                            }
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
                            title="Copy message"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check size={16} className="text-green-300" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-start gap-2"
              >
                <div className="bg-linear-to-br from-blue-600/70 to-blue-700/70 rounded-2xl p-3 shadow-lg border border-blue-500/30">
                  <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-blue-300 rounded-full"
                        animate={{
                          scaleY: [0.5, 1, 0.5],
                          opacity: [0.6, 1, 0.6],
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.15,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      {hasNoMessages ? (
        // Show "Generate Your Fortune" button when chat has no messages
        <div className="w-full">
          <motion.button
            onClick={generateFortune}
            disabled={isGenerating || isFetchingTokens || tokens.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-bold text-base sm:text-lg transition-all transform shadow-lg flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                Generating Fortune...
              </span>
            ) : (
              <>
                <span>🔮</span>
                Generate Your Fortune
              </>
            )}
          </motion.button>
          {tokens.length === 0 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Connect your wallet and load tokens first
            </p>
          )}
        </div>
      ) : !canSendMessage ? (
        // Show "Start new conversation" button when message limit is reached
        <div className="text-center py-4">
          {canCreateChat() ? (
            <motion.button
              onClick={() => {
                // Only allow creating new chat if user has tokens loaded
                // This prevents creating empty chats without fortune
                if (tokens.length === 0) {
                  return;
                }
                // Create empty chat to start new conversation
                const { addChat } = useChatStore.getState();
                addChat();
              }}
              disabled={tokens.length === 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Start a new conversation
            </motion.button>
          ) : (
            <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4 text-amber-300 text-sm">
              <p className="font-medium mb-1">Maximum chats reached for MVP</p>
              <p className="text-amber-200/80">
                Delete existing chats to continue. This is a limitation for the
                MVP version.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your destiny..."
              className="w-full custom-scrollbar overflow-y-auto bg-slate-800/50 border border-purple-500/30 rounded-xl px-3 py-2 pr-12 sm:px-4 sm:py-3 sm:pr-14 focus:outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed resize-none transition-all text-sm sm:text-base leading-6"
              disabled={isLoading}
              style={{
                minHeight: "25px",
                maxHeight: "100px",
                height: "auto",
              }}
            />
            {/* Send button inside textarea */}
            <motion.button
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-2 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg transition-all shadow-lg flex items-center justify-center z-10"
              title="Send message"
            >
              <Send size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </form>
      )}

      {/* Footer hint - Hidden on mobile to save space */}
      {!canSendMessage && (
        <div className="text-xs text-gray-500 text-center mt-2 sm:mt-3 hidden sm:block">
          Press{" "}
          <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-gray-400">
            Enter
          </kbd>{" "}
          to send •{" "}
          <kbd className="px-2 py-1 bg-slate-800/50 border border-slate-600/50 rounded text-gray-400">
            Shift+Enter
          </kbd>{" "}
          for new line
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto" suppressHydrationWarning>
      {isMounted ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {content}
        </motion.div>
      ) : (
        content
      )}
    </div>
  );
}
