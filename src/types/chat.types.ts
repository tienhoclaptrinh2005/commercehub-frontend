import type { UserRole } from "./user.types";

export type ChatConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";
export type ChatMessageType = "TEXT";

export interface ChatUser {
  id: number;
  username: string;
  fullName: string;
  avatarUrl: string | null;
  roles: UserRole[];
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  clientMessageId: string;
  messageType: ChatMessageType;
  content: string;
  sender: ChatUser;
  ownMessage: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: number;
  shopId: number;
  shopName: string;
  shopAvatarUrl: string | null;
  status: "OPEN" | "CLOSED";
  viewerRole: "BUYER" | "SELLER";
  counterpart: ChatUser;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  lastReadMessageId: number | null;
  createdAt: string;
}

export interface ChatMessagePage {
  messages: ChatMessage[];
  hasMore: boolean;
  nextBeforeId: number | null;
  nextAfterId: number | null;
}

export interface ChatSocketEvent {
  eventType: "MESSAGE_CREATED" | "MESSAGES_READ";
  conversationId: number;
  message: ChatMessage | null;
  readerId: number | null;
  readThroughMessageId: number | null;
  totalUnreadCount: number;
}

export interface ChatSocketError {
  eventType: "CHAT_ERROR";
  message: string;
}
