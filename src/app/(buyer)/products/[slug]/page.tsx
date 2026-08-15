import type { Metadata } from "next";

import { ProductDetailScreen } from "@/components/product/ProductDetailScreen";

export const metadata: Metadata = {
  title: "Chi tiết sản phẩm | CommerceHub",
  description: "Xem thông tin, phân loại và giá bán sản phẩm trên CommerceHub.",
};

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;

  return (
    <div className="min-h-full bg-[#f4f7f6]">
      <ProductDetailScreen slug={slug} />
    </div>
  );
}
