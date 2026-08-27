import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { OrderDetailScreen } from "@/components/order/OrderDetailScreen";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng | CommerceHub",
};

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  return (
    <ProtectedRoute>
      <OrderDetailScreen orderId={Number(orderId)} />
    </ProtectedRoute>
  );
}
