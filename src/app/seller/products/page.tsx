import type { Metadata } from "next";

import { SellerProductsScreen } from "@/components/seller/products/SellerProductsScreen";

export const metadata: Metadata = {
  title: "Quản lý sản phẩm",
};

export default function SellerProductsPage() {
  return <SellerProductsScreen />;
}
