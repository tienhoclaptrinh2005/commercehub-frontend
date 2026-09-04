import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { ProductsCatalog } from "@/components/product/ProductsCatalog";

export const metadata: Metadata = {
  title: "Sản phẩm | CommerceHub",
  description: "Khám phá sản phẩm số đang được bán trên CommerceHub.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    categoryId?: string | string[];
    keyword?: string | string[];
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const rawCategoryId = Array.isArray(params.categoryId)
    ? params.categoryId[0]
    : params.categoryId;
  const parsedCategoryId = rawCategoryId ? Number(rawCategoryId) : undefined;
  const initialCategoryId =
    parsedCategoryId && Number.isSafeInteger(parsedCategoryId) && parsedCategoryId > 0
      ? parsedCategoryId
      : undefined;
  const rawKeyword = Array.isArray(params.keyword)
    ? params.keyword[0]
    : params.keyword;
  const initialKeyword = rawKeyword?.trim().slice(0, 100) || undefined;

  return (
    <div className="bg-[#f4f7f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/"
            className="font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-500">Sản phẩm</span>
        </nav>

        <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-slate-950">
          Sản phẩm
        </h1>

        <div className="mt-12">
          <ProductsCatalog
            key={`${initialCategoryId ?? "all"}:${initialKeyword ?? ""}`}
            initialCategoryId={initialCategoryId}
            initialKeyword={initialKeyword}
          />
        </div>
      </div>
    </div>
  );
}
