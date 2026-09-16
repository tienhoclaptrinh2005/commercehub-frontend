"use client";

import { Client, type IMessage } from "@stomp/stompjs";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import { readAuthSession } from "@/lib/auth";
import { getApiErrorMessage, refreshAuthSession } from "@/services/api";
import { chatService } from "@/services/chat.service";
import type {
  ChatConnectionStatus,
  ChatMessageType,
  ChatSocketError,
  ChatSocketEvent,
} from "@/types";

interface SendMessageInput {
  conversationId: number;
  clientMessageId: string;
  messageType?: ChatMessageType;
  content: string;
}

interface ChatRealtimeContextValue {
  status: ChatConnectionStatus;
  unreadCount: number;
  lastEvent: ChatSocketEvent | null;
  eventSequence: number;
  connectionEpoch: number;
  lastError: string | null;
  sendMessage: (input: SendMessageInput) => void;
  refreshUnreadCount: () => Promise<void>;
}

const ChatRealtimeContext = createContext<ChatRealtimeContextValue | null>(null);

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `${API_URL.replace(/^http/, "ws")}/ws/chat`;

function tokenExpiresSoon(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    return !payload.exp || payload.exp * 1000 < Date.now() + 30_000;
  } catch {
    return true;
  }
}

export function ChatRealtimeProvider({ children }: { children: ReactNode }) {
  const { user, isHydrated } = useAuth();
  const userId = user?.id;
  const clientRef = useRef<Client | null>(null);
  const [status, setStatus] = useState<ChatConnectionStatus>("DISCONNECTED");
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastEvent, setLastEvent] = useState<ChatSocketEvent | null>(null);
  const [eventSequence, setEventSequence] = useState(0);
  const [connectionEpoch, setConnectionEpoch] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!readAuthSession()) {
      setUnreadCount(0);
      return;
    }
    try {
      setUnreadCount(await chatService.getUnreadCount());
    } catch {
      // Mất mạng tạm thời không được làm rơi kết nối chat đang hoạt động.
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !userId) {
      clientRef.current?.deactivate();
      clientRef.current = null;
      return;
    }

    const client = new Client({
      brokerURL: WS_URL,
      reconnectDelay: 3_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,
      connectionTimeout: 10_000,
      debug: () => undefined,
      beforeConnect: async () => {
        setStatus("CONNECTING");
        let session = readAuthSession();
        try {
          if (!session || tokenExpiresSoon(session.accessToken)) {
            session = await refreshAuthSession();
          }
        } catch (refreshError) {
          // Do not reject beforeConnect: STOMP leaves rejected hooks as an
          // unhandled promise. Retain the current token (if any), let the
          // socket fail normally, then its reconnect loop will retry refresh.
          setStatus("DISCONNECTED");
          setLastError(getApiErrorMessage(refreshError,
            "Không thể làm mới phiên chat. Hệ thống sẽ tự kết nối lại."));
        }
        if (!session) {
          client.connectHeaders = {};
          return;
        }
        client.connectHeaders = {
          Authorization: `${session.tokenType} ${session.accessToken}`,
        };
      },
      onConnect: () => {
        setStatus("CONNECTED");
        setLastError(null);
        setConnectionEpoch((value) => value + 1);
        void refreshUnreadCount();
        client.subscribe("/user/queue/chat", (frame: IMessage) => {
          const event = JSON.parse(frame.body) as ChatSocketEvent;
          setUnreadCount(event.totalUnreadCount);
          setLastEvent(event);
          setEventSequence((value) => value + 1);
        });
        client.subscribe("/user/queue/chat-errors", (frame: IMessage) => {
          const error = JSON.parse(frame.body) as ChatSocketError;
          setLastError(error.message);
        });
      },
      onWebSocketClose: () => setStatus("DISCONNECTED"),
      onStompError: (frame) => {
        setLastError(frame.headers.message || "Kết nối chat bị từ chối");
      },
    });

    clientRef.current = client;
    client.activate();
    return () => {
      clientRef.current = null;
      void client.deactivate();
    };
  }, [isHydrated, refreshUnreadCount, userId]);

  const sendMessage = useCallback((input: SendMessageInput) => {
    const client = clientRef.current;
    if (!client?.connected) throw new Error("Chat đang kết nối lại, vui lòng thử sau vài giây.");
    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ ...input, messageType: input.messageType ?? "TEXT" }),
    });
  }, []);

  const value = useMemo<ChatRealtimeContextValue>(() => ({
    status: userId ? status : "DISCONNECTED",
    unreadCount: userId ? unreadCount : 0,
    lastEvent,
    eventSequence,
    connectionEpoch,
    lastError,
    sendMessage,
    refreshUnreadCount,
  }), [connectionEpoch, eventSequence, lastError, lastEvent, refreshUnreadCount, sendMessage, status, unreadCount, userId]);

  return <ChatRealtimeContext.Provider value={value}>{children}</ChatRealtimeContext.Provider>;
}

export function useChatRealtime() {
  const value = useContext(ChatRealtimeContext);
  if (!value) throw new Error("useChatRealtime must be used inside ChatRealtimeProvider");
  return value;
}
