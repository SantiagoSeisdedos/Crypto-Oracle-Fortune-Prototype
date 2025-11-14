"use client";

import { useEffect, useState } from "react";
import { ChatBox } from "@/components/ChatBox";
import { ChatListItem } from "@/components/ChatListItem";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { TokenSidebar } from "@/components/TokenSidebar";
import { useChatStore } from "@/store/useChatStore";
import { useWallet } from "@/hooks/useWallet";
import { useFortune } from "@/hooks/useFortune";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";
import { Plus, Wallet } from "lucide-react";
import { WelcomeCTA } from "@/components/WelcomeCTA";
import { MAX_CHATS, MAX_AI_MESSAGES_PER_CHAT } from "@/hooks/useChat";

export default function Page() {
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    addChat,
    canCreateChat,
    loadChats,
    getCurrentChat,
  } = useChatStore();
  const [isTokenSidebarOpen, setIsTokenSidebarOpen] = useState(false);
  const { isConnected, isFetchingTokens } = useWallet();
  const { generateFortune, isGenerating } = useFortune();
  const { tokens, error } = useAppStore();

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Get current chat
  const currentChat = getCurrentChat();

  return (
    <main className="h-screen overflow-hidden bg-linear-to-br from-slate-950 via-purple-900 to-slate-950 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-linear-to-b from-slate-950/80 to-slate-950/40 backdrop-blur-xl border-b border-purple-500/20 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              🔮 Crypto Oracle
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Ask the oracle about crypto insights and blockchain destiny
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && (
              <motion.button
                onClick={() => setIsTokenSidebarOpen(!isTokenSidebarOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-all flex items-center gap-2 text-purple-300"
                aria-label="Toggle tokens sidebar"
              >
                <Wallet size={18} />
                <span className="hidden sm:inline text-sm font-medium">
                  Tokens
                </span>
              </motion.button>
            )}
            <div className={`${!isConnected ? "hidden" : "block"}`}>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Chat Sidebar - Left - Only show when wallet is connected */}
        {isConnected && (
          <div className="hidden lg:flex lg:flex-col lg:w-64 border-r border-purple-500/20 bg-slate-900/40 p-4 gap-4 overflow-y-auto">
            <div>
              <h2 className="text-lg font-bold text-purple-300 mb-3">
                Chat History
              </h2>
              <motion.button
                onClick={() => {
                  if (canCreateChat() && tokens.length > 0) {
                    // Only allow creating chat if tokens are loaded
                    // User should generate fortune first
                    addChat();
                  }
                }}
                disabled={!canCreateChat() || tokens.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                title="Create new chat"
              >
                <Plus size={18} />
                New Chat
              </motion.button>
            </div>

            {/* Chat List */}
            <div className="flex-1 space-y-2 overflow-y-auto">
              {chats.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No chats yet
                </p>
              ) : (
                chats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chatId={chat.id}
                    title={chat.title}
                    isActive={currentChatId === chat.id}
                    onSelect={() => setCurrentChatId(chat.id)}
                  />
                ))
              )}
            </div>

            {/* Sidebar Footer Info */}
            <div className="text-xs text-gray-500 border-t border-purple-500/20 pt-4 space-y-1">
              <p className="font-medium text-purple-400 mb-2">Limits:</p>
              <p>• {MAX_CHATS} chats max</p>
              <p>• {MAX_AI_MESSAGES_PER_CHAT} AI responses per chat</p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Welcome CTA - Show when wallet is not connected */}
            {!isConnected && <WelcomeCTA />}

            {/* Error Display - Only show when connected */}
            {isConnected && error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-center text-red-300"
              >
                {error}
              </motion.div>
            )}

            {/* Token Info - Show when no chat or chat has no messages, but hide the button (it's now in ChatBox) */}
            {isConnected &&
              tokens.length > 0 &&
              (!currentChat || currentChat.chatHistory.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <p className="text-gray-300 mb-4">
                    {tokens.length} token{tokens.length !== 1 ? "s" : ""} found
                    in your wallet
                  </p>
                </motion.div>
              )}

            {/* Loading State - Only show when generating fortune or fetching tokens, NOT when chatting */}
            {(isGenerating || isFetchingTokens) &&
              (!currentChat || currentChat.chatHistory.length === 0) && (
                <div className="text-center">
                  <p className="text-gray-400 mt-4">
                    {isFetchingTokens
                      ? "Loading your tokens..."
                      : isGenerating
                      ? "The oracle is reading your crypto destiny..."
                      : ""}
                  </p>
                </div>
              )}

            {/* Chat Box - Only show when wallet is connected and there's an active chat */}
            {isConnected && currentChat && <ChatBox />}

            {/* Mobile Chat List - Only show when wallet is connected */}
            {isConnected && (
              <div className="lg:hidden mt-8 pt-8 border-t border-purple-500/20">
                <h3 className="text-lg font-bold text-purple-300 mb-4">
                  Chat History
                </h3>
                <div className="space-y-2 mb-4">
                  {chats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chatId={chat.id}
                      title={chat.title}
                      isActive={currentChatId === chat.id}
                      onSelect={() => setCurrentChatId(chat.id)}
                    />
                  ))}
                </div>
                <motion.button
                  onClick={() => {
                    if (canCreateChat() && tokens.length > 0) {
                      // Only allow creating chat if tokens are loaded
                      // User should generate fortune first
                      addChat();
                    }
                  }}
                  disabled={!canCreateChat() || tokens.length === 0}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  title="Create new chat"
                >
                  <Plus size={18} />
                  New Chat
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Token Sidebar - Right (Desktop always visible when open) */}
        {isConnected && isTokenSidebarOpen && (
          <div className="hidden lg:flex">
            <TokenSidebar
              isOpen={true}
              onClose={() => setIsTokenSidebarOpen(false)}
            />
          </div>
        )}

        {/* Token Sidebar - Mobile (Slide-in) */}
        <div className="lg:hidden">
          <TokenSidebar
            isOpen={isTokenSidebarOpen}
            onClose={() => setIsTokenSidebarOpen(false)}
          />
        </div>
      </div>
    </main>
  );
}
