import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  KeyRound,
  LockKeyhole,
  Send,
  Share2,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import Link from "next/link";

type ProfileSection = "overview" | "edit" | "password";

const profileItems: Array<{
  label: string;
  href?: string;
  section?: ProfileSection;
  icon: LucideIcon;
}> = [
  { label: "Tổng quan tài khoản", href: "/profile", section: "overview", icon: BadgeCheck },
  { label: "Cập nhật profile", href: "/profile/edit", section: "edit", icon: UserRoundCog },
  { label: "Bảo mật 2 lớp", icon: ShieldCheck },
  { label: "Kết nối Telegram", icon: Send },
  { label: "Mạng xã hội", icon: Share2 },
  { label: "API Key", icon: KeyRound },
  { label: "Đổi mật khẩu", href: "/profile/change-password", section: "password", icon: LockKeyhole },
];

export function ProfileSidebar({ active }: { active: ProfileSection }) {
  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm lg:sticky lg:top-5">
      <nav className="grid gap-1" aria-label="Cài đặt tài khoản">
        {profileItems.map(({ label, href, section, icon: Icon }) => {
          const isActive = section === active;
          const className = `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
            isActive
              ? "bg-emerald-50 text-emerald-800"
              : href
                ? "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                : "cursor-not-allowed text-slate-400"
          }`;

          if (!href) {
            return (
              <span key={label} className={className} title="Chức năng sẽ được triển khai sau">
                <Icon className="size-[18px]" />
                {label}
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Sắp có</span>
              </span>
            );
          }

          return (
            <Link key={href} href={href} className={className} aria-current={isActive ? "page" : undefined}>
              <Icon className="size-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

