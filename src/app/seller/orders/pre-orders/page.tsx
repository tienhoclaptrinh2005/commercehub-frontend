import type { Metadata } from "next";

import { SellerOrdersScreen } from "@/components/seller/orders/SellerOrdersScreen";

export const metadata: Metadata = { title: "Đơn đặt hàng" };

export default function SellerPreOrdersPage() {
  return <SellerOrdersScreen deliveryType="PRE_ORDER" />;
}
