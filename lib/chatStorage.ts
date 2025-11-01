/**
 * LocalStorage utilities for chat management
 * Stores chat sessions with history, fortune, and metadata
 */

export interface ChatSession {
  id: string;
  fortune: string;
  tokens: string; // Token summary
  chatHistory: Array<{ role: "user" | "assistant"; content: string }>;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "crypto-oracle-chats";
const MAX_CHATS = 3;
const MAX_MESSAGES_PER_CHAT = 5;

/**
 * Get all chat sessions from localStorage
 */
export function getChatSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const chats = JSON.parse(stored) as ChatSession[];
    // Sort by updatedAt (most recent first)
    return chats.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error("Error reading chat sessions:", error);
    return [];
  }
}

/**
 * Save a chat session to localStorage
 */
export function saveChatSession(session: ChatSession): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const chats = getChatSessions();
    
    // Check if chat already exists (update) or if we need to add a new one
    const existingIndex = chats.findIndex((c) => c.id === session.id);
    
    if (existingIndex >= 0) {
      // Update existing chat
      chats[existingIndex] = session;
    } else {
      // Add new chat, but enforce max chats limit
      if (chats.length >= MAX_CHATS) {
        // Remove oldest chat
        chats.pop();
      }
      chats.unshift(session);
    }
    
    // Sort by updatedAt
    chats.sort((a, b) => b.updatedAt - a.updatedAt);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    return true;
  } catch (error) {
    console.error("Error saving chat session:", error);
    return false;
  }
}

/**
 * Delete a chat session
 */
export function deleteChatSession(chatId: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const chats = getChatSessions().filter((c) => c.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    return true;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return false;
  }
}

/**
 * Get a specific chat session by ID
 */
export function getChatSession(chatId: string): ChatSession | null {
  const chats = getChatSessions();
  return chats.find((c) => c.id === chatId) || null;
}

/**
 * Get the number of user messages in a chat session
 */
export function getUserMessageCount(session: ChatSession): number {
  return session.chatHistory.filter((msg) => msg.role === "user").length;
}

/**
 * Check if a chat session has reached message limit
 */
export function hasReachedMessageLimit(session: ChatSession): boolean {
  return getUserMessageCount(session) >= MAX_MESSAGES_PER_CHAT;
}

/**
 * Check if user can create a new chat
 */
export function canCreateNewChat(): boolean {
  const chats = getChatSessions();
  return chats.length < MAX_CHATS;
}

/**
 * Get limits configuration
 */
export function getLimits() {
  return {
    maxChats: MAX_CHATS,
    maxMessagesPerChat: MAX_MESSAGES_PER_CHAT,
  };
}

