"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ChevronRight,
  CircleHelp,
  Globe2,
  KeyRound,
  Megaphone,
  Newspaper,
  PackageOpen,
  ShoppingBag,
  Tag,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { useCategories } from "@/hooks/api/useCategories";
import type { CategorySummary } from "@/types";

function getCategoryIcon(category: CategorySummary): LucideIcon {
  const value = `${category.name} ${category.slug}`.toLowerCase();

  if (value.includes("tool") || value.includes("cong-cu")) return Wrench;
  if (value.includes("quang-cao") || value.includes("ads")) return Megaphone;
  if (value.includes("web") || value.includes("extension")) return Globe2;
  if (value.includes("workflow") || value.includes("n8n")) return Bot;
  if (value.includes("tai-khoan") || value.includes("account")) return KeyRound;
  return Tag;
}

export function HomeCategorySidebar() {
  const { categories, isLoading, error, refresh } = useCategories();

  return (
    <aside className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white lg:block">
      <div className="flex items-center gap-2 bg-emerald-700 px-4 py-3 text-sm font-bold text-white">
        <ShoppingBag className="size-4" />
        Danh mục sản phẩm
      </div>

      <nav className="py-2" aria-label="Danh mục sản phẩm">
        {isLoading ? (
          <div
            className="space-y-3 px-4 py-2"
            aria-label="Đang tải danh mục sản phẩm"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-6 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="px-4 py-5 text-center">
            <PackageOpen className="mx-auto size-6 text-slate-400" />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Chưa thể tải danh mục sản phẩm.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Thử lại
            </button>
          </div>
        ) : categories.length === 0 ? (
          <p className="px-4 py-5 text-center text-xs leading-5 text-slate-500">
            Chưa có danh mục đang hoạt động.
          </p>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = getCategoryIcon(category);

              return (
                <div key={category.id}>
                  <Link
                    href={`/products?categoryId=${category.id}`}
                    className="group flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {category.iconUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={category.iconUrl}
                        alt=""
                        className="size-4 shrink-0 object-contain"
                      />
                    ) : (
                      <Icon className="size-4 shrink-0 text-slate-500 transition group-hover:text-emerald-600" />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {category.name}
                    </span>
                    <ChevronRight className="size-3.5 shrink-0 text-slate-400" />
                  </Link>

                  {category.children.length > 0 ? (
                    <div className="mx-4 mb-1 border-l border-slate-200 pl-3">
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/products?categoryId=${child.id}`}
                          className="block truncate rounded-r-md px-2 py-1.5 text-xs text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-2 border-t border-slate-100 pt-2">
          <Link
            href="/news"
            className="group flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Newspaper className="size-4 text-slate-500 group-hover:text-emerald-600" />
            <span className="flex-1">Tin tức</span>
            <ChevronRight className="size-3.5 text-slate-400" />
          </Link>
          <Link
            href="/contact"
            className="group flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <CircleHelp className="size-4 text-slate-500 group-hover:text-emerald-600" />
            <span className="flex-1">Trung tâm trợ giúp</span>
            <ChevronRight className="size-3.5 text-slate-400" />
          </Link>
        </div>
      </nav>
    </aside>
  );
}
