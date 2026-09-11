import type { Metadata } from "next";

import { SellerOrdersScreen } from "@/components/seller/orders/SellerOrdersScreen";

export const metadata: Metadata = { title: "Đơn giao ngay" };

export default function SellerInstantOrdersPage() {
  return <SellerOrdersScreen deliveryType="INSTANT" />;
}
