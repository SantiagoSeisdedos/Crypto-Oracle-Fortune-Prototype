import { NextRequest, NextResponse } from "next/server";
import {
  getAlchemyBaseUrl,
  isAlchemySupported,
  type AlchemyTokenBalancesResponse,
  type AlchemyTokenMetadata,
} from "@/lib/alchemy";
import { getCoinGeckoTokenMetadata } from "@/lib/coingecko";
import { getCoinMarketCapTokenMetadata } from "@/lib/coinmarketcap";
import { ALCHEMY_API_KEY } from "@/lib/alchemy";
import { TokenData } from "@/lib/formatTokens";
import { formatBalance } from "@/lib/utils";
import { CHAINS } from "@/lib/chains";

/**
 * Fetch token balances from Alchemy API
 */
async function fetchTokenBalances(
  address: string,
  baseUrl: string
): Promise<AlchemyTokenBalancesResponse | null> {
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
      throw new Error(`Alchemy API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Alchemy API error");
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    return null;
  }
}

/**
 * Fetch token metadata from Alchemy API
 */
async function fetchTokenMetadata(
  contractAddress: string,
  baseUrl: string
): Promise<AlchemyTokenMetadata | null> {
  try {
    const response = await fetch(`${baseUrl}${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenMetadata",
        params: [contractAddress],
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Alchemy API error");
    }

    // Validate token - skip if it contains spam words (claim, reward, etc.)
    if (isSpamToken(data.result.name, data.result.symbol)) {
      return null;
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return null;
  }
}

/**
 * Check if token is spam based on name or symbol
 * Returns true if token contains spam words (should be skipped)
 * Returns false if token is valid (should be included)
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

  // Check if name or symbol contains any spam words
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
 * POST /api/alchemy
 * Fetches ERC-20 token balances for a given address and chain
 */
export async function POST(request: NextRequest) {
  try {
    const { address, chainId } = await request.json();

    if (!address || !chainId) {
      return NextResponse.json(
        { error: "Address and chainId are required" },
        { status: 400 }
      );
    }

    // Check if Alchemy supports this chain
    if (!isAlchemySupported(chainId)) {
      return NextResponse.json(
        {
          tokens: [],
          message: `Alchemy does not support chain ID ${chainId}`,
        },
        { status: 200 }
      );
    }

    const baseUrl = getAlchemyBaseUrl(chainId);
    if (!baseUrl) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const chainConfig = CHAINS[chainId];
    if (!chainConfig) {
      return NextResponse.json(
        { error: `Unknown chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    // Fetch token balances
    const balanceData = await fetchTokenBalances(address, baseUrl);
    if (!balanceData || !balanceData.tokenBalances) {
      return NextResponse.json({ tokens: [] }, { status: 200 });
    }

    // Filter out zero balances and the null balance token (ERC-20 tokens only)
    const nonZeroBalances = balanceData.tokenBalances.filter((token) => {
      // Filter out the null token address (native token)
      if (
        token.contractAddress === "0x0000000000000000000000000000000000000000"
      ) {
        return false;
      }
      // Filter out zero balances
      const balance = hexToBigInt(token.tokenBalance);
      return balance > BigInt(0);
    });

    // Fetch metadata for each token in parallel
    const tokenPromises = nonZeroBalances.map(async (tokenBalance) => {
      try {
        // Fetch metadata from Alchemy
        const alchemyMetadata = await fetchTokenMetadata(
          tokenBalance.contractAddress,
          baseUrl
        );

        if (!alchemyMetadata) {
          return null;
        }

        const balanceRaw = hexToBigInt(tokenBalance.tokenBalance);
        const balance = formatBalance(
          balanceRaw,
          alchemyMetadata.decimals || 18
        );

        // Try CoinMarketCap as primary fallback, then CoinGecko for logo and price
        let logo = alchemyMetadata.logo || undefined;
        let usdValue: number | undefined;
        let coinMarketCapData: any = null;
        let coingeckoData: any = null;

        // Try CoinMarketCap first (more reliable, less rate limiting)
        coinMarketCapData = await getCoinMarketCapTokenMetadata(
          tokenBalance.contractAddress,
          chainId,
          alchemyMetadata.symbol
        );

        // Use CoinMarketCap logo if Alchemy doesn't have one
        if ((!logo || !logo.trim()) && coinMarketCapData?.logo) {
          logo = coinMarketCapData.logo;
        }

        // Calculate USD value if we have price from CoinMarketCap
        if (coinMarketCapData?.price) {
          const balanceNumber =
            Number(balanceRaw) / Math.pow(10, alchemyMetadata.decimals || 18);
          usdValue = balanceNumber * coinMarketCapData.price;
        } else {
          // Fallback to CoinGecko if CoinMarketCap doesn't have price
          coingeckoData = await getCoinGeckoTokenMetadata(
            tokenBalance.contractAddress,
            chainId
          );
          // Use CoinGecko logo if we still don't have one
          if ((!logo || !logo.trim()) && coingeckoData?.image) {
            logo = coingeckoData.image;
          }

          // Calculate USD value if we have price from CoinGecko
          if (coingeckoData?.current_price) {
            const balanceNumber =
              Number(balanceRaw) / Math.pow(10, alchemyMetadata.decimals || 18);
            usdValue = balanceNumber * coingeckoData.current_price;
          }
        }

        // Filter out tokens with no metadata and no USD value
        // Skip tokens where both coinMarketCapData and coingeckoData are null/undefined
        // AND usdValue is undefined
        if (!coinMarketCapData && !coingeckoData && usdValue === undefined) {
          return null;
        }

        const tokenData: TokenData = {
          address: tokenBalance.contractAddress,
          symbol: alchemyMetadata.symbol || "UNKNOWN",
          name: alchemyMetadata.name || "Unknown Token",
          balance,
          balanceRaw,
          decimals: alchemyMetadata.decimals || 18,
          chainId,
          chainName: chainConfig.name,
          usdValue,
          logo,
        };

        // Convert BigInt to string for JSON serialization
        return {
          ...tokenData,
          balanceRaw: balanceRaw.toString(),
        };
      } catch (error) {
        console.error(
          `Error processing token ${tokenBalance.contractAddress}:`,
          error
        );
        return null;
      }
    });

    // Wait for all metadata fetches to complete
    const tokens = (await Promise.all(tokenPromises)).filter(
      (token) => token !== null
    );

    // Sort by USD value (highest first)
    tokens.sort((a, b) => {
      if (a && b) {
        return (b.usdValue || 0) - (a.usdValue || 0);
      }
      return 0;
    });

    return NextResponse.json({ tokens }, { status: 200 });
  } catch (error) {
    console.error("Error in Alchemy API route:", error);
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
