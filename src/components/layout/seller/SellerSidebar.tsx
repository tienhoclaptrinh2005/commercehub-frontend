"use client";

import { ArrowLeft, ExternalLink, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/auth/BrandLogo";
import { useSellerNotifications } from "@/hooks/api/useSellerNotifications";

import { sellerNavigation, type SellerNavigationItem } from "./navigation";

function isRouteMatch(pathname: string, item: SellerNavigationItem) {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function SellerNavigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const { data: notifications } = useSellerNotifications();
  const activeHref = sellerNavigation
    .filter((item) => item.available && isRouteMatch(pathname, item))
    .reduce(
      (mostSpecific, item) =>
        item.href.length > mostSpecific.length ? item.href : mostSpecific,
      "",
    );

  function notificationCount(item: SellerNavigationItem) {
    if (!notifications || !item.notificationKey) return 0;
    if (item.notificationKey === "recentInstantOrders") {
      return notifications.recentInstantOrderCount;
    }
    if (item.notificationKey === "activePreOrders") {
      return notifications.newPreOrderRequestCount + notifications.processingPreOrderCount;
    }
    if (item.notificationKey === "activeDisputes") {
      return notifications.activeDisputeCount;
    }
    return notifications.withdrawalUpdateCount ?? 0;
  }

  return (
    <nav className="space-y-1" aria-label="Quản lý bán hàng">
      {sellerNavigation.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;
        const badgeCount = notificationCount(item);
        const className = `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
          active
            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
            : item.available
              ? "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              : "cursor-not-allowed text-slate-400"
        }`;

        return (
          <div
            key={item.href}
            className={item.dividerBefore ? "mt-3 border-t border-slate-100 pt-3" : undefined}
          >
            {!item.available ? (
              <span className={className} title="Tính năng sẽ được xây dựng sau">
                <Icon className="size-[18px] shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {!compact ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Sắp có
                  </span>
                ) : null}
              </span>
            ) : (
              <Link href={item.href} className={className} aria-current={active ? "page" : undefined}>
                <Icon className="size-[18px] shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {badgeCount > 0 ? (
                  <span
                    className="grid min-w-5 shrink-0 place-items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-black leading-4 text-white shadow-sm ring-2 ring-white"
                    title={`${badgeCount} mục cần theo dõi`}
                    aria-label={`${badgeCount} mục cần theo dõi`}
                  >
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                ) : null}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function SellerSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="border-b border-slate-100 px-5 py-5">
        <BrandLogo />
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
          <Store className="size-4" />
          Kênh người bán
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <SellerNavigation />
      </div>

      <div className="space-y-1 border-t border-slate-100 p-4">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="size-[18px]" />
          Về trang mua hàng
        </Link>
        <Link
          href="/profile"
          className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <ExternalLink className="size-[18px]" />
          Hồ sơ tài khoản
        </Link>
      </div>
    </aside>
  );
}
