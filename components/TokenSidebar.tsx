"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ChevronDown } from "lucide-react";
import { TokenList } from "@/components/TokenList";
import { Loader } from "@/components/Loader";
import { useAppStore } from "@/store/useAppStore";
import { useWallet } from "@/hooks/useWallet";
import { CHAINS, getUniqueChainIds, getChainLogo, isTestnet, isMainnet } from "@/lib/chains";

interface TokenSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TokenSidebar({ isOpen, onClose }: TokenSidebarProps) {
  const { tokens, error } = useAppStore();
  // Get isFetchingTokens from useWallet to show independent loader
  const { isConnected, isFetchingTokens } = useWallet();
  
  // Chain filter state
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null); // null = "all"
  const [showTestnet, setShowTestnet] = useState(false); // Default to hide testnet
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Get unique chain IDs from tokens
  const uniqueChainIds = useMemo(() => getUniqueChainIds(tokens), [tokens]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Get chain info for filter options
  const chainOptions = useMemo(() => {
    const options = [
      { chainId: null, name: "All Chains", logo: null },
      ...uniqueChainIds.map((chainId) => {
        const chainConfig = CHAINS[chainId];
        return {
          chainId,
          name: chainConfig?.name || `Chain ${chainId}`,
          logo: getChainLogo(chainId),
        };
      }),
    ];
    return options;
  }, [uniqueChainIds]);

  const selectedChain = chainOptions.find((opt) => opt.chainId === selectedChainId);
  
  // Filter tokens by mainnet/testnet and chain
  const filteredTokens = useMemo(() => {
    let filtered = tokens;
    
    // Filter by testnet/mainnet
    if (!showTestnet) {
      filtered = filtered.filter((t) => isMainnet(t.chainId));
    }
    
    // Filter by selected chain
    if (selectedChainId !== null) {
      filtered = filtered.filter((t) => t.chainId === selectedChainId);
    }
    
    return filtered;
  }, [tokens, showTestnet, selectedChainId]);

  // Calculate filtered token count
  const filteredTokenCount = useMemo(() => {
    return filteredTokens.length;
  }, [filteredTokens]);

  return (
    <>
      {/* Backdrop - Only on mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-sm bg-linear-to-b from-slate-950/80 to-slate-950/40 backdrop-blur-xl border-l border-purple-500/20 z-50 lg:relative lg:z-auto lg:translate-x-0 lg:shadow-none lg:h-full flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 bg-linear-to-b from-slate-950/80 to-slate-950/40 backdrop-blur-xl border-b border-purple-500/20 p-4 space-y-3 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="text-purple-400" size={20} />
                  <h2 className="text-lg font-bold text-purple-300">
                    Your Tokens
                  </h2>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X className="text-gray-400" size={20} />
                </motion.button>
              </div>

              {/* Testnet Toggle */}
              {isConnected && tokens.length > 0 && (
                <div className="flex items-center justify-between gap-2 bg-slate-800/50 border border-purple-500/30 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-gray-300">Show Testnet</span>
                  <button
                    onClick={() => setShowTestnet(!showTestnet)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      showTestnet ? "bg-purple-600" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        showTestnet ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Chain Filter */}
              {isConnected && tokens.length > 0 && uniqueChainIds.length > 0 && (
                <div className="relative" ref={filterRef}>
                  <motion.button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-between gap-2 bg-slate-800/50 border border-purple-500/30 rounded-lg px-3 py-2 hover:border-purple-500/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-2">
                      {selectedChain?.logo && (
                        <img
                          src={selectedChain.logo}
                          alt={selectedChain.name}
                          className="w-5 h-5 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <span className="text-sm font-medium text-purple-300">
                        {selectedChain?.name || "All Chains"}
                      </span>
                    </div>
                    <ChevronDown
                      className={`text-gray-400 transition-transform ${
                        isFilterOpen ? "rotate-180" : ""
                      }`}
                      size={16}
                    />
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {isFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-purple-500/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar"
                      >
                        {chainOptions.map((option) => (
                          <motion.button
                            key={option.chainId ?? "all"}
                            onClick={() => {
                              setSelectedChainId(option.chainId);
                              setIsFilterOpen(false);
                            }}
                            whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.1)" }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                              selectedChainId === option.chainId
                                ? "bg-purple-500/20 text-purple-300"
                                : "text-gray-300 hover:text-purple-300"
                            }`}
                          >
                            {option.logo && (
                              <img
                                src={option.logo}
                                alt={option.name}
                                className="w-4 h-4 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                            <span className="flex-1 text-left">{option.name}</span>
                            {selectedChainId === option.chainId && (
                              <div className="w-2 h-2 bg-purple-500 rounded-full" />
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-0">
              {!isConnected ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Wallet className="text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400 text-lg mb-2">
                    No wallet connected
                  </p>
                  <p className="text-gray-500 text-sm">
                    Connect your wallet to view your tokens
                  </p>
                </div>
              ) : isFetchingTokens ? (
                <div className="flex items-center justify-center h-full">
                  <Loader />
                </div>
              ) : error ? (
                <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
                  {error}
                </div>
              ) : filteredTokens.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Wallet className="text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400 text-lg mb-2">No tokens found</p>
                  <p className="text-gray-500 text-sm">
                    {!showTestnet && tokens.some(t => isTestnet(t.chainId))
                      ? "No mainnet tokens found. Try enabling testnet tokens."
                      : selectedChainId !== null
                      ? "No tokens found on this chain"
                      : "Your wallet might not have any tokens"}
                  </p>
                </div>
              ) : (
                <TokenList tokens={filteredTokens} selectedChainId={selectedChainId} />
              )}
            </div>

            {/* Footer */}
            {isConnected && tokens.length > 0 && (
              <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-xl border-t border-purple-500/20 p-4">
                <p className="text-xs text-gray-500 text-center">
                  {filteredTokenCount} token{filteredTokenCount !== 1 ? "s" : ""} found
                  {selectedChainId !== null && (
                    <span className="text-purple-400">
                      {" "}
                      on {selectedChain?.name}
                    </span>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
