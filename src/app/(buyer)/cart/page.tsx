import type { Metadata } from "next";

import { CartScreen } from "@/components/cart/CartScreen";

export const metadata: Metadata = {
  title: "Giỏ hàng | CommerceHub",
  description: "Quản lý và thanh toán các sản phẩm trong giỏ hàng.",
};

export default function CartPage() {
  return <CartScreen />;
}
