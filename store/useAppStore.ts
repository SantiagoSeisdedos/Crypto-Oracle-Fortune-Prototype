import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TokenData } from "@/lib/formatTokens";

// Serialized token for storage (BigInt as string)
type SerializedTokenData = Omit<TokenData, "balanceRaw"> & {
  balanceRaw: string;
};

// Cache key format: `${address}-${chainId}`
type TokenCache = Record<string, SerializedTokenData[]>;

interface AppState {
  // Current tokens for the active chain/address
  tokens: TokenData[];
  // Cache of tokens by address-chainId combination
  tokenCache: TokenCache;
  error: string | null;

  // Actions
  setTokens: (tokens: TokenData[], address?: string, chainId?: number) => void;
  getCachedTokens: (address: string, chainId: number) => TokenData[] | null;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tokens: [],
      tokenCache: {},
      error: null,

      setTokens: (tokens, address, chainId) => {
        // Update current tokens
        set({ tokens });

        // Cache tokens if address and chainId are provided
        if (address && chainId !== undefined) {
          const cacheKey = `${address.toLowerCase()}-${chainId}`;
          // Serialize BigInt for storage
          const serializedTokens: SerializedTokenData[] = tokens.map((token) => ({
            ...token,
            balanceRaw: token.balanceRaw.toString(),
          }));
          set((state) => ({
            tokenCache: {
              ...state.tokenCache,
              [cacheKey]: serializedTokens,
            },
          }));
        }
      },

      getCachedTokens: (address, chainId) => {
        const cacheKey = `${address.toLowerCase()}-${chainId}`;
        const cached = get().tokenCache[cacheKey];
        if (!cached || cached.length === 0) return null;
        
        // Deserialize BigInt from storage
        return cached.map((token: any) => ({
          ...token,
          balanceRaw: BigInt(token.balanceRaw || "0"),
        }));
      },

      setError: (error) => set({ error }),
      reset: () =>
        set({
          tokens: [],
          tokenCache: {},
          error: null,
        }),
    }),
    {
      name: "app-store",
      // Only persist tokenCache, not tokens (tokens are derived from cache)
      partialize: (state) => ({
        tokenCache: state.tokenCache,
      }),
    }
  )
);
