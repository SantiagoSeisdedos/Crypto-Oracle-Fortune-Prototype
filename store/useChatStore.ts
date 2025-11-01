import { create } from "zustand";
import { ChatSession, getChatSessions, saveChatSession, deleteChatSession, getLimits, hasReachedMessageLimit, canCreateNewChat } from "@/lib/chatStorage";

interface ChatState {
  currentChatId: string | null;
  chats: ChatSession[];
  
  // Actions
  loadChats: () => void;
  createNewChat: (fortune: string, tokens: string) => string;
  selectChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (role: "user" | "assistant", content: string) => void;
  getCurrentChat: () => ChatSession | null;
  canSendMessage: () => boolean;
  canCreateChat: () => boolean;
  getRemainingMessages: () => number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentChatId: null,
  chats: [],

  loadChats: () => {
    const chats = getChatSessions();
    const { currentChatId } = get();
    // Ensure current chat ID is still valid
    const validCurrentChatId = chats.some((c) => c.id === currentChatId) ? currentChatId : (chats[0]?.id || null);
    set({ chats, currentChatId: validCurrentChatId });
  },

  createNewChat: (fortune: string, tokens: string) => {
    const { loadChats } = get();
    
    if (!canCreateNewChat()) {
      throw new Error("Maximum number of chats reached. Delete an existing chat to create a new one.");
    }

    const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newChat: ChatSession = {
      id: chatId,
      fortune,
      tokens,
      chatHistory: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    saveChatSession(newChat);
    loadChats();
    set({ currentChatId: chatId });
    return chatId;
  },

  selectChat: (chatId: string) => {
    set({ currentChatId: chatId });
  },

  deleteChat: (chatId: string) => {
    const { loadChats } = get();
    deleteChatSession(chatId);
    loadChats();
    const chats = getChatSessions();
    const newCurrentChatId = chatId === get().currentChatId ? (chats[0]?.id || null) : get().currentChatId;
    set({ currentChatId: newCurrentChatId });
  },

  addMessage: (role: "user" | "assistant", content: string) => {
    const { currentChatId, loadChats } = get();
    if (!currentChatId) return;

    const chats = getChatSessions();
    const chat = chats.find((c) => c.id === currentChatId);
    if (!chat) return;

    chat.chatHistory.push({ role, content });
    chat.updatedAt = Date.now();
    
    saveChatSession(chat);
    loadChats();
  },

  getCurrentChat: () => {
    const { currentChatId, chats } = get();
    if (!currentChatId) return null;
    return chats.find((c) => c.id === currentChatId) || null;
  },

  canSendMessage: () => {
    const currentChat = get().getCurrentChat();
    if (!currentChat) return false;
    return !hasReachedMessageLimit(currentChat);
  },

  canCreateChat: () => {
    return canCreateNewChat();
  },

  getRemainingMessages: () => {
    const currentChat = get().getCurrentChat();
    if (!currentChat) return 0;
    const { maxMessagesPerChat } = getLimits();
    const userMessages = currentChat.chatHistory.filter((msg) => msg.role === "user").length;
    return Math.max(0, maxMessagesPerChat - userMessages);
  },
}));

