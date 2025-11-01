"use client";

import { useState } from "react";
import type { TokenData } from "@/lib/formatTokens";
import { formatUSD, formatCompactBalance } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_TOKEN_LOGO = "/images/token.jpg";

interface TokenListProps {
  tokens: TokenData[];
  selectedChainId?: number | null; // null = "all"
}

export function TokenList({ tokens, selectedChainId = null }: TokenListProps) {
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);


  // Filter tokens by selected chain if specified
  const filteredTokens =
    selectedChainId !== null
      ? tokens.filter((token) => token.chainId === selectedChainId)
      : tokens;


  // Sort by USD value (highest first), then by balance
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    if (b.usdValue && a.usdValue) {
      return b.usdValue - a.usdValue;
    }
    if (b.usdValue) return 1;
    if (a.usdValue) return -1;
    // If both have no USD value, sort by raw balance
    return Number(b.balanceRaw) > Number(a.balanceRaw) ? 1 : -1;
  });

  // Get font size class based on balance length
  const getFontSizeClass = (formattedBalance: string): string => {
    const length = formattedBalance.replace(/,/g, "").length;
    if (length > 12) {
      return "text-xs";
    } else if (length > 8) {
      return "text-sm";
    } else if (length > 6) {
      return "text-base";
    }
    return "text-lg";
  };

  if (sortedTokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-gray-400 text-lg mb-2">No tokens found</p>
        <p className="text-gray-500 text-sm">
          {selectedChainId !== null
            ? "No tokens found for this chain"
            : "No tokens found"}
        </p>
      </div>
    );
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col"
    >
      <div className="overflow-y-auto pr-2 py-2 custom-scrollbar flex-1 min-h-0">
        <div className="grid gap-4">
          {sortedTokens.map((token, index) => (
            <motion.div
              key={`${token.chainId}-${token.address}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg ml-4 px-2 sm:p-4 backdrop-blur-sm hover:border-purple-500/50 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={token.logo || FALLBACK_TOKEN_LOGO}
                      alt={token.symbol}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        // If the logo fails to load, use fallback
                        if (e.currentTarget.src !== FALLBACK_TOKEN_LOGO) {
                          e.currentTarget.src = FALLBACK_TOKEN_LOGO;
                        } else {
                          // If fallback also fails, hide the image
                          e.currentTarget.style.display = "none";
                        }
                      }}
                    />
                    {token.chainLogo && (
                      <img
                        src={token.chainLogo}
                        alt={token.chainName}
                        className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-purple-300">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{token.chainName}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="relative group">
                    <div
                      className={`font-semibold text-purple-300 break-all transition-all ${getFontSizeClass(
                        formatCompactBalance(token.balance)
                      )}`}
                      onMouseEnter={() =>
                        setHoveredTokenId(`${token.chainId}-${token.address}`)
                      }
                      onMouseLeave={() => setHoveredTokenId(null)}
                    >
                      {formatCompactBalance(token.balance)}
                    </div>
                    
                    {/* Tooltip with full balance */}
                    <AnimatePresence>
                      {hoveredTokenId === `${token.chainId}-${token.address}` && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 z-50 px-3 py-2 bg-slate-900 border border-purple-500/50 rounded-lg shadow-xl max-w-xs"
                        >
                          <div className="text-xs text-gray-300 font-mono break-all">
                            {token.balance}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {token.usdValue && (
                    <div className="text-sm text-gray-400">
                      {formatUSD(token.usdValue)}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
