/**
 * CoinGecko API utilities
 * Used as fallback for token metadata (logos, prices, etc.)
 */

import { logger } from "./logger";

export interface CoinGeckoTokenMetadata {
  id?: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  total_volume?: number;
}

/**
 * Search for token on CoinGecko by contract address and chain
 */
export async function getCoinGeckoTokenMetadata(
  contractAddress: string,
  chainId: number
): Promise<CoinGeckoTokenMetadata | null> {
  try {
    // Map chain IDs to CoinGecko platform IDs
    const platformMap: Record<number, string> = {
      1: "ethereum", // Ethereum Mainnet
      10: "optimistic-ethereum", // Optimism
      137: "polygon-pos", // Polygon
      42161: "arbitrum-one", // Arbitrum One
      8453: "base", // Base
      43114: "avalanche", // Avalanche
    };

    const platform = platformMap[chainId];
    if (!platform) {
      return null;
    }

    // CoinGecko API endpoint for token info
    const url = `https://api.coingecko.com/api/v3/coins/${platform}/contract/${contractAddress}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      // Add a reasonable timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      id: data.id,
      symbol: data.symbol?.toUpperCase() || "",
      name: data.name || "",
      image: data.image?.large || data.image?.small || undefined,
      current_price: data.market_data?.current_price?.usd,
      market_cap: data.market_data?.market_cap?.usd,
      total_volume: data.market_data?.total_volume?.usd,
    };
  } catch (error) {
    logger.error("CoinGecko API error:", error);
    return null;
  }
}

/**
 * Get token price from CoinGecko
 */
export async function getTokenPrice(
  contractAddress: string,
  chainId: number
): Promise<number | null> {
  const metadata = await getCoinGeckoTokenMetadata(contractAddress, chainId);
  return metadata?.current_price || null;
}
