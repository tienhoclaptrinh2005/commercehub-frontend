"use client";

import { ArrowLeft, ExternalLink, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { BrandLogo } from "@/components/auth/BrandLogo";

import { sellerNavigation, type SellerNavigationItem } from "./navigation";

function isNavigationActive(pathname: string, item: SellerNavigationItem) {
  if (item.href === "/seller") return pathname === item.href;
  return pathname.startsWith(item.href);
}

export function SellerNavigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="Quản lý bán hàng">
      {sellerNavigation.map((item) => {
        const Icon = item.icon;
        const active = isNavigationActive(pathname, item);
        const className = `group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${
          active
            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
            : item.available
              ? "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              : "cursor-not-allowed text-slate-400"
        }`;

        return (
          <Fragment key={item.href}>
            {item.section ? (
              <p className="px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 first:pt-0">
                {item.section}
              </p>
            ) : null}
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
              <Link href={item.href} className={className}>
                <Icon className="size-[18px] shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            )}
          </Fragment>
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
