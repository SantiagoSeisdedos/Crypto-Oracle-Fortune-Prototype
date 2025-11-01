import { create } from "zustand";
import { TokenData } from "@/lib/formatTokens";

interface AppState {
  tokens: TokenData[];
  fortune: string | null;
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  isLoading: boolean;
  error: string | null;

  setTokens: (tokens: TokenData[]) => void;
  setFortune: (fortune: string) => void;
  addChatMessage: (role: "user" | "assistant", content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  tokens: [],
  fortune: null,
  chatHistory: [],
  isLoading: false,
  error: null,

  setTokens: (tokens) => set({ tokens }),
  setFortune: (fortune) => set({ fortune }),
  addChatMessage: (role, content) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, { role, content }],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      tokens: [],
      fortune: null,
      chatHistory: [],
      isLoading: false,
      error: null,
    }),
}));
