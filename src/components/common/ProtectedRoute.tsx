"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/auth/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/login");
    }
  }, [isHydrated, router, user]);

  if (!isHydrated || !user) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-[1200px] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          {isHydrated ? (
            <ShieldCheck className="size-5 text-emerald-600" />
          ) : (
            <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          )}
          {isHydrated ? "Đang chuyển đến trang đăng nhập..." : "Đang kiểm tra phiên đăng nhập..."}
        </div>
      </div>
    );
  }

  return children;
}
