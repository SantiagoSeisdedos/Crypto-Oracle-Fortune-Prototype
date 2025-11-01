import { NextRequest, NextResponse } from "next/server";
import {
  getAlchemyBaseUrl,
  isAlchemySupported,
  type AlchemyTokenBalancesResponse,
  ALCHEMY_API_KEY,
} from "@/lib/alchemy";
import {
  fetchLiFiTokenMetadata,
  findLiFiTokenMetadata,
  findNativeTokenMetadata,
  type LiFiTokensResponse,
} from "@/lib/lifi";
import { TokenData } from "@/lib/formatTokens";
import { formatBalance } from "@/lib/utils";
import { CHAINS, getChainLogo } from "@/lib/chains";
import { ALCHEMY_BASE_URLS } from "@/lib/alchemy";

/**
 * Get chain logo for a chainId, with fallback logic
 * Ensures we always return a logo URL if available
 */
function getChainLogoForToken(chainId: number): string | undefined {
  const chainConfig = CHAINS[chainId];
  // First try chainConfig.logo (hardcoded)
  if (chainConfig?.logo) {
    return chainConfig.logo;
  }
  // Then try getChainLogo (checks cache)
  return getChainLogo(chainId);
}

/**
 * Check if token is spam based on name or symbol
 */
function isSpamToken(name: string, symbol: string): boolean {
  const nameLower = name?.toLowerCase() || "";
  const symbolLower = symbol?.toLowerCase() || "";

  const spamWords = [
    "claim",
    "claimable",
    "reward",
    "rewards",
    "visit",
    "http://",
    "https://",
    "t.me/",
    "t.ly/",
    ".org",
    ".com",
    ".io",
  ];

  return (
    spamWords.some((word) => nameLower.includes(word)) ||
    spamWords.some((word) => symbolLower.includes(word))
  );
}

/**
 * Convert hex string to BigInt
 */
function hexToBigInt(hex: string): bigint {
  return BigInt(hex);
}

/**
 * Fetch token balances from Alchemy for a specific chain
 */
async function fetchTokenBalancesForChain(
  address: string,
  chainId: number,
  baseUrl: string,
  retries = 2
): Promise<AlchemyTokenBalancesResponse | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${baseUrl}${ALCHEMY_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "alchemy_getTokenBalances",
          params: [address],
          id: 1,
        }),
      });

      if (!response.ok) {
        if (response.status === 429 && attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        console.warn(`Alchemy API error (${response.status}) for chain ${chainId}`);
        return null;
      }

      const data = await response.json();

      if (data.error) {
        if (data.error.message?.includes("rate limit") && attempt < retries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }
        console.warn(`Alchemy API error for chain ${chainId}: ${data.error.message || "Unknown error"}`);
        return null;
      }

      return data.result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`Error fetching token balances for chain ${chainId}:`, error);
        return null;
      }
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }
  return null;
}

/**
 * Fetch balances from all supported chains in parallel
 * Adds small delays between batches to avoid rate limiting
 */
async function fetchAllChainBalances(
  address: string
): Promise<Map<number, AlchemyTokenBalancesResponse>> {
  const supportedChains = Object.keys(ALCHEMY_BASE_URLS).map(Number);
  
  // Process chains in batches to avoid rate limiting
  const batchSize = 3; // Process 3 chains at a time
  const balanceMap = new Map<number, AlchemyTokenBalancesResponse>();

  for (let i = 0; i < supportedChains.length; i += batchSize) {
    const batch = supportedChains.slice(i, i + batchSize);
    
    const balancePromises = batch.map(async (chainId) => {
      const baseUrl = getAlchemyBaseUrl(chainId);
      if (!baseUrl) {
        return { chainId, balance: null };
      }

      const balance = await fetchTokenBalancesForChain(address, chainId, baseUrl);
      return { chainId, balance };
    });

    const results = await Promise.all(balancePromises);
    
    // Add results to map
    results.forEach(({ chainId, balance }) => {
      if (balance) {
        balanceMap.set(chainId, balance);
      }
    });

    // Add delay between batches (except for last batch)
    if (i + batchSize < supportedChains.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return balanceMap;
}

/**
 * Combine Alchemy balances with Li.Fi metadata
 */
function combineBalancesWithMetadata(
  balanceMap: Map<number, AlchemyTokenBalancesResponse>,
  lifiTokens: LiFiTokensResponse
): TokenData[] {
  const allTokens: TokenData[] = [];

  balanceMap.forEach((balanceData, chainId) => {
    const chainConfig = CHAINS[chainId];
    if (!chainConfig) {
      return; // Skip unsupported chains
    }

    // Get native token metadata from Li.Fi
    const nativeTokenMetadata = findNativeTokenMetadata(lifiTokens, chainId);

    // Add native token if we have metadata
    if (nativeTokenMetadata) {
      // Note: For native tokens, we'd need balance from wagmi, but for now we skip
      // Native tokens are handled by the client-side hook
    }

    // Process ERC-20 tokens
    if (!balanceData.tokenBalances) {
      return;
    }

    const nonZeroBalances = balanceData.tokenBalances.filter((token) => {
      // Filter out null address (native token)
      if (
        !token.contractAddress ||
        token.contractAddress === "0x0000000000000000000000000000000000000000"
      ) {
        return false;
      }
      // Filter out zero balances
      const balance = hexToBigInt(token.tokenBalance);
      return balance > BigInt(0);
    });

    nonZeroBalances.forEach((tokenBalance) => {
      // Find metadata in Li.Fi response
      const metadata = findLiFiTokenMetadata(
        lifiTokens,
        chainId,
        tokenBalance.contractAddress
      );

      if (!metadata) {
        // Skip tokens without metadata in Li.Fi
        return;
      }

      // Filter spam tokens
      if (isSpamToken(metadata.name, metadata.symbol)) {
        return;
      }

      const balanceRaw = hexToBigInt(tokenBalance.tokenBalance);
      const balance = formatBalance(balanceRaw, metadata.decimals);

      // Calculate USD value
      const priceUSD = parseFloat(metadata.priceUSD) || 0;
      const balanceNumber = Number(balanceRaw) / Math.pow(10, metadata.decimals);
      const usdValue = balanceNumber * priceUSD;

      const tokenData: TokenData = {
        address: tokenBalance.contractAddress,
        symbol: metadata.symbol,
        name: metadata.name,
        balance,
        balanceRaw,
        decimals: metadata.decimals,
        chainId,
        chainName: chainConfig.name,
        chainLogo: getChainLogoForToken(chainId), // Always try to get chain logo
        usdValue,
        logo: metadata.logoURI || undefined,
      };

      allTokens.push(tokenData);
    });
  });

  return allTokens;
}

/**
 * POST /api/balances
 * Fetches token balances from all supported chains and combines with Li.Fi metadata
 * This is a more efficient approach that reduces API calls:
 * - Single Li.Fi call for all token metadata
 * - Parallel Alchemy calls for balances across all chains
 */
export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch balances from all supported chains in parallel
    console.log(`Fetching balances from all chains for address: ${address}`);
    const balanceMap = await fetchAllChainBalances(address);

    if (balanceMap.size === 0) {
      return NextResponse.json({ tokens: [] }, { status: 200 });
    }

    // Step 2: Fetch all token metadata from Li.Fi in a single call
    console.log("Fetching token metadata from Li.Fi...");
    const lifiTokens = await fetchLiFiTokenMetadata();

    // Step 3: Combine balances with metadata
    console.log("Combining balances with metadata...");
    const allTokens = combineBalancesWithMetadata(balanceMap, lifiTokens);

    // Sort by USD value (highest first)
    allTokens.sort((a, b) => {
      if (b.usdValue && a.usdValue) {
        return b.usdValue - a.usdValue;
      }
      if (b.usdValue) return 1;
      if (a.usdValue) return -1;
      // If both have no USD value, sort by raw balance
      return Number(b.balanceRaw) > Number(a.balanceRaw) ? 1 : -1;
    });

    // Convert BigInt to string for JSON serialization
    const tokensWithSerializedBigInt = allTokens.map((token) => ({
      ...token,
      balanceRaw: token.balanceRaw.toString(),
    }));

    console.log(`Successfully fetched ${tokensWithSerializedBigInt.length} tokens`);

    return NextResponse.json(
      { tokens: tokensWithSerializedBigInt },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in balances API route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch token balances",
      },
      { status: 500 }
    );
  }
}

