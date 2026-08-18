"use client";

import {
  ChevronDown,
  Eye,
  LockKeyhole,
  LogOut,
  Settings,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType } from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import type { UserRole } from "@/types";

const ROLE_PRIORITY: UserRole[] = ["SUPER_ADMIN", "ADMIN", "SELLER", "BUYER"];

const ROLE_BADGE_STYLES: Record<UserRole, { badge: string; dot: string }> = {
  BUYER: {
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  SELLER: {
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  ADMIN: {
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  SUPER_ADMIN: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

function getPrimaryRole(roles: UserRole[]): UserRole {
  return ROLE_PRIORITY.find((role) => roles.includes(role)) ?? "BUYER";
}

function AccountAvatar({
  avatarUrl,
  fullName,
  className,
}: {
  avatarUrl: string | null;
  fullName: string;
  className: string;
}) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700 ${className}`}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={`Ảnh đại diện của ${fullName}`}
          fill
          sizes="80px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <UserRound className="size-1/2" />
      )}
    </span>
  );
}

function MenuLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-16 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon className="size-[18px]" />
      </span>
      <span className="leading-5">{label}</span>
    </Link>
  );
}

export function AuthStatus() {
  const { user, isHydrated, isSubmitting, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isHydrated) {
    return <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  const primaryRole = getPrimaryRole(user.roles);
  const roleBadge = ROLE_BADGE_STYLES[primaryRole];
  const roleAction = (() => {
    if (primaryRole === "SUPER_ADMIN" || primaryRole === "ADMIN") {
      return { href: "/admin", label: "Trang quản trị", icon: ShieldCheck };
    }
    if (primaryRole === "SELLER") {
      return { href: "/seller", label: "Quản lý gian hàng", icon: Store };
    }
    return {
      href: "/seller/shop/setup",
      label: "Đăng ký bán hàng",
      icon: Store,
    };
  })();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        aria-label="Mở menu tài khoản"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">
            {user.fullName}
          </p>
          <p className="text-xs text-slate-500">@{user.username}</p>
        </div>
        <AccountAvatar
          avatarUrl={user.avatarUrl}
          fullName={user.fullName}
          className="size-8 ring-1 ring-emerald-100"
        />
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-3 w-[350px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15"
          role="menu"
        >
          <div className="flex items-center gap-4 border-b border-slate-100 p-5">
            <AccountAvatar
              avatarUrl={user.avatarUrl}
              fullName={user.fullName}
              className="size-11 ring-2 ring-emerald-500 ring-offset-2"
            />
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-950">
                {user.fullName}
              </p>
              <span
                className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide shadow-sm ${roleBadge.badge}`}
              >
                <span
                  className={`size-1 rounded-full ${roleBadge.dot}`}
                  aria-hidden="true"
                />
                Vai trò: {primaryRole}
              </span>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-1 p-3" aria-label="Tài khoản">
            <MenuLink
              href="/profile"
              label="Hồ sơ của tôi"
              icon={UserRound}
              onNavigate={() => setIsOpen(false)}
            />
            <MenuLink
              href={`/users/${encodeURIComponent(user.username)}`}
              label="Trang cá nhân"
              icon={Eye}
              onNavigate={() => setIsOpen(false)}
            />
            <MenuLink
              href="/profile/edit"
              label="Cài đặt tài khoản"
              icon={Settings}
              onNavigate={() => setIsOpen(false)}
            />
            <MenuLink
              href="/profile/change-password"
              label="Đổi mật khẩu"
              icon={LockKeyhole}
              onNavigate={() => setIsOpen(false)}
            />
            <MenuLink
              href={roleAction.href}
              label={roleAction.label}
              icon={roleAction.icon}
              onNavigate={() => setIsOpen(false)}
            />
          </nav>

          <div className="border-t border-slate-100 p-3">
            <button
              type="button"
              onClick={async () => {
                await logout();
                setIsOpen(false);
              }}
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              role="menuitem"
            >
              <LogOut className="size-[18px]" />
              {isSubmitting ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
