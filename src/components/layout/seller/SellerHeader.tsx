"use client";

import { Bell, Menu, MessageSquareText, Store, X } from "lucide-react";
import Link from "next/link";

import { AuthStatus } from "@/components/auth/AuthStatus";
import { BrandLogo } from "@/components/auth/BrandLogo";
import { useSellerNotifications } from "@/hooks/api/useSellerNotifications";
import { ChatUnreadBadge } from "@/components/chat/ChatUnreadBadge";

import { SellerNavigation } from "./SellerSidebar";

export function SellerHeader() {
  const { data: notifications } = useSellerNotifications();
  const notificationCount = notifications
    ? notifications.recentInstantOrderCount
      + notifications.newPreOrderRequestCount
      + notifications.processingPreOrderCount
      + notifications.activeDisputeCount
      + (notifications.withdrawalUpdateCount ?? 0)
    : 0;
  const nonWithdrawalCount = notifications
    ? notifications.recentInstantOrderCount
      + notifications.newPreOrderRequestCount
      + notifications.processingPreOrderCount
      + notifications.activeDisputeCount
    : 0;
  const notificationHref = (notifications?.withdrawalUpdateCount ?? 0) > 0 && nonWithdrawalCount === 0
    ? "/seller/wallet/withdraw"
    : "/seller/orders";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <details className="group relative lg:hidden">
            <summary
              className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 [&::-webkit-details-marker]:hidden"
              aria-label="Mở hoặc đóng menu người bán"
            >
              <Menu className="size-5 group-open:hidden" />
              <X className="hidden size-5 group-open:block" />
            </summary>
            <div className="absolute left-0 top-12 w-[min(310px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/15">
              <div className="mb-3 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
                Kênh người bán
              </div>
              <SellerNavigation compact />
            </div>
          </details>

          <div className="[&>a>span:last-child]:hidden sm:[&>a>span:last-child]:inline lg:hidden">
            <BrandLogo />
          </div>

          <div className="hidden lg:block">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Store className="size-4 text-violet-600" />
              Kênh người bán
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Quản lý hoạt động kinh doanh của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/chat"
            className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            aria-label="Tin nhắn"
            title="Tin nhắn"
          >
            <MessageSquareText className="size-[18px]" />
            <ChatUnreadBadge />
          </Link>
          <Link
            href={notificationHref}
            className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            aria-label={`${notificationCount} hoạt động bán hàng cần theo dõi`}
            title={`${notificationCount} hoạt động bán hàng cần theo dõi`}
          >
            <Bell className="size-[18px]" />
            {notificationCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1 text-[10px] font-black leading-5 text-white ring-2 ring-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </Link>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
