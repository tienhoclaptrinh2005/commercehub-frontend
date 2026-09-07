import type { Metadata } from "next";

import { SellerProductCreateScreen } from "@/components/seller/products/SellerProductCreateScreen";

export const metadata: Metadata = {
  title: "Thêm sản phẩm",
};

export default function SellerProductCreatePage() {
  return <SellerProductCreateScreen />;
}
