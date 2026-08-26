import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";

export const metadata: Metadata = { title: { default: "Quản trị", template: "%s | CommerceHub Admin" } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 sm:px-6"><Link href="/admin" className="font-black text-slate-950">CommerceHub Admin</Link><nav className="flex gap-4 text-sm font-bold"><Link href="/admin/disputes" className="text-violet-700">Khiếu nại</Link><Link href="/" className="text-slate-600">Về trang chính</Link></nav></div></header>
        {children}
      </div>
    </ProtectedRoute>
  );
}
