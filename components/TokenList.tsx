"use client";

import { TokenData } from "@/lib/formatTokens";
import { formatUSD } from "@/lib/utils";
import { motion } from "framer-motion";

interface TokenListProps {
  tokens: TokenData[];
}

export function TokenList({ tokens }: TokenListProps) {
  if (tokens.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Your Top Tokens</h2>
      <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid gap-4">
          {tokens.slice(0, 10).map((token, index) => (
          <motion.div
            key={`${token.chainId}-${token.address}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {token.logo && (
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <div className="font-semibold text-lg">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{token.chainName}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">{token.balance}</div>
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

