import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { SellerHeader } from "@/components/layout/seller/SellerHeader";
import { SellerSidebar } from "@/components/layout/seller/SellerSidebar";

export const metadata: Metadata = {
  title: {
    default: "Kênh người bán",
    template: "%s | Kênh người bán CommerceHub",
  },
  description: "Quản lý gian hàng, sản phẩm và đơn hàng trên CommerceHub.",
};

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["SELLER"]}>
      <div className="min-h-screen bg-[#f5f7fb]">
        <SellerSidebar />
        <div className="min-h-screen lg:pl-64">
          <SellerHeader />
          <main>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
