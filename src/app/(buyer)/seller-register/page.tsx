import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SellerRegistrationScreen } from "@/components/shop/SellerRegistrationScreen";

export const metadata: Metadata = {
  title: "Đăng ký bán hàng",
  description: "Gửi yêu cầu đăng ký trở thành người bán trên CommerceHub.",
};

export default function SellerRegisterPage() {
  return (
    <ProtectedRoute allowedRoles={["BUYER"]}>
      <SellerRegistrationScreen />
    </ProtectedRoute>
  );
}
