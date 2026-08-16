"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/auth/useAuth";

export function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();

  useEffect(() => {
    if (isHydrated && user) {
      router.replace("/");
    }
  }, [isHydrated, router, user]);

  if (!isHydrated || user) {
    return (
      <main className="grid min-h-screen place-items-center bg-white">
        <div
          className="flex items-center gap-3 text-sm font-semibold text-slate-600"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          {isHydrated ? "Đang chuyển về trang chủ..." : "Đang kiểm tra phiên đăng nhập..."}
        </div>
      </main>
    );
  }

  return children;
}
