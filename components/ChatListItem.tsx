"use client";

import type React from "react";

import { motion } from "framer-motion";
import { Trash2, MessageSquare } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";

interface ChatListItemProps {
  chatId: string;
  title: string;
  isActive: boolean;
  onSelect: () => void;
}

export function ChatListItem({
  chatId,
  title,
  isActive,
  onSelect,
}: ChatListItemProps) {
  const { deleteChat } = useChatStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
  };

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 group cursor-pointer ${
        isActive
          ? "bg-purple-600/50 text-white border border-purple-500/50 shadow-lg"
          : "text-gray-400 hover:text-white hover:bg-slate-800/50"
      }`}
      title={title}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <MessageSquare size={16} className="flex-shrink-0" />
      <span className="truncate flex-1 font-medium">{title}</span>
      <motion.button
        onClick={handleDelete}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-500/20 rounded-md flex-shrink-0"
        title="Delete chat"
        aria-label="Delete chat"
      >
        <Trash2 size={16} className="text-red-400" />
      </motion.button>
    </motion.div>
  );
}
