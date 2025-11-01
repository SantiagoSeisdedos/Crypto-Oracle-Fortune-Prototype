/**
 * CoinMarketCap API utilities
 * Used as fallback for token metadata (logos, prices, etc.)
 * Documentation: https://coinmarketcap.com/api/documentation/v1/
 */

export interface CoinMarketCapTokenMetadata {
  id?: string;
  symbol?: string;
  name?: string;
  logo?: string;
  price?: number;
  market_cap?: number;
  volume_24h?: number;
}

// Map chain IDs to CoinMarketCap platform slugs/identifiers
const PLATFORM_MAP: Record<number, string> = {
  1: "ethereum", // Ethereum Mainnet
  10: "optimistic-ethereum", // Optimism
  137: "polygon-pos", // Polygon
  42161: "arbitrum-one", // Arbitrum One
  8453: "base", // Base
  43114: "avalanche", // Avalanche
} as const;

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/**
 * Get CoinMarketCap token ID from contract address
 * Uses the mapping endpoint to find token by contract address
 */
async function getTokenIdByContract(
  contractAddress: string,
  chainId: number
): Promise<string | null> {
  if (!COINMARKETCAP_API_KEY) {
    return null;
  }

  try {
    const platform = PLATFORM_MAP[chainId];
    if (!platform) {
      return null;
    }

    // CoinMarketCap API endpoint for mapping - search by platform
    // We'll search for tokens on this platform and filter by contract address
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?listing_status=active&start=1&limit=5000`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
      },
      signal: AbortSignal.timeout(10000), // Longer timeout for large response
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      // Find token by contract address on the specific platform (case-insensitive)
      const contractAddressLower = contractAddress.toLowerCase();
      const token = data.data.find(
        (item: any) =>
          item.platform?.slug === platform &&
          item.platform?.token_address?.toLowerCase() === contractAddressLower
      );

      return token?.id?.toString() || null;
    }

    return null;
  } catch (error) {
    console.error("CoinMarketCap mapping error:", error);
    return null;
  }
}

/**
 * Search for token by symbol first (faster than mapping)
 * Note: CoinMarketCap doesn't have a direct search endpoint, so we'll use symbol lookup via map
 */
async function searchTokenBySymbol(
  symbol: string,
  chainId: number
): Promise<string | null> {
  if (!COINMARKETCAP_API_KEY) {
    return null;
  }

  try {
    const platform = PLATFORM_MAP[chainId];
    if (!platform) {
      return null;
    }

    // Search through mapping to find by symbol on this platform
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?listing_status=active&start=1&limit=5000`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      // Find token matching the symbol and chain platform
      const symbolUpper = symbol.toUpperCase();
      const token = data.data.find(
        (item: any) =>
          item.symbol?.toUpperCase() === symbolUpper &&
          item.platform?.slug === platform
      );

      return token?.id?.toString() || null;
    }

    return null;
  } catch (error) {
    console.error("CoinMarketCap search error:", error);
    return null;
  }
}

/**
 * Get token metadata from CoinMarketCap by token ID
 */
async function getTokenInfoById(tokenId: string): Promise<CoinMarketCapTokenMetadata | null> {
  if (!COINMARKETCAP_API_KEY) {
    return null;
  }

  try {
    // Get token info
    const infoUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?id=${tokenId}`;
    
    const infoResponse = await fetch(infoUrl, {
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!infoResponse.ok) {
      return null;
    }

    const infoData = await infoResponse.json();
    const tokenInfo = infoData.data?.[tokenId];
    
    if (!tokenInfo) {
      return null;
    }

    // Get price quotes
    const quotesUrl = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${tokenId}`;
    
    const quotesResponse = await fetch(quotesUrl, {
      headers: {
        Accept: "application/json",
        "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY,
      },
      signal: AbortSignal.timeout(5000),
    });

    let price: number | undefined;
    let market_cap: number | undefined;
    let volume_24h: number | undefined;

    if (quotesResponse.ok) {
      const quotesData = await quotesResponse.json();
      const quote = quotesData.data?.[tokenId]?.quote?.USD;
      
      if (quote) {
        price = quote.price;
        market_cap = quote.market_cap;
        volume_24h = quote.volume_24h;
      }
    }

    return {
      id: tokenId,
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      logo: tokenInfo.logo,
      price,
      market_cap,
      volume_24h,
    };
  } catch (error) {
    console.error("CoinMarketCap info error:", error);
    return null;
  }
}

/**
 * Get token metadata from CoinMarketCap by contract address and chain
 */
export async function getCoinMarketCapTokenMetadata(
  contractAddress: string,
  chainId: number,
  symbol?: string
): Promise<CoinMarketCapTokenMetadata | null> {
  try {
    if (!COINMARKETCAP_API_KEY) {
      return null;
    }

    // Try to find token ID by symbol first (faster)
    let tokenId: string | null = null;
    
    if (symbol) {
      tokenId = await searchTokenBySymbol(symbol, chainId);
    }

    // If symbol search failed, try mapping by contract address
    if (!tokenId) {
      tokenId = await getTokenIdByContract(contractAddress, chainId);
    }

    if (!tokenId) {
      return null;
    }

    // Get token info using the token ID
    return await getTokenInfoById(tokenId);
  } catch (error) {
    console.error("CoinMarketCap API error:", error);
    return null;
  }
}

/**
 * Get token price from CoinMarketCap
 */
export async function getTokenPriceFromCoinMarketCap(
  contractAddress: string,
  chainId: number,
  symbol?: string
): Promise<number | null> {
  const metadata = await getCoinMarketCapTokenMetadata(contractAddress, chainId, symbol);
  return metadata?.price || null;
}

