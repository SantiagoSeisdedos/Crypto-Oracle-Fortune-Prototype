/**
 * Alchemy API configuration
 * Maps chain IDs to their corresponding Alchemy base URLs
 */

export const ALCHEMY_BASE_URLS: Record<number, string> = {
  // Ethereum Mainnet
  1: "https://eth-mainnet.g.alchemy.com/v2/",
  // Ethereum Sepolia Testnet
  11155111: "https://eth-sepolia.g.alchemy.com/v2/",
  // Optimism Mainnet
  10: "https://opt-mainnet.g.alchemy.com/v2/",
  // Polygon Mainnet
  137: "https://polygon-mainnet.g.alchemy.com/v2/",
  // Arbitrum One Mainnet
  42161: "https://arb-mainnet.g.alchemy.com/v2/",
  // Base Mainnet (if supported)
  8453: "https://base-mainnet.g.alchemy.com/v2/",
  // Avalanche C-Chain Mainnet (if supported)
  43114: "https://avax-mainnet.g.alchemy.com/v2/",
} as const;

export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

/**
 * Get Alchemy base URL for a given chain ID
 */
export function getAlchemyBaseUrl(chainId: number): string | null {
  return ALCHEMY_BASE_URLS[chainId] || null;
}

/**
 * Check if Alchemy supports a given chain ID
 */
export function isAlchemySupported(chainId: number): boolean {
  return chainId in ALCHEMY_BASE_URLS;
}

/**
 * Alchemy API response types
 */
export interface AlchemyTokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export interface AlchemyTokenBalancesResponse {
  address: string;
  tokenBalances: AlchemyTokenBalance[];
}

export interface AlchemyTokenMetadata {
  decimals: number;
  logo: string | null;
  name: string;
  symbol: string;
}
