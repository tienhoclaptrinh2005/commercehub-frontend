import { api } from "@/services/api";
import type {
  ApiResponse,
  ChatConversation,
  ChatMessagePage,
  PageResponse,
} from "@/types";

function dataOrThrow<T>(response: ApiResponse<T>, fallback: string): T {
  if (!response.success || response.data === undefined) {
    throw new Error(response.message || fallback);
  }
  return response.data;
}

export const chatService = {
  async createConversation(shopId: number): Promise<ChatConversation> {
    const response = await api.post<ApiResponse<ChatConversation>>(
      "/api/v1/chat/conversations",
      { shopId },
    );
    return dataOrThrow(response.data, "Không thể mở cuộc trò chuyện");
  },

  async getConversations(page = 0, size = 50): Promise<PageResponse<ChatConversation>> {
    const response = await api.get<ApiResponse<PageResponse<ChatConversation>>>(
      "/api/v1/chat/conversations",
      { params: { page, size } },
    );
    return dataOrThrow(response.data, "Không thể tải danh sách trò chuyện");
  },

  async getMessages(
    conversationId: number,
    options: { beforeId?: number; afterId?: number; size?: number } = {},
  ): Promise<ChatMessagePage> {
    const response = await api.get<ApiResponse<ChatMessagePage>>(
      `/api/v1/chat/conversations/${conversationId}/messages`,
      { params: options },
    );
    return dataOrThrow(response.data, "Không thể tải lịch sử tin nhắn");
  },

  async markRead(conversationId: number, throughMessageId: number): Promise<void> {
    await api.post(`/api/v1/chat/conversations/${conversationId}/read`, {
      throughMessageId,
    });
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>(
      "/api/v1/chat/unread-count",
    );
    return dataOrThrow(response.data, "Không thể tải số tin chưa đọc").unreadCount;
  },
};
