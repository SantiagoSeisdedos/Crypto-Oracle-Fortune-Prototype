"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAccount, useChainId, useBalance, useSwitchChain } from "wagmi";
import { TokenData } from "@/lib/formatTokens";
import { CHAINS, getChainLogo, setChainLogo } from "@/lib/chains";
import { formatBalance } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

/**
 * Fetch native token metadata from Li.Fi (logo and USD price)
 */
async function fetchNativeTokenMetadata(chainId: number) {
  try {
    const response = await fetch(`/api/native-token-metadata?chainId=${chainId}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      logo: data.logo,
      priceUSD: data.priceUSD || 0,
    };
  } catch (error) {
    // Silently fail - we'll use token without metadata
    return null;
  }
}

/**
 * Enrich a native token with metadata from Li.Fi
 */
async function enrichNativeTokenWithMetadata(
  nativeToken: TokenData
): Promise<TokenData> {
  const metadata = await fetchNativeTokenMetadata(nativeToken.chainId);
  if (metadata) {
    // Cache the logo if we got it from API
    if (metadata.logo) {
      setChainLogo(nativeToken.chainId, metadata.logo);
    }
    
    return {
      ...nativeToken,
      logo: metadata.logo,
      usdValue: metadata.priceUSD
        ? (Number(nativeToken.balanceRaw) /
            Math.pow(10, nativeToken.decimals)) *
          metadata.priceUSD
        : undefined,
    };
  }
  return nativeToken;
}

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

  // Refs to prevent multiple simultaneous fetches and track current fetch
  const fetchingRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the fetch function to avoid recreating it on every render
  // Note: balance is not in dependencies to prevent re-fetching when balance updates
  // We get fresh balance inside the function when needed
  const fetchTokenBalances = useCallback(async () => {
    if (!isConnected || !address || chainId === undefined) {
      setTokens([], address, chainId);
      return;
    }

    // Create a unique key for this fetch (now just by address since we fetch all chains)
    const fetchKey = address.toLowerCase();

    // If already fetching this address, abort previous and start new
    if (fetchingRef.current === fetchKey) {
      // Abort previous fetch if still in progress
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    // Check cache first (now cached by address only, not chainId)
    // Try to get cached tokens for any chain (since we fetch all chains now)
    // We use chainId 0 as a convention for "all chains"
    let cachedTokens = useAppStore.getState().getCachedTokens(address, 0);
    
    // If no cache with chainId 0, try the current chainId for backwards compatibility
    if (!cachedTokens || cachedTokens.length === 0) {
      cachedTokens = useAppStore.getState().getCachedTokens(address, chainId);
    }
    
    if (cachedTokens && cachedTokens.length > 0) {
      // Ensure all cached tokens have chainLogo
      const allTokens = cachedTokens.map((token) => {
        // If token doesn't have chainLogo, set it
        if (!token.chainLogo && token.chainId) {
          const chainConfig = CHAINS[token.chainId];
          token.chainLogo = chainConfig?.logo || getChainLogo(token.chainId);
        }
        return token;
      });
      
      // Add native token of current chain to cached tokens
      const chainConfig = CHAINS[chainId];
      if (chainConfig && balance) {
        // Check if native token already exists in cache
        const nativeTokenExists = allTokens.some(
          (token) => token.address === "native" && token.chainId === chainId
        );
        
        if (!nativeTokenExists) {
          const nativeToken: TokenData = {
            address: "native",
            symbol: balance.symbol || "ETH",
            name: balance.symbol || "Ethereum",
            balance: formatBalance(balance.value, balance.decimals),
            balanceRaw: balance.value,
            decimals: balance.decimals,
            chainId,
            chainName: chainConfig.name,
            chainLogo: chainConfig.logo || getChainLogo(chainId), // Prefer chainConfig.logo, fallback to cache
          };
          // Enrich with Li.Fi metadata
          const enrichedToken = await enrichNativeTokenWithMetadata(nativeToken);
          allTokens.push(enrichedToken);
        }
      }
      setTokens(allTokens, address, 0); // Cache with chainId 0 for "all chains"
      setIsFetchingTokens(false);
      return;
    }

    // Mark as fetching
    fetchingRef.current = fetchKey;
    console.log(`🔄 Fetching tokens from all chains for address: ${address}`);

    // Create new AbortController for this fetch
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Not in cache, fetch from API
    setLoading(true);
    setError(null);
    setIsFetchingTokens(true);

    try {
      const chainConfig = CHAINS[chainId];
      if (!chainConfig) {
        console.warn(`Unknown chain ID: ${chainId}`);
        setTokens([], address, chainId);
        return;
      }

      const allTokens: TokenData[] = [];

      // 1. ALWAYS add native token balance from wagmi (PRIMARY SOURCE)
      // This ensures the app always has at least one token to display
      const currentBalance = balance;
      if (currentBalance) {
        const nativeToken: TokenData = {
          address: "native",
          symbol: currentBalance.symbol || "ETH",
          name: currentBalance.symbol || "Ethereum",
          balance: formatBalance(currentBalance.value, currentBalance.decimals),
          balanceRaw: currentBalance.value,
          decimals: currentBalance.decimals,
          chainId,
          chainName: chainConfig.name,
          chainLogo: chainConfig.logo || getChainLogo(chainId), // Prefer chainConfig.logo, fallback to cache
        };
        // Enrich with Li.Fi metadata
        const enrichedToken = await enrichNativeTokenWithMetadata(nativeToken);
        allTokens.push(enrichedToken);
      } else {
        // If balance is not yet loaded, try to refetch it
        try {
          const freshBalance = await refetchBalance();
          if (freshBalance?.data) {
            const nativeToken: TokenData = {
              address: "native",
              symbol: freshBalance.data.symbol || "ETH",
              name: freshBalance.data.symbol || "Ethereum",
              balance: formatBalance(
                freshBalance.data.value,
                freshBalance.data.decimals
              ),
              balanceRaw: freshBalance.data.value,
              decimals: freshBalance.data.decimals,
              chainId,
              chainName: chainConfig.name,
              chainLogo: chainConfig.logo || getChainLogo(chainId), // Prefer chainConfig.logo, fallback to cache
            };
            // Enrich with Li.Fi metadata
            const enrichedToken = await enrichNativeTokenWithMetadata(nativeToken);
            allTokens.push(enrichedToken);
          }
        } catch (error) {
          console.warn("Failed to fetch native balance:", error);
        }
      }

      // 2. Fetch ERC-20 tokens from ALL chains using the new /api/balances endpoint
      // This endpoint uses Li.Fi for metadata and Alchemy for balances across all chains
      try {
        const response = await fetch("/api/balances", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address,
          }),
          signal: abortController.signal,
        });

        if (response.ok && !abortController.signal.aborted) {
          const data = await response.json();
          if (
            data.tokens &&
            Array.isArray(data.tokens) &&
            data.tokens.length > 0
          ) {
            // Convert balanceRaw string back to BigInt
            // Also ensure chainLogo is present for all tokens
            const tokensWithBigInt = data.tokens.map((token: any) => {
              // Ensure chainLogo is set if missing
              if (!token.chainLogo && token.chainId) {
                const chainConfig = CHAINS[token.chainId];
                token.chainLogo = chainConfig?.logo || getChainLogo(token.chainId);
              }
              return {
                ...token,
                balanceRaw: BigInt(token.balanceRaw || "0"),
              };
            });
            // Add ERC-20 tokens from all chains to the list (only if not aborted)
            if (!abortController.signal.aborted) {
              allTokens.push(...tokensWithBigInt);
            }
          }
        } else if (!abortController.signal.aborted) {
          // Balances API failed, but we continue with native token
          if (response.status !== 429) {
            console.warn(
              "Balances API returned non-OK status:",
              response.status
            );
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Fetch was aborted, just return silently
          return;
        }
        // Balances API failed - this is okay, we still have native token
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Balances API fetch failed (continuing with native token only):",
            error
          );
        }
        // Continue without ERC-20 tokens - app still works with native token
      }

      // Only update if fetch wasn't aborted
      if (!abortController.signal.aborted) {
        // Ensure all tokens have chainLogo before saving
        const tokensWithChainLogo = allTokens.map((token) => {
          if (!token.chainLogo && token.chainId) {
            const chainConfig = CHAINS[token.chainId];
            token.chainLogo = chainConfig?.logo || getChainLogo(token.chainId);
          }
          return token;
        });
        
        // Sort by USD value (highest first), then by balance
        tokensWithChainLogo.sort((a, b) => {
          if (b.usdValue && a.usdValue) {
            return b.usdValue - a.usdValue;
          }
          if (b.usdValue) return 1;
          if (a.usdValue) return -1;
          // If both have no USD value, sort by raw balance
          return Number(b.balanceRaw) > Number(a.balanceRaw) ? 1 : -1;
        });

        // Save to cache (using address only, not chainId, since we fetch all chains)
        // Cache key is still address-chainId format for compatibility, but we use address-only logic
        setTokens(tokensWithChainLogo, address, 0); // Use 0 as placeholder since cache is address-based
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Fetch was aborted, just return silently
        return;
      }
      console.error("Error fetching token balances:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch token balances"
      );
      // Still set tokens if we have native balance
      const currentBalance = balance;
      if (currentBalance) {
        const chainConfig = CHAINS[chainId];
        if (chainConfig) {
          const nativeTokenData: TokenData = {
            address: "native",
            symbol: currentBalance.symbol || "ETH",
            name: currentBalance.symbol || "Ethereum",
            balance: formatBalance(
              currentBalance.value,
              currentBalance.decimals
            ),
            balanceRaw: currentBalance.value,
            decimals: currentBalance.decimals,
            chainId,
            chainName: chainConfig.name,
            chainLogo: chainConfig.logo || getChainLogo(chainId), // Prefer chainConfig.logo, fallback to cache
          };
          // Enrich with Li.Fi metadata
          const enrichedToken = await enrichNativeTokenWithMetadata(nativeTokenData);
          setTokens([enrichedToken], address, chainId);
        }
      } else {
        setTokens([], address, chainId);
      }
    } finally {
      // Only clear fetching flag if this is still the current fetch
      if (fetchingRef.current === fetchKey) {
        fetchingRef.current = null;
        abortControllerRef.current = null;
        setLoading(false);
        setIsFetchingTokens(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainId, setTokens, setLoading, setError]);
  // Note: balance is intentionally excluded to prevent re-fetching on balance updates

  // Fetch tokens when address or chainId changes, but not when balance changes
  useEffect(() => {
    fetchTokenBalances();
  }, [address, chainId, isConnected, fetchTokenBalances]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
