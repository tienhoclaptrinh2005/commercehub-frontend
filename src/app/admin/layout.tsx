import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s | CommerceHub Admin" } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="lg:pl-64">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
