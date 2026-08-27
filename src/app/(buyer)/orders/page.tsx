import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { OrderHistoryScreen } from "@/components/order/OrderHistoryScreen";

export const metadata: Metadata = {
  title: "Lịch sử đơn hàng | CommerceHub",
  description: "Theo dõi lịch sử các đơn hàng đã mua trên CommerceHub.",
};

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrderHistoryScreen />
    </ProtectedRoute>
  );
}
