"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface Chat {
  id: string;
  title: string;
  chatHistory: Message[];
  fortune?: string;
  tokens?: string;
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  addChat: (fortune?: string, tokens?: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  getCurrentChat: () => Chat | null;
  setCurrentChatId: (id: string) => void;
  getChatsCount: () => number;
  canCreateChat: () => boolean;
  loadChats: () => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
}

const MAX_CHATS = 3;

function generateChatTitle(): string {
  const date = new Date();
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateStr = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Chat • ${dateStr} ${timeStr}`;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,

      addChat: (fortune?: string, tokens?: string) => {
        // If fortune is provided, add it as the first assistant message
        const initialMessages: Message[] = fortune
          ? [
              {
                role: "assistant",
                content: fortune,
                timestamp: Date.now(),
              },
            ]
          : [];

        const newChat: Chat = {
          id: Date.now().toString(),
          title: generateChatTitle(),
          chatHistory: initialMessages,
          fortune,
          tokens,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
        }));
      },

      updateChat: (id: string, updates: Partial<Chat>) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, ...updates, updatedAt: Date.now() } : chat
          ),
        }));
      },

      deleteChat: (id: string) => {
        set((state) => {
          const updatedChats = state.chats.filter((chat) => chat.id !== id);
          const newCurrentChatId =
            state.currentChatId === id
              ? updatedChats.length > 0
                ? updatedChats[0].id
                : null
              : state.currentChatId;
          return {
            chats: updatedChats,
            currentChatId: newCurrentChatId,
          };
        });
      },

      addMessage: (chatId: string, message: Message) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  chatHistory: [...chat.chatHistory, message],
                  updatedAt: Date.now(),
                }
              : chat
          ),
        }));
      },

      getCurrentChat: () => {
        const state = get();
        return (
          state.chats.find((chat) => chat.id === state.currentChatId) || null
        );
      },

      setCurrentChatId: (id: string) => {
        set({ currentChatId: id });
      },

      getChatsCount: () => {
        return get().chats.length;
      },

      canCreateChat: () => {
        return get().chats.length < MAX_CHATS;
      },

      loadChats: () => {
        // Trigger hydration - don't create empty chats
        // Chats should only be created when fortune is generated
      },
    }),
    {
      name: "chat-store",
    }
  )
);
