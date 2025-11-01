/**
 * Li.Fi API for token metadata
 * Provides token information including symbol, name, decimals, price, and logo
 */

import { logger } from "./logger";

export interface LiFiToken {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  priceUSD: string;
  coinKey?: string;
  logoURI?: string;
}

export interface LiFiTokensResponse {
  tokens: Record<string, LiFiToken[]>;
  extended: boolean;
}

/**
 * Fetch all token metadata from Li.Fi for EVM chains
 * This is a single API call that returns metadata for all tokens across all supported chains
 */
export async function fetchLiFiTokenMetadata(): Promise<LiFiTokensResponse> {
  try {
    const response = await fetch("https://li.quest/v1/tokens?chainTypes=evm", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Li.Fi API error: ${response.status} ${response.statusText}`);
    }

    const data: LiFiTokensResponse = await response.json();
    return data;
  } catch (error) {
    logger.error("Error fetching Li.Fi token metadata:", error);
    throw error;
  }
}

/**
 * Find token metadata in Li.Fi response by chainId and address
 */
export function findLiFiTokenMetadata(
  lifiTokens: LiFiTokensResponse,
  chainId: number,
  address: string
): LiFiToken | null {
  const chainIdStr = chainId.toString();
  const chainTokens = lifiTokens.tokens[chainIdStr];

  if (!chainTokens || chainTokens.length === 0) {
    return null;
  }

  // Find token by address (case-insensitive)
  const token = chainTokens.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );

  return token || null;
}

/**
 * Find native token metadata for a chain (ETH, MATIC, etc.)
 * Native tokens typically have address "0x0000000000000000000000000000000000000000"
 */
export function findNativeTokenMetadata(
  lifiTokens: LiFiTokensResponse,
  chainId: number
): LiFiToken | null {
  return findLiFiTokenMetadata(
    lifiTokens,
    chainId,
    "0x0000000000000000000000000000000000000000"
  );
}

