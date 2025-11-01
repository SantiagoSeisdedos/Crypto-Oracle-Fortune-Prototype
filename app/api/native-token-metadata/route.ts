import { NextRequest, NextResponse } from "next/server";
import {
  fetchLiFiTokenMetadata,
  findNativeTokenMetadata,
} from "@/lib/lifi";

/**
 * GET /api/native-token-metadata?chainId=1
 * Fetches native token metadata from Li.Fi for a specific chain
 * Returns logo and USD price for the native token (ETH, MATIC, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chainIdStr = searchParams.get("chainId");

    if (!chainIdStr) {
      return NextResponse.json(
        { error: "chainId parameter is required" },
        { status: 400 }
      );
    }

    const chainId = parseInt(chainIdStr, 10);
    if (isNaN(chainId)) {
      return NextResponse.json(
        { error: "Invalid chainId parameter" },
        { status: 400 }
      );
    }

    // Fetch all token metadata from Li.Fi (this is cached by the browser/Next.js)
    const lifiTokens = await fetchLiFiTokenMetadata();

    // Find native token metadata for this chain
    const nativeTokenMetadata = findNativeTokenMetadata(lifiTokens, chainId);

    if (!nativeTokenMetadata) {
      return NextResponse.json(
        { error: "Native token metadata not found for this chain" },
        { status: 404 }
      );
    }

    // Calculate USD value if we have price (but not balance, so we return price only)
    const priceUSD = parseFloat(nativeTokenMetadata.priceUSD) || 0;

    console.log("nativeTokenMetadata", nativeTokenMetadata);
    console.log("priceUSD", priceUSD);

    return NextResponse.json(
      {
        logo: nativeTokenMetadata.logoURI || undefined,
        priceUSD,
        symbol: nativeTokenMetadata.symbol,
        name: nativeTokenMetadata.name,
        decimals: nativeTokenMetadata.decimals,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in native-token-metadata API route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch native token metadata",
      },
      { status: 500 }
    );
  }
}

