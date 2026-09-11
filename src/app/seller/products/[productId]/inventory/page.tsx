import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SellerProductInventoryScreen } from "@/components/seller/products/SellerProductInventoryScreen";

export const metadata: Metadata = {
  title: "Quản lý kho sản phẩm",
};

export default async function SellerProductInventoryPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const parsedProductId = Number(productId);
  if (!Number.isSafeInteger(parsedProductId) || parsedProductId <= 0) {
    notFound();
  }
  return <SellerProductInventoryScreen productId={parsedProductId} />;
}
