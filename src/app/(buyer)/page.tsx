import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  KeyRound,
  Megaphone,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";

import { HomeCategorySidebar } from "@/components/category/HomeCategorySidebar";

const products: Array<{
  title: string;
  price: string;
  eyebrow: string;
  href: string;
  icon: LucideIcon;
  style: string;
}> = [
  {
    title: "Tài khoản Facebook Ads",
    price: "250.000₫",
    eyebrow: "Tài khoản quảng cáo",
    href: "/products/facebook-ads",
    icon: Megaphone,
    style: "from-blue-700 via-blue-600 to-cyan-500",
  },
  {
    title: "Công cụ SEO Pro",
    price: "250.000₫",
    eyebrow: "Web & Tools",
    href: "/products/seo-pro",
    icon: SearchCheck,
    style: "from-indigo-700 via-violet-600 to-fuchsia-500",
  },
  {
    title: "Dịch vụ tăng tương tác",
    price: "240.000₫",
    eyebrow: "Tương tác mạng xã hội",
    href: "/products/tang-tuong-tac",
    icon: Heart,
    style: "from-rose-600 via-pink-500 to-orange-400",
  },
  {
    title: "Tài khoản TikTok Ads",
    price: "250.000₫",
    eyebrow: "Tài khoản quảng cáo",
    href: "/products/tiktok-ads",
    icon: Video,
    style: "from-slate-950 via-slate-800 to-emerald-600",
  },
];

const partners = ["CommerceHub Verified", "Digital Partner", "Workflows N8N", "Seller Pro", "Secure Pay"];

export default function BuyerHomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-[1200px] gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <HomeCategorySidebar />

        <div className="min-w-0">
          <div className="relative isolate overflow-hidden rounded-xl bg-emerald-900 px-6 py-9 text-white sm:px-10 sm:py-11">
            <div className="absolute -left-16 -top-24 -z-10 size-72 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="absolute -bottom-28 right-0 -z-10 size-80 rounded-full bg-emerald-500/25 blur-2xl" />
            <div className="absolute inset-y-0 right-0 -z-10 hidden w-[44%] items-center justify-center sm:flex">
              <div className="relative grid size-48 rotate-3 place-items-center rounded-[36px] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm">
                <Sparkles className="size-20 text-emerald-300" strokeWidth={1.4} />
                <span className="absolute -left-6 top-7 grid size-14 -rotate-12 place-items-center rounded-2xl bg-orange-400 text-emerald-950 shadow-xl">
                  <Megaphone className="size-7" />
                </span>
                <span className="absolute -bottom-4 right-5 grid size-12 rotate-6 place-items-center rounded-2xl bg-white text-emerald-700 shadow-xl">
                  <KeyRound className="size-6" />
                </span>
              </div>
            </div>

            <div className="max-w-xl sm:max-w-[55%]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                <ShieldCheck className="size-4" />
                Sản phẩm số đã kiểm duyệt
              </span>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
                Siêu sale sản phẩm số, giảm giá đến 50%
              </h1>
              <p className="mt-3 text-sm leading-6 text-emerald-100/75">
                Khám phá công cụ, tài khoản và dịch vụ giúp công việc trực tuyến hiệu quả hơn.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-400 px-5 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
              >
                Khám phá ngay
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Khám phá</p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.025em] text-slate-950">Sản phẩm mới nhất</h2>
            </div>
            <Link href="/products" className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:flex">
              Xem tất cả <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map(({ title, price, eyebrow, href, icon: Icon, style }) => (
              <article
                key={href}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/5"
              >
                <Link href={href} className="block p-1.5">
                  <div className={`relative flex aspect-[1.65/1] items-end overflow-hidden rounded-md bg-gradient-to-br p-4 text-white ${style}`}>
                    <div className="absolute right-3 top-3 grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <Icon className="size-5" />
                    </div>
                    <p className="max-w-[85%] text-base font-bold leading-5">{eyebrow}</p>
                  </div>
                </Link>
                <div className="px-3 pb-3 pt-2">
                  <Link href={href} className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 group-hover:text-emerald-700">
                    {title}
                  </Link>
                  <p className="mt-1 text-sm font-bold text-slate-950">{price}</p>
                  <Link
                    href={href}
                    className="mt-3 flex h-9 items-center justify-center rounded-md bg-emerald-500 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
                  >
                    Mua ngay
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6">
          <h2 className="text-lg font-bold text-slate-900">Đối tác hàng đầu</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex h-14 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-600"
              >
                <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
