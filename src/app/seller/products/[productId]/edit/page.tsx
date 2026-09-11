import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SellerProductCreateScreen } from "@/components/seller/products/SellerProductCreateScreen";

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm",
};

export default async function SellerProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const parsedProductId = Number(productId);
  if (!Number.isSafeInteger(parsedProductId) || parsedProductId <= 0) {
    notFound();
  }
  return <SellerProductCreateScreen productId={parsedProductId} />;
}
