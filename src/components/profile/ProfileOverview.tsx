"use client";

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  LockKeyhole,
  MailCheck,
  PencilLine,
  Phone,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { useMyProfile, useUserLevels } from "@/hooks/api/useUserProfile";
import { formatCurrency, formatDate } from "@/lib/format";

import { ProfileAvatar } from "./ProfileAvatar";
import { UserRoleBadges } from "./UserRoleBadges";

export function ProfileOverview() {
  const { profile, isLoading, error, refresh } = useMyProfile();
  const { levels, isLoading: isLevelsLoading, error: levelsError } = useUserLevels();

  if (isLoading && !profile) {
    return <ProfileOverviewSkeleton />;
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        <p className="font-semibold">{error || "Không thể tải hồ sơ của bạn"}</p>
        <button type="button" onClick={() => void refresh()} className="mt-3 font-bold underline">
          Thử tải lại
        </button>
      </div>
    );
  }

  const currentLevel = levels.find((level) => level.level === profile.userLevel);
  const nextLevel = levels.find((level) => level.level > profile.userLevel);
  const currentThreshold = currentLevel?.minSpent ?? 0;
  const nextThreshold = nextLevel?.minSpent ?? currentThreshold;
  const levelProgress = nextLevel
    ? Math.max(
        0,
        Math.min(
          100,
          ((profile.accumulatedSpent - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
        ),
      )
    : 100;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-36 bg-white" />
        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <ProfileAvatar
                avatarUrl={profile.avatarUrl}
                fullName={profile.fullName}
                className="size-28"
              />
              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-950">{profile.fullName}</h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                    Cấp {profile.userLevel} · {currentLevel?.label || "Thành viên"}
                  </span>
                  <UserRoleBadges roles={profile.roles} />
                </div>
                <p className="mt-1 text-sm text-slate-500">@{profile.username || "chưa-có-username"}</p>
              </div>
            </div>
            <Link
              href="/profile/edit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <PencilLine className="size-4" />
              Chỉnh sửa hồ sơ
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ProfileFact icon={MailCheck} label="Email" value={profile.email} verified={profile.isEmailVerified} />
            <ProfileFact icon={Phone} label="Điện thoại" value={profile.phone || "Chưa cập nhật"} verified={profile.isPhoneVerified} />
            <ProfileFact icon={CalendarDays} label="Tham gia" value={formatDate(profile.createdAt)} />
            <ProfileFact icon={ShieldCheck} label="Trạng thái" value={profile.status === "ACTIVE" ? "Đang hoạt động" : profile.status} />
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Cấp độ thành viên</p>
              <h2 className="mt-1 text-lg font-bold text-slate-950">
                {nextLevel ? `Tiến tới cấp ${nextLevel.level} · ${nextLevel.label}` : "Bạn đã đạt cấp cao nhất"}
              </h2>
            </div>
            <BadgeCheck className="size-8 text-emerald-600" />
          </div>

          {isLevelsLoading ? (
            <div className="mt-6 h-3 animate-pulse rounded-full bg-slate-100" />
          ) : levelsError ? (
            <p className="mt-5 text-sm text-rose-600">{levelsError}</p>
          ) : (
            <>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${levelProgress}%` }} />
              </div>
              <div className="mt-3 flex justify-between gap-4 text-xs text-slate-500">
                <span>Đã tích lũy {formatCurrency(profile.accumulatedSpent)}</span>
                <span>{nextLevel ? `Mốc ${formatCurrency(nextLevel.minSpent)}` : "Hoàn thành"}</span>
              </div>
            </>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <CircleDollarSign className="size-5 text-emerald-600" />
              <p className="mt-2 text-xs font-medium text-slate-500">Tổng chi tiêu</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{formatCurrency(profile.accumulatedSpent)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <CircleDollarSign className="size-5 text-blue-600" />
              <p className="mt-2 text-xs font-medium text-slate-500">Tổng thu nhập</p>
              <p className="mt-1 text-lg font-bold text-slate-950">{formatCurrency(profile.accumulatedEarned)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <LockKeyhole className="size-7 text-emerald-600" />
          <h2 className="mt-4 text-lg font-bold text-slate-950">Bảo mật tài khoản</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Nên thay đổi mật khẩu định kỳ và không dùng chung mật khẩu với dịch vụ khác.
          </p>
          <Link
            href="/profile/change-password"
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
          >
            Đổi mật khẩu <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

function ProfileFact({
  icon: Icon,
  label,
  value,
  verified,
}: {
  icon: typeof MailCheck;
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Icon className="size-4 text-emerald-600" />
        {label}
        {verified ? <BadgeCheck className="ml-auto size-4 text-emerald-600" aria-label="Đã xác minh" /> : null}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-slate-900" title={value}>{value}</p>
    </div>
  );
}

function ProfileOverviewSkeleton() {
  return (
    <div className="space-y-5" aria-label="Đang tải hồ sơ">
      <div className="h-[360px] animate-pulse rounded-xl border border-slate-200 bg-white" />
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
        <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
