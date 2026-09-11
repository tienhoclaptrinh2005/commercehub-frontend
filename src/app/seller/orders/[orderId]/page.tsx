import type { Metadata } from "next";

import { SellerOrderDetailScreen } from "@/components/seller/orders/SellerOrderDetailScreen";

export const metadata: Metadata = { title: "Chi tiết đơn bán" };

export default async function SellerOrderDetailPage(
  props: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await props.params;
  return <SellerOrderDetailScreen orderId={Number(orderId)} />;
}
