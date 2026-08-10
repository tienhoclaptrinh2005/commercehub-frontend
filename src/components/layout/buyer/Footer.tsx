import type { LucideIcon } from "lucide-react";
import { Camera, CirclePlay, Mail, MessageCircle, Rss, Send } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  "Danh mục": [
    ["Sản phẩm", "/products"],
    ["Dịch vụ", "/categories/dich-vu"],
    ["Web, Tools, Extension", "/categories/web-tools-extension"],
    ["Workflows N8N", "/categories/workflows-n8n"],
  ],
  "Liên kết nhanh": [
    ["Trang chủ", "/"],
    ["Tin tức", "/news"],
    ["Giỏ hàng", "/cart"],
    ["Câu hỏi thường gặp", "/help"],
    ["Chương trình tiếp thị liên kết", "/affiliate"],
    ["API Docs", "/docs"],
  ],
} as const;

const socialLinks: Array<{ icon: LucideIcon; label: string; href: string }> = [
  { icon: MessageCircle, label: "Cộng đồng", href: "/community" },
  { icon: Camera, label: "Hình ảnh", href: "/gallery" },
  { icon: CirclePlay, label: "Video", href: "/videos" },
  { icon: Send, label: "Telegram", href: "https://t.me" },
  { icon: Rss, label: "RSS", href: "/rss.xml" },
];

export function Footer() {
  return (
    <footer className="bg-emerald-900 text-white">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_1fr_1.15fr]">
        <div>
          <Link href="/" className="inline-flex items-baseline text-3xl font-bold tracking-[-0.04em]">
            Commerce<span className="text-emerald-300">Hub</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-emerald-100/75">
            Nền tảng thương mại điện tử dành cho sản phẩm số, kết nối cộng đồng người mua và nhà bán hàng
            trong một môi trường minh bạch.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socialLinks.map(({ icon: SocialIcon, label, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-emerald-50 transition hover:bg-emerald-400 hover:text-emerald-950"
              >
                <SocialIcon className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-emerald-50">{title}</h2>
            <ul className="mt-4 space-y-2.5">
              {links.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-emerald-100/75 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-emerald-50">Bản tin</h2>
          <p className="mt-4 text-sm leading-6 text-emerald-100/75">
            Nhận thông tin sản phẩm mới, ưu đãi và cập nhật quan trọng từ CommerceHub.
          </p>
          <div className="mt-4 flex overflow-hidden rounded-lg bg-white">
            <label htmlFor="newsletter-email" className="sr-only">
              Email nhận bản tin
            </label>
            <div className="relative min-w-0 flex-1">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                id="newsletter-email"
                type="email"
                placeholder="Email của bạn"
                className="h-11 w-full bg-transparent pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              className="bg-emerald-400 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-5 text-xs text-emerald-100/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 CommerceHub. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-white">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-white">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
