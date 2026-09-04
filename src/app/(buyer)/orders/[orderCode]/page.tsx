import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { OrderDetailScreen } from "@/components/order/OrderDetailScreen";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng | CommerceHub",
};

export default async function OrderDetailPage({
  params,
}: PageProps<"/orders/[orderCode]">) {
  const { orderCode } = await params;
  return (
    <ProtectedRoute>
      <OrderDetailScreen orderCode={orderCode} />
    </ProtectedRoute>
  );
}
