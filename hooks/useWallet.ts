"use client";

import { useAccount, useChainId, useBalance, useSwitchChain } from "wagmi";
import { TokenData } from "@/lib/formatTokens";
import { CHAINS } from "@/lib/chains";
import { formatBalance } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState } from "react";
import { isAlchemySupported } from "@/lib/alchemy";

/**
 * Custom hook to manage wallet connection and fetch token balances
 */
export function useWallet() {
  const { address, isConnected, connector } = useAccount();
  const chainId = useChainId();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    chainId,
  });
  const { chains, switchChain } = useSwitchChain();
  const { setTokens, setLoading, setError } = useAppStore();
  const [isFetchingTokens, setIsFetchingTokens] = useState(false);

  // Fetch native token balance and ERC-20 tokens from Alchemy
  useEffect(() => {
    if (!isConnected || !address) {
      setTokens([]);
      return;
    }

    const fetchTokenBalances = async () => {
      setLoading(true);
      setError(null);
      setIsFetchingTokens(true);

      try {
        const chainConfig = CHAINS[chainId];
        if (!chainConfig) {
          console.warn(`Unknown chain ID: ${chainId}`);
          setTokens([]);
          return;
        }

        const allTokens: TokenData[] = [];

        // 1. Add native token balance
        if (balance) {
          const nativeToken: TokenData = {
            address: "native",
            symbol: balance.symbol || "ETH",
            name: balance.symbol || "Ethereum",
            balance: formatBalance(balance.value, balance.decimals),
            balanceRaw: balance.value,
            decimals: balance.decimals,
            chainId,
            chainName: chainConfig.name,
          };
          allTokens.push(nativeToken);
        }

        // 2. Fetch ERC-20 tokens from Alchemy if supported
        if (isAlchemySupported(chainId)) {
          try {
            const response = await fetch("/api/alchemy", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                address,
                chainId,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.tokens && Array.isArray(data.tokens)) {
                // Convert balanceRaw string back to BigInt
                const tokensWithBigInt = data.tokens.map((token: any) => ({
                  ...token,
                  balanceRaw: BigInt(token.balanceRaw || "0"),
                }));
                // Add ERC-20 tokens to the list
                allTokens.push(...tokensWithBigInt);
              }
            } else {
              const errorText = await response.text();
              console.error("Failed to fetch ERC-20 tokens:", errorText);
            }
          } catch (error) {
            console.error("Error fetching ERC-20 tokens:", error);
            // Don't fail completely, just log the error
            // User still has native token balance
          }
        }

        // Sort by USD value (highest first), then by balance
        allTokens.sort((a, b) => {
          if (b.usdValue && a.usdValue) {
            return b.usdValue - a.usdValue;
          }
          if (b.usdValue) return 1;
          if (a.usdValue) return -1;
          // If both have no USD value, sort by raw balance
          return Number(b.balanceRaw) > Number(a.balanceRaw) ? 1 : -1;
        });

        setTokens(allTokens);
      } catch (error) {
        console.error("Error fetching token balances:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch token balances"
        );
        // Still set tokens if we have native balance
        if (balance) {
          const chainConfig = CHAINS[chainId];
          if (chainConfig) {
            const nativeTokenData: TokenData = {
              address: "native",
              symbol: balance.symbol || "ETH",
              name: balance.symbol || "Ethereum",
              balance: formatBalance(balance.value, balance.decimals),
              balanceRaw: balance.value,
              decimals: balance.decimals,
              chainId,
              chainName: chainConfig.name,
            };
            setTokens([nativeTokenData]);
          }
        } else {
          setTokens([]);
        }
      } finally {
        setLoading(false);
        setIsFetchingTokens(false);
      }
    };

    fetchTokenBalances();
  }, [isConnected, address, balance, chainId, setTokens, setLoading, setError]);

  return {
    address,
    isConnected,
    chainId,
    balance,
    chains,
    switchChain,
    refetchBalance,
    isFetchingTokens,
  };
}
