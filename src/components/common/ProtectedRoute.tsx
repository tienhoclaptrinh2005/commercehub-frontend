"use client";

import { LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: readonly UserRole[];
  unauthorizedHref?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  unauthorizedHref = "/",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const isAuthorized =
    !allowedRoles?.length || Boolean(user?.roles.some((role) => allowedRoles.includes(role)));

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace("/login");
      return;
    }

    if (isHydrated && user && !isAuthorized) {
      router.replace(unauthorizedHref);
    }
  }, [isAuthorized, isHydrated, router, unauthorizedHref, user]);

  if (!isHydrated || !user || !isAuthorized) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-[1200px] items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          {isHydrated ? (
            <ShieldCheck className="size-5 text-emerald-600" />
          ) : (
            <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          )}
          {!isHydrated
            ? "Đang kiểm tra phiên đăng nhập..."
            : !user
              ? "Đang chuyển đến trang đăng nhập..."
              : "Tài khoản không có quyền truy cập trang này..."}
        </div>
      </div>
    );
  }

  return children;
}
