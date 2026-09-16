"use client";

import { useChatRealtime } from "./ChatRealtimeProvider";

export function ChatUnreadBadge() {
  const { unreadCount } = useChatRealtime();
  if (unreadCount <= 0) return null;
  return (
    <span
      className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-black leading-5 text-white ring-2 ring-white"
      aria-label={`${unreadCount} tin nhắn chưa đọc`}
    >
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
}
