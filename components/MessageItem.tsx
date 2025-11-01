"use client";

import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface MessageItemProps {
  content: string;
  role: "user" | "oracle";
  timestamp: number;
  index: number;
}

export function MessageItem({
  content,
  role,
  timestamp,
  index,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatTime = (ts: number): string => {
    const date = new Date(ts);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: role === "user" ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay: index * 0.05,
      }}
      className={`flex ${
        role === "user" ? "justify-end" : "justify-start"
      } gap-2 group`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 relative ${
          role === "user"
            ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg"
            : "bg-gradient-to-br from-blue-600/70 to-blue-700/70 text-blue-50 shadow-lg border border-blue-500/30"
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {content}
        </p>
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
          <span className="text-xs opacity-70 font-medium">
            {formatTime(timestamp)}
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-md"
            title="Copy message"
          >
            {copied ? (
              <Check size={16} className="text-green-300" />
            ) : (
              <Copy size={16} />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
