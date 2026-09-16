import type { Metadata } from "next";

import { ChatScreen } from "@/components/chat/ChatScreen";

export const metadata: Metadata = {
  title: "Tin nhắn",
  description: "Trao đổi trực tiếp giữa người mua và gian hàng.",
};

export default function ChatPage() {
  return <ChatScreen />;
}
