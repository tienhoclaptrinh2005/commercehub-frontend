import type { Metadata } from "next";

import { SellerVouchersScreen } from "@/components/seller/vouchers/SellerVouchersScreen";

export const metadata: Metadata = { title: "Mã giảm giá" };

export default function SellerVouchersPage() {
  return <SellerVouchersScreen />;
}
