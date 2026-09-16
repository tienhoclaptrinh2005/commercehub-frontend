"use client";

import {
  ArrowLeft,
  CircleAlert,
  LoaderCircle,
  MessageSquareText,
  RefreshCw,
  Send,
  Store,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useChatRealtime } from "@/components/chat/ChatRealtimeProvider";
import { getApiErrorMessage } from "@/services/api";
import { chatService } from "@/services/chat.service";
import type { ChatConversation, ChatMessage } from "@/types";

const MESSAGE_LIMIT = 2000;

function byId(messages: ChatMessage[]) {
  return [...new Map(messages.map((message) => [message.id, message])).values()].sort((a, b) => a.id - b.id);
}

function displayTime(value: string | null) {
  if (!value) return "Chưa có tin nhắn";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toUpperCase();
}

function accountRoles(conversation: ChatConversation) {
  return conversation.counterpart.roles.length > 0
    ? conversation.counterpart.roles.join(" · ")
    : "THÀNH VIÊN";
}

function conversationIdentity(conversation: ChatConversation) {
  const detail = `${accountRoles(conversation)} · @${conversation.counterpart.username}`;
  if (conversation.viewerRole === "SELLER") {
    return {
      name: conversation.counterpart.fullName,
      avatarUrl: conversation.counterpart.avatarUrl,
      detail,
    };
  }
  return {
    name: conversation.shopName,
    avatarUrl: conversation.shopAvatarUrl,
    detail,
  };
}

export function ChatScreen() {
  const {
    status,
    lastEvent,
    eventSequence,
    connectionEpoch,
    lastError: socketError,
    sendMessage,
    refreshUnreadCount,
  } = useChatRealtime();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);
  const activeIdRef = useRef<number | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const initializedConnectionEpoch = useRef(0);

  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const isNearBottom = useCallback(() => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return true;
    return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 120;
  }, []);

  const scrollMessagesToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const viewport = messagesViewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
  }, []);

  const loadConversations = useCallback(async (preferredId?: number) => {
    const page = await chatService.getConversations();
    setConversations(page.data);
    const selected = preferredId ?? activeIdRef.current;
    if (selected && page.data.some((conversation) => conversation.id === selected)) {
      setActiveId(selected);
    } else if (page.data[0]) {
      setActiveId(page.data[0].id);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      setIsLoadingConversations(true);
      setError(null);
      try {
        let preferredId: number | undefined;
        const shopParam = new URLSearchParams(window.location.search).get("shopId");
        if (shopParam && /^\d+$/.test(shopParam)) {
          const created = await chatService.createConversation(Number(shopParam));
          preferredId = created.id;
          window.history.replaceState(null, "", "/chat");
        }
        if (!cancelled) await loadConversations(preferredId);
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorMessage(requestError, "Không thể mở hộp thư."));
      } finally {
        if (!cancelled) setIsLoadingConversations(false);
      }
    };
    void initialize();
    return () => { cancelled = true; };
  }, [loadConversations]);

  useEffect(() => {
    if (!activeId) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      setIsLoadingMessages(true);
      setError(null);
      try {
        const page = await chatService.getMessages(activeId, { size: 40 });
        if (cancelled) return;
        setMessages(page.messages);
        setHasMore(page.hasMore);
        setNextBeforeId(page.nextBeforeId);
        const latest = page.messages.at(-1);
        if (latest && !latest.ownMessage) {
          await chatService.markRead(activeId, latest.id);
          await refreshUnreadCount();
          setConversations((items) => items.map((item) => item.id === activeId ? { ...item, unreadCount: 0 } : item));
        }
        requestAnimationFrame(() => scrollMessagesToBottom());
      } catch (requestError) {
        if (!cancelled) setError(getApiErrorMessage(requestError, "Không thể tải tin nhắn."));
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [activeId, refreshUnreadCount, scrollMessagesToBottom]);

  useEffect(() => {
    if (!lastEvent || eventSequence === 0) return;
    if (lastEvent.eventType === "MESSAGE_CREATED" && lastEvent.message) {
      if (lastEvent.conversationId === activeIdRef.current) {
        const shouldFollowMessage = lastEvent.message.ownMessage || isNearBottom();
        setMessages((items) => byId([...items, lastEvent.message!]));
        if (!lastEvent.message.ownMessage) {
          void chatService.markRead(lastEvent.conversationId, lastEvent.message.id)
            .then(refreshUnreadCount)
            .catch(() => undefined);
        }
        if (shouldFollowMessage) {
          requestAnimationFrame(() => scrollMessagesToBottom());
        }
      }
      void loadConversations(activeIdRef.current ?? undefined);
    }
  }, [eventSequence, isNearBottom, lastEvent, loadConversations, refreshUnreadCount, scrollMessagesToBottom]);

  useEffect(() => {
    if (!connectionEpoch) return;
    if (initializedConnectionEpoch.current === 0) {
      initializedConnectionEpoch.current = connectionEpoch;
      return;
    }
    initializedConnectionEpoch.current = connectionEpoch;
    const conversationId = activeIdRef.current;
    const latestId = messagesRef.current.at(-1)?.id;
    if (!conversationId || !latestId) return;
    const fetchMissed = async () => {
      let cursor = latestId;
      const missed: ChatMessage[] = [];
      for (;;) {
        const page = await chatService.getMessages(conversationId, { afterId: cursor, size: 100 });
        missed.push(...page.messages);
        if (!page.hasMore || !page.nextAfterId) break;
        cursor = page.nextAfterId;
      }
      return missed;
    };
    void fetchMissed()
      .then((missed) => {
        setMessages((items) => byId([...items, ...missed]));
        const newest = missed.at(-1);
        if (newest && !newest.ownMessage) return chatService.markRead(conversationId, newest.id);
      })
      .then(() => Promise.all([loadConversations(conversationId), refreshUnreadCount()]))
      .catch(() => undefined);
  }, [connectionEpoch, loadConversations, refreshUnreadCount]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [activeId, conversations],
  );
  const activeIdentity = activeConversation ? conversationIdentity(activeConversation) : null;

  async function loadOlder() {
    if (!activeId || !hasMore || !nextBeforeId || isLoadingOlder) return;
    const viewport = messagesViewportRef.current;
    const previousScrollHeight = viewport?.scrollHeight ?? 0;
    const previousScrollTop = viewport?.scrollTop ?? 0;
    setIsLoadingOlder(true);
    try {
      const page = await chatService.getMessages(activeId, { beforeId: nextBeforeId, size: 40 });
      setMessages((items) => byId([...page.messages, ...items]));
      setHasMore(page.hasMore);
      setNextBeforeId(page.nextBeforeId);
      requestAnimationFrame(() => {
        if (!viewport) return;
        viewport.scrollTop = previousScrollTop + (viewport.scrollHeight - previousScrollHeight);
      });
    } finally {
      setIsLoadingOlder(false);
    }
  }

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!activeId || !content || content.length > MESSAGE_LIMIT) return;
    try {
      sendMessage({
        conversationId: activeId,
        clientMessageId: crypto.randomUUID(),
        content,
      });
      setDraft("");
      setError(null);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Không thể gửi tin nhắn.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-700">Buyer – Seller</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">Tin nhắn</h1>
            <p className="mt-1 text-sm text-slate-500">Lịch sử được lưu trên hệ thống; Redis chỉ chuyển sự kiện realtime.</p>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status === "CONNECTED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {status === "CONNECTED" ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            {status === "CONNECTED" ? "Đang kết nối realtime" : status === "CONNECTING" ? "Đang kết nối lại…" : "Mất kết nối – sẽ tự thử lại"}
          </span>
        </div>

        {(error || socketError) ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <CircleAlert className="size-4 shrink-0" /> {error || socketError}
          </div>
        ) : null}

        <div className="grid h-[calc(100dvh-12rem)] min-h-[560px] max-h-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[350px_minmax(0,1fr)]">
          <aside className={`border-r border-slate-200 ${activeConversation ? "hidden lg:block" : "block"}`}>
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <h2 className="font-black text-slate-950">Cuộc trò chuyện</h2>
              <button type="button" onClick={() => void loadConversations()} className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Làm mới">
                <RefreshCw className="size-4" />
              </button>
            </div>
            <div className="h-[calc(100%-4rem)] overflow-y-auto overscroll-contain">
              {isLoadingConversations ? (
                <div className="grid min-h-48 place-items-center"><LoaderCircle className="size-6 animate-spin text-emerald-600" /></div>
              ) : conversations.length === 0 ? (
                <div className="px-7 py-16 text-center">
                  <MessageSquareText className="mx-auto size-10 text-slate-300" />
                  <p className="mt-4 font-bold text-slate-800">Chưa có cuộc trò chuyện</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">Mở trang gian hàng hoặc sản phẩm và chọn “Nhắn tin”.</p>
                </div>
              ) : conversations.map((conversation) => {
                const identity = conversationIdentity(conversation);
                return (
                  <button key={conversation.id} type="button" onClick={() => setActiveId(conversation.id)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition ${conversation.id === activeId ? "bg-emerald-50" : "hover:bg-slate-50"}`}>
                    <Avatar name={identity.name} src={identity.avatarUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="truncate text-sm font-black text-slate-900">{identity.name}</span>
                        <span className="shrink-0 text-[10px] text-slate-400">{displayTime(conversation.lastMessageAt)}</span>
                      </span>
                      <span className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-slate-500">{conversation.lastMessagePreview || identity.detail}</span>
                        {conversation.unreadCount > 0 ? <span className="grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-black leading-5 text-white">{conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}</span> : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className={`${activeConversation ? "flex" : "hidden lg:flex"} min-h-0 min-w-0 flex-col`}>
            {!activeConversation || !activeIdentity ? (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div><MessageSquareText className="mx-auto size-14 text-slate-200" /><p className="mt-4 font-bold text-slate-600">Chọn một cuộc trò chuyện</p></div>
              </div>
            ) : (
              <>
                <header className="flex h-16 items-center gap-3 border-b border-slate-200 px-4 sm:px-5">
                  <button type="button" onClick={() => setActiveId(null)} className="grid size-9 place-items-center rounded-lg hover:bg-slate-100 lg:hidden" aria-label="Quay lại"><ArrowLeft className="size-5" /></button>
                  <Avatar name={activeIdentity.name} src={activeIdentity.avatarUrl} small />
                  <div className="min-w-0"><p className="truncate text-sm font-black text-slate-950">{activeIdentity.name}</p><p className="truncate text-xs text-slate-500">{activeIdentity.detail}</p></div>
                </header>
                <div ref={messagesViewportRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#f7f9ff] px-4 py-5 sm:px-6" style={{ overflowAnchor: "none" }}>
                  {hasMore ? <div className="mb-5 text-center"><button type="button" onClick={() => void loadOlder()} disabled={isLoadingOlder} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm disabled:opacity-60">{isLoadingOlder ? "Đang tải…" : "Xem tin nhắn cũ hơn"}</button></div> : null}
                  {isLoadingMessages ? <div className="grid min-h-48 place-items-center"><LoaderCircle className="size-6 animate-spin text-emerald-600" /></div> : messages.length === 0 ? <div className="py-24 text-center"><Store className="mx-auto size-10 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-500">Hãy gửi lời chào đến gian hàng.</p></div> : (
                    <div className="space-y-3">{messages.map((message) => <MessageBubble key={message.id} message={message} />)}</div>
                  )}
                </div>
                <form onSubmit={submitMessage} className="border-t border-slate-200 bg-white p-4 sm:p-5">
                  <div className="flex items-end gap-3">
                    <div className="min-w-0 flex-1"><textarea value={draft} onChange={(event) => setDraft(event.target.value.slice(0, MESSAGE_LIMIT))} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={2} maxLength={MESSAGE_LIMIT} placeholder="Nhập tin nhắn…" className="max-h-36 min-h-12 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" /><p className="mt-1 text-right text-[10px] text-slate-400">{draft.length}/{MESSAGE_LIMIT} · Chỉ văn bản</p></div>
                    <button type="submit" disabled={!draft.trim() || status !== "CONNECTED"} className="grid size-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300" aria-label="Gửi tin nhắn"><Send className="size-5" /></button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function Avatar({ name, src, small = false }: { name: string; src: string | null; small?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const size = small ? "size-10" : "size-11";
  return src && failedSrc !== src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`Ảnh đại diện ${name}`} referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} className={`${size} shrink-0 rounded-full border border-slate-200 object-cover`} />
  ) : <span className={`${size} grid shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700`}>{initials(name)}</span>;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <div className={`flex ${message.ownMessage ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${message.ownMessage ? "rounded-br-md bg-emerald-700 text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
        <p className="whitespace-pre-wrap break-words leading-6">{message.content}</p>
        <p className={`mt-1 text-right text-[10px] ${message.ownMessage ? "text-emerald-100" : "text-slate-400"}`}>{displayTime(message.createdAt)}</p>
      </div>
    </div>
  );
}
