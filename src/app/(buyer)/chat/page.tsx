import type { Metadata } from "next";
import { Suspense } from "react";

import { ChatScreen } from "@/components/chat/ChatScreen";

export const metadata: Metadata = {
  title: "Tin nhắn",
  description: "Trao đổi trực tiếp giữa người mua và gian hàng.",
};

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-[560px] bg-[#f7f9ff]" />}>
      <ChatScreen />
    </Suspense>
  );
}
