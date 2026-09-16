import { Client } from "@stomp/stompjs";

const apiBase = (process.env.CHAT_UAT_API_URL || "http://localhost:8080").replace(/\/$/, "");
const wsUrl = process.env.CHAT_UAT_WS_URL || `${apiBase.replace(/^http/, "ws")}/ws/chat`;
const buyerEmail = process.env.CHAT_UAT_BUYER_EMAIL || "buyer@commercehub.test";
const sellerEmail = process.env.CHAT_UAT_SELLER_EMAIL || "seller@commercehub.test";
const password = process.env.CHAT_UAT_PASSWORD || "Test@123456";

async function request(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(`${method} ${path}: ${payload.message || response.status}`);
  return payload.data;
}

async function login(email) {
  return request("/api/v1/auth/login", { method: "POST", body: { email, password, deviceId: `chat-uat-${email}` } });
}

function connect(token, events) {
  return new Promise((resolve, reject) => {
    const client = new Client({
      webSocketFactory: () => new WebSocket(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 0,
      connectionTimeout: 8_000,
      debug: () => undefined,
      onConnect: () => {
        client.subscribe("/user/queue/chat", (frame) => events.push(JSON.parse(frame.body)));
        client.subscribe("/user/queue/chat-errors", (frame) => reject(new Error(JSON.parse(frame.body).message)));
        resolve(client);
      },
      onStompError: (frame) => reject(new Error(frame.headers.message || frame.body)),
      onWebSocketError: () => reject(new Error("WebSocket connection failed")),
    });
    client.activate();
  });
}

async function waitFor(predicate, timeoutMs = 12_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = predicate();
    if (value) return value;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Timed out waiting for realtime chat event");
}

const buyer = await login(buyerEmail);
const seller = await login(sellerEmail);
if (!seller.shopId) throw new Error("Seed seller does not have a shop");

const conversation = await request("/api/v1/chat/conversations", {
  token: buyer.accessToken,
  method: "POST",
  body: { shopId: seller.shopId },
});

const buyerEvents = [];
const sellerEvents = [];
let buyerClient = await connect(buyer.accessToken, buyerEvents);
const sellerClient = await connect(seller.accessToken, sellerEvents);

const firstClientId = crypto.randomUUID();
buyerClient.publish({
  destination: "/app/chat.send",
  body: JSON.stringify({ conversationId: conversation.id, clientMessageId: firstClientId, messageType: "TEXT", content: "UAT buyer → seller" }),
});

const sellerEvent = await waitFor(() => sellerEvents.find((event) => event.message?.clientMessageId === firstClientId));
await waitFor(() => buyerEvents.find((event) => event.message?.clientMessageId === firstClientId));

const sellerUnreadBefore = await request("/api/v1/chat/unread-count", { token: seller.accessToken });
if (sellerUnreadBefore.unreadCount < 1) throw new Error("Seller unread badge was not incremented");
await request(`/api/v1/chat/conversations/${conversation.id}/read`, {
  token: seller.accessToken,
  method: "POST",
  body: { throughMessageId: sellerEvent.message.id },
});
const sellerUnreadAfter = await request("/api/v1/chat/unread-count", { token: seller.accessToken });
if (sellerUnreadAfter.unreadCount !== 0) throw new Error("Seller unread badge was not cleared after read");

await buyerClient.deactivate();
const missedClientId = crypto.randomUUID();
sellerClient.publish({
  destination: "/app/chat.send",
  body: JSON.stringify({ conversationId: conversation.id, clientMessageId: missedClientId, messageType: "TEXT", content: "UAT reconnect catch-up" }),
});
await waitFor(() => sellerEvents.find((event) => event.message?.clientMessageId === missedClientId));

buyerClient = await connect(buyer.accessToken, buyerEvents);
const missedPage = await request(`/api/v1/chat/conversations/${conversation.id}/messages?afterId=${sellerEvent.message.id}&size=100`, {
  token: buyer.accessToken,
});
if (!missedPage.messages.some((message) => message.clientMessageId === missedClientId)) {
  throw new Error("REST catch-up did not return the message missed while disconnected");
}

await Promise.all([buyerClient.deactivate(), sellerClient.deactivate()]);
console.log(JSON.stringify({
  ok: true,
  conversationId: conversation.id,
  realtimeDeliveredToBuyerAndSeller: true,
  unreadBadgeAndReadState: true,
  reconnectCatchUpViaRest: true,
}));
