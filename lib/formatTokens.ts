import { formatBalance, formatUSD } from "./utils";

export interface TokenData {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  balanceRaw: bigint;
  decimals: number;
  chainId: number;
  chainName: string;
  chainLogo?: string; // Chain logo URL
  usdValue?: number;
  logo?: string; // Token logo URL
}

// Format tokens for display
export function formatTokens(tokens: TokenData[]): string {
  return tokens
    .map(
      (token) =>
        `${token.symbol} (${token.name}) - ${token.balance} on ${token.chainName}`
    )
    .join("\n");
}

// Get top N tokens by USD value
export function getTopTokens(
  tokens: TokenData[],
  count: number = 3
): TokenData[] {
  return [...tokens]
    .sort((a, b) => (b.usdValue || 0) - (a.usdValue || 0))
    .slice(0, count);
}

// Format token summary for AI prompt
export function formatTokenSummary(tokens: TokenData[]): string {
  const topTokens = getTopTokens(tokens, 20);
  return topTokens
    .map(
      (token) =>
        `• ${token.symbol}: ${token.balance} on ${token.chainName}${token.usdValue ? ` (${formatUSD(token.usdValue)})` : ""}`
    )
    .join("\n");
}

