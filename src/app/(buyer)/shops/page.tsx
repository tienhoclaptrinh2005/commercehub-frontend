import type { Metadata } from "next";

import { ShopDirectoryScreen } from "@/components/shop/ShopDirectoryScreen";

export const metadata: Metadata = {
  title: "Danh sách người bán",
  description:
    "Khám phá các gian hàng đang hoạt động và người bán đã được duyệt trên CommerceHub.",
};

export default function ShopsPage() {
  return <ShopDirectoryScreen />;
}
