import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { ProductsCatalog } from "@/components/product/ProductsCatalog";

export const metadata: Metadata = {
  title: "Dịch vụ đặt trước | CommerceHub",
  description: "Khám phá các dịch vụ số được người bán tiếp nhận và xử lý theo đơn đặt trước.",
};

export default function ServicesPage() {
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
          <span className="text-slate-500">Dịch vụ</span>
        </nav>

        <div className="mt-5">
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-slate-950">
            Dịch vụ đặt trước
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Các dịch vụ được shop tiếp nhận sau khi thanh toán và xử lý trong thời gian đã công bố.
          </p>
        </div>

        <div className="mt-10">
          <ProductsCatalog deliveryType="PRE_ORDER" catalogLabel="dịch vụ" />
        </div>
      </div>
    </div>
  );
}
