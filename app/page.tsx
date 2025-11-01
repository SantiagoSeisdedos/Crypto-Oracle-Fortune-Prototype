"use client";

import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TokenList } from "@/components/TokenList";
import { FortuneCard } from "@/components/FortuneCard";
import { ChatBox } from "@/components/ChatBox";
import { ChatList } from "@/components/ChatList";
import { useWallet } from "@/hooks/useWallet";
import { useFortune } from "@/hooks/useFortune";
import { useAppStore } from "@/store/useAppStore";
import { useChatStore } from "@/store/useChatStore";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function Home() {
  const { isConnected } = useWallet();
  const { generateFortune, isGenerating } = useFortune();
  const { tokens, fortune, isLoading, error } = useAppStore();
  const { loadChats, currentChatId, getCurrentChat } = useChatStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Get current chat's fortune for display
  const currentChat = getCurrentChat();
  const displayFortune = currentChat?.fortune || fortune;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8 lg:p-24">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Crypto Oracle Fortune
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Connect your wallet to discover your crypto destiny...
          </p>
          <div className="flex justify-center mb-8">
            <WalletConnectButton />
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-8 text-center text-red-300"
          >
            {error}
          </motion.div>
        )}

        {/* Main Content */}
        {isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-8"
          >
            {/* Token List */}
            {tokens.length > 0 && <TokenList tokens={tokens} />}

            {/* Generate Fortune Button */}
            {tokens.length > 0 && !fortune && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center"
              >
                <button
                  onClick={generateFortune}
                  disabled={isGenerating || isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  {isGenerating || isLoading ? (
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
                    "🔮 Generate Your Fortune"
                  )}
                </button>
              </motion.div>
            )}

            {/* Loading State */}
            {(isGenerating || isLoading) && !fortune && (
              <div className="text-center">
                <motion.div
                  className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-gray-400 mt-4">
                  The oracle is reading your crypto destiny...
                </p>
              </div>
            )}

            {/* Fortune Card */}
            {displayFortune && (
              <>
                <FortuneCard fortune={displayFortune} />
                <ChatList />
                <ChatBox />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center text-gray-400 mt-12"
          >
            <p className="text-xl">
              Connect your wallet to begin your journey...
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
