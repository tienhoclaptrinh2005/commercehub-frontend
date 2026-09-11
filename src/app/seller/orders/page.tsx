import type { Metadata } from "next";

import { SellerOrdersScreen } from "@/components/seller/orders/SellerOrdersScreen";

export const metadata: Metadata = { title: "Tất cả đơn hàng" };

export default function SellerOrdersPage() {
  return <SellerOrdersScreen />;
}
