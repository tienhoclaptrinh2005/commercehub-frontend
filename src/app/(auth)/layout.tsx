import { BadgeCheck, ShieldCheck, Sparkles, WalletCards, Zap } from "lucide-react";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/auth/BrandLogo";
import { GoogleIdentityProvider } from "@/components/auth/GoogleIdentityProvider";

const benefits = [
  { icon: ShieldCheck, text: "Bảo vệ giao dịch minh bạch" },
  { icon: Zap, text: "Nhận sản phẩm số tức thì" },
  { icon: WalletCards, text: "Thanh toán ví an toàn" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleIdentityProvider>
      <main className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(430px,0.9fr)_minmax(560px,1.1fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-emerald-950 px-12 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-28 -top-28 size-96 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 size-[440px] rounded-full bg-teal-400/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:52px_52px]" />
        </div>

        <div className="relative z-10">
          <BrandLogo light />
        </div>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
            <Sparkles className="size-4 text-emerald-300" />
            Marketplace dành cho sản phẩm số
          </div>
          <h2 className="max-w-lg text-4xl font-bold leading-[1.12] tracking-[-0.045em] xl:text-5xl">
            Mua bán sản phẩm số,
            <span className="block text-emerald-300">an tâm trong từng giao dịch.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-emerald-100/70">
            CommerceHub kết nối người mua và nhà bán hàng trên một nền tảng nhanh,
            rõ ràng và được bảo vệ.
          </p>

          <div className="mt-9 grid gap-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm font-medium text-emerald-50">
                <span className="grid size-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                  <Icon className="size-[18px]" />
                </span>
                {text}
              </div>
            ))}
          </div>

          <div className="mt-10 max-w-md rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white text-emerald-700">
                <BadgeCheck className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Giao dịch được kiểm soát</p>
                <p className="mt-0.5 text-xs text-emerald-100/60">Luồng ví và đơn hàng tách biệt, rõ ràng</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-emerald-100/45">
          © {new Date().getFullYear()} CommerceHub. Nền tảng giao dịch số.
        </p>
      </section>

      <section className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_right,#ecfdf5_0,transparent_34%)]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:hidden">
          <BrandLogo />
        </header>
        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
          {children}
        </div>
      </section>
      </main>
    </GoogleIdentityProvider>
  );
}
