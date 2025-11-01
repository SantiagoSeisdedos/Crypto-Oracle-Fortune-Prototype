// Chain configuration and logo management with caching
// Combines chain configs and logos with API response caching

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  logo?: string; // Optional logo URL (can be populated from API)
}

// Chain configurations for token balance fetching
export const CHAINS: Record<number, ChainConfig> = {
  // ZetaChain Testnet
  7001: {
    id: 7001,
    name: "ZetaChain Testnet",
    rpcUrl: "https://zetachain-testnet.rpc.thirdweb.com",
    explorerUrl: "https://zetachain-testnet.explorer.thirdweb.com",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zetachain/info/logo.png",
  },
  // Base Sepolia Testnet
  84532: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorerUrl: "https://sepolia-explorer.base.org",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png",
  },
  // Ethereum Sepolia Testnet
  11155111: {
    id: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    explorerUrl: "https://sepolia.etherscan.io",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/sepolia/info/logo.png",
  },
  // Ethereum Mainnet
  1: {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://ethereum.rpc.thirdweb.com",
    explorerUrl: "https://etherscan.io",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
  },
  // Base Mainnet
  8453: {
    id: 8453,
    name: "Base Mainnet",
    rpcUrl: "https://base.rpc.thirdweb.com",
    explorerUrl: "https://basescan.org",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png",
  },
  // Optimism Mainnet
  10: {
    id: 10,
    name: "Optimism Mainnet",
    rpcUrl: "https://optimism.rpc.thirdweb.com",
    explorerUrl: "https://optimistic.etherscan.io",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png",
  },
  // Polygon Mainnet
  137: {
    id: 137,
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon.rpc.thirdweb.com",
    explorerUrl: "https://polygonscan.com",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
  },
  // Arbitrum One
  42161: {
    id: 42161,
    name: "Arbitrum One",
    rpcUrl: "https://arbitrum.rpc.thirdweb.com",
    explorerUrl: "https://arbiscan.io",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
  },
  // Avalanche Mainnet
  43114: {
    id: 43114,
    name: "Avalanche Mainnet",
    rpcUrl: "https://avalanche.rpc.thirdweb.com",
    explorerUrl: "https://snowtrace.io",
    logo: "https://icons.llama.fi/avalanche.png",
  },
  // Zora Mainnet
  7777777: {
    id: 7777777,
    name: "Zora Mainnet",
    rpcUrl: "https://zora.rpc.thirdweb.com",
    explorerUrl: "https://zora.scans.io",
    logo: "https://icons.llama.fi/zora.jpg",
  },
  // ZkSync Mainnet
  324: {
    id: 324,
    name: "ZkSync Mainnet",
    rpcUrl: "https://zksync.rpc.thirdweb.com",
    explorerUrl: "https://zkscan.io",
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/zksync/info/logo.png",
  },
};

// Cache for API-fetched logos/metadata (stored in memory + localStorage)
interface ChainMetadataCache {
  logo?: string;
  lastFetched?: number;
}

const CHAIN_METADATA_CACHE_KEY = "chain-metadata-cache";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory cache (faster access)
let metadataCache: Map<number, ChainMetadataCache> = new Map();

// Load cache from localStorage on initialization
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(CHAIN_METADATA_CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, ChainMetadataCache>;
      metadataCache = new Map(
        Object.entries(parsed).map(([key, value]) => [Number(key), value])
      );
    }
  } catch (error) {
    // Silently fail - cache loading failures are non-critical
  }
}

/**
 * Save cache to localStorage
 */
function saveCache() {
  if (typeof window === "undefined") return;
  try {
    const cacheObj = Object.fromEntries(metadataCache);
    localStorage.setItem(CHAIN_METADATA_CACHE_KEY, JSON.stringify(cacheObj));
  } catch (error) {
    // Silently fail - cache saving failures are non-critical
  }
}

/**
 * Get chain config by ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return CHAINS[chainId];
}

/**
 * Get chain logo URL, with caching support
 * First checks hardcoded logo, then checks cache, then can fetch from API
 */
export function getChainLogo(chainId: number): string | undefined {
  // 1. Check hardcoded logo first
  const chainConfig = CHAINS[chainId];
  if (chainConfig?.logo) {
    return chainConfig.logo;
  }

  // 2. Check cache
  const cached = metadataCache.get(chainId);
  if (cached?.logo) {
    const age = Date.now() - (cached.lastFetched || 0);
    // Use cached logo if it's not expired
    if (age < CACHE_EXPIRY_MS) {
      return cached.logo;
    }
  }

  // 3. Return undefined (caller can fetch from API if needed)
  return undefined;
}

/**
 * Set chain logo from API response (with caching)
 */
export function setChainLogo(chainId: number, logo: string): void {
  metadataCache.set(chainId, {
    logo,
    lastFetched: Date.now(),
  });
  saveCache();

  // Also update the chain config if it exists
  const chainConfig = CHAINS[chainId];
  if (chainConfig) {
    chainConfig.logo = logo;
  }
}

/**
 * Get all unique chain IDs from tokens
 */
export function getUniqueChainIds(
  tokens: Array<{ chainId: number }>
): number[] {
  const chainIds = new Set<number>();
  tokens.forEach((token) => {
    chainIds.add(token.chainId);
  });
  return Array.from(chainIds).sort((a, b) => a - b);
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  for (const [chainId, cache] of metadataCache.entries()) {
    if (cache.lastFetched && now - cache.lastFetched > CACHE_EXPIRY_MS) {
      metadataCache.delete(chainId);
    }
  }
  saveCache();
}

// Clear expired cache on initialization
if (typeof window !== "undefined") {
  clearExpiredCache();
}
