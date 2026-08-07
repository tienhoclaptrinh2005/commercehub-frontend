import { ArrowRight, BadgeCheck, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

import { AuthStatus } from "@/components/auth/AuthStatus";
import { BrandLogo } from "@/components/auth/BrandLogo";

export default function BuyerHomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <BrandLogo />
          <AuthStatus />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="size-4" />
            CommerceHub đã sẵn sàng
          </span>
          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-[-0.045em] text-slate-950 sm:text-6xl">
            Giao dịch sản phẩm số theo cách an tâm hơn.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Phần xác thực frontend đã kết nối với API CommerceHub. Bạn có thể đăng ký,
            đăng nhập và duy trì phiên bằng refresh token.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700"
            >
              Bắt đầu ngay <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        <div className="relative rounded-[32px] border border-emerald-100 bg-emerald-950 p-8 text-white shadow-2xl shadow-emerald-950/20 sm:p-12">
          <div className="absolute right-6 top-6 size-32 rounded-full bg-emerald-400/20 blur-3xl" />
          <p className="text-sm font-semibold text-emerald-300">Hệ thống xác thực</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Sẵn sàng cho các portal tiếp theo</h2>
          <div className="mt-8 grid gap-4">
            {[
              [ShieldCheck, "JWT access token", "Tự động gắn Authorization cho API bảo vệ"],
              [Zap, "Refresh token", "Tự động làm mới và chạy lại request bị hết hạn"],
              [BadgeCheck, "Backend validation", "Hiển thị đúng thông báo lỗi ApiResponse"],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                    <FeatureIcon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{title as string}</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-100/60">{description as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
