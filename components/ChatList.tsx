"use client";

import { motion } from "framer-motion";
import { useChatStore } from "@/store/useChatStore";
import { useEffect } from "react";

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function ChatList() {
  const { chats, currentChatId, selectChat, deleteChat, loadChats } =
    useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  if (chats.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl mx-auto mb-6"
    >
      <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-4 backdrop-blur-sm">
        <h4 className="text-sm font-semibold mb-3 text-gray-300">
          Your Chat Sessions ({chats.length}/3)
        </h4>
        <div className="flex flex-wrap gap-2">
          {chats.map((chat) => (
            <motion.button
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentChatId === chat.id
                  ? "bg-purple-600/50 border-2 border-purple-400"
                  : "bg-gray-800/50 border-2 border-transparent hover:border-purple-500/50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">{formatTimeAgo(chat.updatedAt)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="text-red-400 hover:text-red-300 ml-1 font-bold"
                  title="Delete chat"
                >
                  ×
                </button>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

