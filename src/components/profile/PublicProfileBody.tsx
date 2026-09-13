"use client";

import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  MessageSquareText,
  PackageOpen,
  RotateCw,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ProductCard } from "@/components/product/ProductCard";
import { formatDate } from "@/lib/format";
import type { ProductSummary, UserRole } from "@/types";

import { UserRoleBadges } from "./UserRoleBadges";

export interface PublicProfilePresentation {
  name: string;
  handle: string;
  avatarUrl: string | null;
  joinedAt: string;
  completedPurchaseCount: number;
  successfulSaleCount: number;
  statusLabel?: string;
  userLevel?: number;
  sellerEnabled: boolean;
  roles: UserRole[];
  messageHref: string;
  products?: ProductSummary[];
  productsLoading?: boolean;
  productsError?: string | null;
  onRetryProducts?: () => void;
}

interface PublicProfileBodyProps {
  profile: PublicProfilePresentation;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value ?? 0);
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function PublicProfileBody({ profile }: PublicProfileBodyProps) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const activeProducts = (profile.products ?? []).filter((product) => product.status === "ACTIVE");

  return (
    <div className="bg-[#f7f9ff]">
      <div className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-10">
        <nav className="mb-5 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
          <Link href="/" className="font-medium text-emerald-700 transition hover:text-emerald-800">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="truncate text-slate-500">{profile.name}</span>
        </nav>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-9">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-500 shadow-sm">
              {profile.avatarUrl && failedAvatarUrl !== profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatarUrl}
                  alt={`Ảnh đại diện ${profile.name}`}
                  className="size-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={() => setFailedAvatarUrl(profile.avatarUrl)}
                />
              ) : (
                <div className="grid size-full place-items-center bg-gradient-to-br from-emerald-400 to-emerald-700 p-5 text-center text-4xl font-bold tracking-[-0.04em] text-white">
                  {getInitials(profile.name)}
                </div>
              )}
              <span className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full border-4 border-white bg-emerald-700 text-white shadow-sm">
                <UserRound className="size-4" />
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
                      {profile.name}
                    </h1>
                    <UserRoleBadges roles={profile.roles} />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                    {!profile.sellerEnabled ? (
                      <>
                        <span className="font-medium text-slate-500">@{profile.handle}</span>
                        <span className="size-1 rounded-full bg-slate-300" />
                      </>
                    ) : null}
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      Thành viên cấp {profile.userLevel ?? 1}
                    </span>
                    {profile.statusLabel ? (
                      <>
                        <span className="size-1 rounded-full bg-slate-300" />
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          {profile.statusLabel}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>

                <Link
                  href={profile.messageHref}
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20"
                >
                  <MessageSquareText className="size-4" />
                  Nhắn tin
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <ProfileStat icon={CalendarDays} label="Ngày tham gia" value={formatDate(profile.joinedAt)} />
                <ProfileStat
                  icon={ShoppingBag}
                  label="Đơn mua hoàn thành"
                  value={formatCount(profile.completedPurchaseCount)}
                />
                <ProfileStat
                  icon={Truck}
                  label="Đơn bán thành công"
                  value={formatCount(profile.successfulSaleCount)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-9 border-t border-slate-200 pt-8 sm:mt-12 sm:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Gian hàng của người dùng</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">Sản phẩm đang bán</h2>
            </div>
            {!profile.productsLoading && !profile.productsError ? (
              <p className="text-sm text-slate-500">{formatCount(activeProducts.length)} sản phẩm</p>
            ) : null}
          </div>

          {profile.productsLoading ? (
            <PublicProductGridSkeleton />
          ) : profile.productsError ? (
            <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-bold text-amber-900">Chưa thể tải sản phẩm</p>
                <p className="mt-1 text-sm text-amber-800/80">{profile.productsError}</p>
              </div>
              {profile.onRetryProducts ? (
                <button
                  type="button"
                  onClick={profile.onRetryProducts}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-amber-900 px-4 text-sm font-bold text-white transition hover:bg-amber-950"
                >
                  <RotateCw className="size-4" />
                  Tải lại
                </button>
              ) : null}
            </div>
          ) : activeProducts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <PackageOpen className="size-7" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-950">
                {profile.sellerEnabled ? "Chưa có sản phẩm đang bán" : "Người dùng này chưa bán sản phẩm"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {profile.sellerEnabled
                  ? "Các sản phẩm mới sẽ được hiển thị tại đây khi đã sẵn sàng."
                  : "Gian hàng sẽ xuất hiện tại đây khi người dùng đủ điều kiện và bắt đầu bán hàng."}
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activeProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  sellerHandle={profile.handle}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProfileStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-24 items-center gap-3 rounded-xl border border-blue-100 bg-[#edf4ff] px-4 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">{label}</p>
        <p className="mt-1 truncate text-base font-bold text-slate-950 sm:text-lg" title={value}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function PublicProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[1200px] animate-pulse px-4 py-7 sm:px-6 sm:py-10" aria-label="Đang tải hồ sơ">
      <div className="h-5 w-44 rounded bg-slate-200" />
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[190px_minmax(0,1fr)]">
          <div className="aspect-square rounded-2xl bg-slate-200" />
          <div>
            <div className="h-9 w-3/5 rounded bg-slate-200" />
            <div className="mt-3 h-5 w-52 rounded bg-slate-100" />
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-24 rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 h-8 w-56 rounded bg-slate-200" />
      <PublicProductGridSkeleton />
    </div>
  );
}

export function PublicProfileError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[520px] max-w-[1200px] items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="size-6" />
        </span>
        <h1 className="mt-4 text-xl font-bold text-slate-950">Không thể hiển thị hồ sơ</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800"
          >
            <RotateCw className="size-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

function PublicProductGridSkeleton() {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Đang tải sản phẩm">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-[4/3] bg-slate-200" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-4/5 rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-100" />
            <div className="h-6 w-1/2 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
