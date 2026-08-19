import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  CirclePlay,
  Clock3,
  Globe2,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Rss,
  Send,
} from "lucide-react";
import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Liên hệ | CommerceHub",
  description:
    "Liên hệ đội ngũ hỗ trợ CommerceHub để được giải đáp và hỗ trợ tài khoản.",
};

const contactItems: Array<{
  icon: LucideIcon;
  title: string;
  lines: string[];
  href?: string;
}> = [
  {
    icon: Clock3,
    title: "Giờ làm việc",
    lines: ["Thứ Hai - Chủ Nhật", "08:00 - 22:00"],
  },
  {
    icon: Send,
    title: "Telegram",
    lines: ["@commercehub_support"],
    href: "https://t.me/commercehub_support",
  },
  {
    icon: Phone,
    title: "Hotline",
    lines: ["0900 000 000"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["support@commercehub.example"],
  },
  {
    icon: MapPin,
    title: "Địa chỉ",
    lines: ["Thành phố Hồ Chí Minh", "Việt Nam"],
  },
];

const socialLinks: Array<{
  icon: LucideIcon;
  label: string;
  href: string;
}> = [
  { icon: MessageCircle, label: "Cộng đồng", href: "/community" },
  { icon: CirclePlay, label: "Video", href: "/videos" },
  {
    icon: Send,
    label: "Telegram",
    href: "https://t.me/commercehub_support",
  },
  { icon: Globe2, label: "Website", href: "/" },
  { icon: Rss, label: "RSS", href: "/rss.xml" },
];

export default function ContactPage() {
  return (
    <div className="bg-[#f4f7f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <nav
          className="flex items-center gap-1.5 text-sm"
          aria-label="Breadcrumb"
        >
          <Link
            href="/"
            className="font-medium text-emerald-600 transition hover:text-emerald-700"
          >
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-500">Liên hệ</span>
        </nav>

        <div className="mt-5 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Chúng tôi luôn lắng nghe
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Liên hệ với chúng tôi
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Đội ngũ CommerceHub sẽ cố gắng tiếp nhận và giải quyết thắc mắc của
            bạn nhanh nhất có thể.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)]">
          <ContactForm />

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Headphones className="size-5" />
                </span>
                <div>
                  <h2 className="font-bold text-slate-950">
                    Thông tin liên hệ
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Dữ liệu minh họa cho giao diện
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
                {contactItems.map(({ icon: Icon, title, lines, href }) => {
                  const content = (
                    <>
                      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-emerald-700 transition group-hover:bg-emerald-100">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 transition group-hover:text-emerald-700">
                          {title}
                        </h3>
                        <div className="mt-1 text-sm leading-5 text-slate-500">
                          {lines.map((line) => (
                            <p key={line}>{line}</p>
                          ))}
                        </div>
                      </div>
                    </>
                  );

                  return href ? (
                    <Link
                      key={title}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group -m-2 flex items-start gap-3 rounded-xl p-2 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      aria-label={`Mở ${title} trên trang web`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={title} className="group flex items-start gap-3">
                      {content}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="font-bold text-slate-950">
                Kết nối với chúng tôi
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                Theo dõi các kênh cộng đồng để nhận cập nhật mới nhất.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    title={label}
                    className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <Icon className="size-[18px]" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <MessageCircle className="size-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-emerald-900">
                Hỗ trợ nhanh chóng
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-800/70">
                Đội ngũ hỗ trợ luôn sẵn sàng đồng hành cùng bạn trong khung giờ
                làm việc.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
