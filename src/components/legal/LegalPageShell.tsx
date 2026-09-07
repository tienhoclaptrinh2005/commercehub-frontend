import type { LucideIcon } from "lucide-react";
import { CalendarDays, ChevronRight, Headphones, House } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type LegalSectionLink = {
  id: string;
  label: string;
};

type LegalPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  icon: LucideIcon;
  sections: readonly LegalSectionLink[];
  children: ReactNode;
};

export function LegalPageShell({
  eyebrow,
  title,
  description,
  updatedAt,
  icon: Icon,
  sections,
  children,
}: LegalPageShellProps) {
  return (
    <div className="bg-[#f4f7f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <nav
          className="flex flex-wrap items-center gap-1.5 text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            <House className="size-3.5" />
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-500">{title}</span>
        </nav>

        <header className="relative mt-5 overflow-hidden rounded-3xl bg-emerald-900 px-6 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-9 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-24 size-72 rounded-full bg-emerald-400/20 blur-2xl"
          />
          <div className="relative flex max-w-3xl items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-emerald-200 ring-1 ring-white/15 sm:size-14">
              <Icon className="size-6 sm:size-7" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-200">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
                {title}
              </h1>
              <p className="mt-3 text-sm leading-6 text-emerald-50/80 sm:text-base sm:leading-7">
                {description}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <CalendarDays className="size-3.5" />
                Cập nhật lần cuối: {updatedAt}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-7 grid items-start gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-5">
            <h2 className="text-sm font-black uppercase tracking-[0.1em] text-slate-900">
              Nội dung chính
            </h2>
            <nav className="mt-4" aria-label={`Mục lục ${title.toLowerCase()}`}>
              <ol className="space-y-1.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`}
                      className="group flex gap-2 rounded-lg px-2.5 py-2 text-sm leading-5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <span className="font-bold tabular-nums text-emerald-700">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3.5">
                <Headphones className="mt-0.5 size-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-sm font-bold text-emerald-950">Cần hỗ trợ?</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-900/70">
                    Liên hệ đội ngũ CommerceHub nếu bạn cần làm rõ quyền lợi của
                    một giao dịch.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-2 inline-block text-xs font-bold text-emerald-800 underline underline-offset-2"
                  >
                    Đi đến trang liên hệ
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-[15px] leading-7 text-slate-600 shadow-sm sm:p-8 lg:p-10">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
}
