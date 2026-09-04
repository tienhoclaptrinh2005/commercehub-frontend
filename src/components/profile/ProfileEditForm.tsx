"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Camera,
  Link2,
  Mail,
  Phone,
  TriangleAlert,
  UserRound,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useAppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useMyProfile } from "@/hooks/api/useUserProfile";
import { readAuthSession, saveAuthSession } from "@/lib/auth";
import {
  avatarSchema,
  profileEditSchema,
  type AvatarFormValues,
  type ProfileEditFormValues,
} from "@/lib/validations/profile.schema";
import { getApiErrorMessage } from "@/services/api";
import { userService } from "@/services/user.service";
import type { UserProfile } from "@/types";

import { ProfileAvatar } from "./ProfileAvatar";

export function ProfileEditForm() {
  const modal = useAppModal();
  const { profile, setProfile, isLoading, error, refresh } = useMyProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { username: "", fullName: "", phone: "" },
  });

  const {
    register: registerAvatar,
    reset: resetAvatar,
    handleSubmit: handleAvatarSubmit,
    formState: { errors: avatarErrors },
  } = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarSchema),
    defaultValues: { avatarUrl: "" },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      username: profile.username || "",
      fullName: profile.fullName,
      phone: profile.phone || "",
    });
    resetAvatar({ avatarUrl: profile.avatarUrl || "" });
  }, [profile, reset, resetAvatar]);

  const isSellerIdentityLocked =
    profile?.roles.includes("SELLER") && profile.shopStatus === "ACTIVE";
  const isUsernameLocked =
    profile?.usernameChangeAllowed === false || isSellerIdentityLocked;

  const syncHeaderIdentity = (nextProfile: UserProfile) => {
    const session = readAuthSession();
    if (!session) return;
    saveAuthSession({
      ...session,
      user: {
        ...session.user,
        username: nextProfile.username || session.user.username,
        fullName: nextProfile.fullName,
        avatarUrl: nextProfile.avatarUrl,
        roles: nextProfile.roles,
        shopId: nextProfile.shopId,
        shopStatus: nextProfile.shopStatus,
      },
    });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!profile) return;

    const nextUsername = values.username.trim().toLowerCase();
    const currentUsername = (profile.username || "").toLowerCase();
    const isChangingUsername = nextUsername !== currentUsername;

    if (isChangingUsername && isUsernameLocked) {
      modal.showError({
        title: "Không thể đổi username",
        description: "Username đã được đổi một lần và hiện không thể thay đổi thêm.",
        confirmLabel: "Đã hiểu",
      });
      return;
    }

    if (isChangingUsername) {
      const confirmed = await modal.confirm({
        title: "Xác nhận đổi username",
        description: "Bạn chỉ được đổi username một lần duy nhất. Đường dẫn hồ sơ cũ có thể không còn sử dụng được.",
        details: <p className="text-center font-black text-slate-950">Username mới: @{nextUsername}</p>,
        confirmLabel: "Đổi username",
        cancelLabel: "Hủy",
      });
      if (!confirmed) return;
    }

    setIsSaving(true);

    try {
      await userService.updateMyProfile({
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || undefined,
      });

      if (isChangingUsername) {
        await userService.updateUsername(nextUsername);
      }

      const refreshedProfile = await refresh();
      if (refreshedProfile) syncHeaderIdentity(refreshedProfile);
      modal.showSuccess({
        title: "Cập nhật hồ sơ thành công",
        description: isChangingUsername
          ? `Đã đổi username thành @${nextUsername}. Username hiện đã được khóa.`
          : "Thông tin hồ sơ đã được cập nhật.",
        confirmLabel: "Hoàn tất",
      });
    } catch (requestError) {
      modal.showError({
        title: "Không thể cập nhật hồ sơ",
        description: getApiErrorMessage(requestError, "Không thể cập nhật hồ sơ"),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setIsSaving(false);
    }
  });

  const onAvatarSubmit = handleAvatarSubmit(async ({ avatarUrl }) => {
    setIsSavingAvatar(true);
    try {
      const nextProfile = await userService.updateAvatar({
        avatarUrl: avatarUrl.trim(),
      });
      setProfile(nextProfile);
      syncHeaderIdentity(nextProfile);
      resetAvatar({ avatarUrl: nextProfile.avatarUrl || "" });
      modal.showSuccess({
        title: "Cập nhật ảnh thành công",
        description: "Ảnh đại diện mới đã được áp dụng cho tài khoản của bạn.",
        confirmLabel: "Hoàn tất",
      });
    } catch (requestError) {
      modal.showError({
        title: "Không thể cập nhật ảnh đại diện",
        description: getApiErrorMessage(
          requestError,
          "Không thể cập nhật ảnh đại diện",
        ),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setIsSavingAvatar(false);
    }
  });

  if (isLoading && !profile) {
    return (
      <div className="h-[720px] animate-pulse rounded-xl border border-slate-200 bg-white" />
    );
  }

  if (!profile) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        <p className="font-semibold">
          {error || "Không thể tải hồ sơ của bạn"}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-3 font-bold underline"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-36 bg-emerald-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,211,153,0.24),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.16),transparent_32%)]" />
          <span className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-emerald-400 text-emerald-950 shadow-lg">
            <Camera className="size-5" />
          </span>
        </div>

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-12 flex items-end gap-4">
            <div className="relative">
              <ProfileAvatar
                avatarUrl={profile.avatarUrl}
                fullName={profile.fullName}
                className="size-28"
              />
              <span className="absolute bottom-1 right-0 grid size-9 place-items-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md">
                <Camera className="size-4" />
              </span>
            </div>
            <div className="pb-2">
              <p className="text-lg font-bold text-slate-950">
                {profile.fullName}
              </p>
              <p className="text-sm text-slate-500">
                @{profile.username || "chưa-có-username"}
              </p>
            </div>
          </div>

          <form
            onSubmit={onAvatarSubmit}
            className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
            noValidate
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <FormField
                  id="avatarUrl"
                  label="URL ảnh đại diện"
                  error={avatarErrors.avatarUrl?.message}
                >
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                    <Input
                      id="avatarUrl"
                      type="url"
                      placeholder="https://cdn.example.com/avatar.jpg"
                      hasError={Boolean(avatarErrors.avatarUrl)}
                      aria-describedby={
                        avatarErrors.avatarUrl
                          ? "avatarUrl-error"
                          : "avatar-url-help"
                      }
                      {...registerAvatar("avatarUrl")}
                    />
                  </div>
                </FormField>
                <p
                  id="avatar-url-help"
                  className="mt-2 text-xs leading-5 text-slate-500"
                >
                  Backend hiện nhận URL ảnh; chưa có endpoint upload file trực
                  tiếp.
                </p>
              </div>
              <Button
                type="submit"
                isLoading={isSavingAvatar}
                className="w-full lg:w-auto"
              >
                {isSavingAvatar ? "Đang cập nhật..." : "Cập nhật ảnh"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <UserRoundCog className="size-5" />
          </span>
          <div>
            <h2 className="font-bold text-slate-950">Thông tin cá nhân</h2>
            <p className="mt-1 text-sm text-slate-500">
              Cập nhật tên hiển thị, username và số điện thoại. Username chỉ
              được đổi một lần.
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 grid gap-5 sm:grid-cols-2"
          noValidate
        >
          <FormField id="profileEmail" label="Địa chỉ email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <Input
                id="profileEmail"
                value={profile.email}
                readOnly
                className="cursor-not-allowed bg-slate-50 text-slate-500"
              />
              {profile.isEmailVerified ? (
                <BadgeCheck
                  className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-emerald-600"
                  aria-label="Email đã xác minh"
                />
              ) : null}
            </div>
          </FormField>

          <FormField
            id="username"
            label="Username công khai"
            error={errors.username?.message}
          >
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <Input
                id="username"
                autoComplete="username"
                placeholder="ten-dang-nhap"
                hasError={Boolean(errors.username)}
                readOnly={isUsernameLocked}
                className={
                  isUsernameLocked
                    ? "cursor-not-allowed bg-slate-50 text-slate-500"
                    : undefined
                }
                aria-describedby={
                  errors.username ? "username-error" : "username-policy"
                }
                {...register("username")}
              />
            </div>
            <div
              id="username-policy"
              className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-5 ${
                isUsernameLocked
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                {isUsernameLocked
                  ? "Username đã được đổi 1 lần ! Và đã đạt giới hạn."
                  : "Chỉ được đổi username một lần duy nhất."}
              </span>
            </div>
          </FormField>

          <FormField
            id="fullName"
            label="Họ và tên"
            error={errors.fullName?.message}
          >
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <Input
                id="fullName"
                autoComplete="name"
                placeholder="Nguyễn Văn An"
                hasError={Boolean(errors.fullName)}
                readOnly={isSellerIdentityLocked}
                className={
                  isSellerIdentityLocked
                    ? "cursor-not-allowed bg-slate-50 text-slate-500"
                    : undefined
                }
                aria-describedby={
                  errors.fullName ? "fullName-error" : undefined
                }
                {...register("fullName")}
              />
            </div>
            {isSellerIdentityLocked ? (
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Tên hiển thị đã đồng bộ với tên gian hàng và không thể thay đổi.
              </p>
            ) : null}
          </FormField>

          <FormField
            id="phone"
            label="Số điện thoại"
            error={errors.phone?.message}
          >
            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="0901234567"
                hasError={Boolean(errors.phone)}
                aria-describedby={errors.phone ? "phone-error" : "phone-help"}
                {...register("phone")}
              />
            </div>
            <p id="phone-help" className="mt-2 text-xs text-slate-500">
              Đổi số điện thoại sẽ đưa trạng thái xác minh về chưa xác minh.
            </p>
          </FormField>

          <div className="sm:col-span-2 flex justify-end border-t border-slate-100 pt-5">
            <Button
              type="submit"
              isLoading={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
