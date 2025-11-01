"use client";

import { motion } from "framer-motion";

interface FortuneCardProps {
  fortune: string;
}

export function FortuneCard({ fortune }: FortuneCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mb-8"
    >
      <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-8 backdrop-blur-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Your Crypto Fortune
        </h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed whitespace-pre-line text-gray-100">
            {fortune}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

