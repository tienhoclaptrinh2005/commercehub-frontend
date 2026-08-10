import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ProfileSidebar } from "./ProfileSidebar";

type ProfileSection = "overview" | "edit" | "password";

interface ProfileShellProps {
  active: ProfileSection;
  title: string;
  description: string;
  children: ReactNode;
}

export function ProfileShell({ active, title, description, children }: ProfileShellProps) {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-emerald-700">
          <Home className="size-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/profile" className="hover:text-emerald-700">
          Cài đặt profile
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-slate-800">{title}</span>
      </nav>

      <div className="mt-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Tài khoản</p>
        <h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <ProfileSidebar active={active} />
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

