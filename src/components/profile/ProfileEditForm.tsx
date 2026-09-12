"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Camera,
  ImageUp,
  Mail,
  Phone,
  TriangleAlert,
  UserRound,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useAppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useMyProfile } from "@/hooks/api/useUserProfile";
import { readAuthSession, saveAuthSession } from "@/lib/auth";
import { prepareAvatarImage } from "@/lib/images/avatar-image";
import {
  profileEditSchema,
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
  const [isPreparingAvatar, setIsPreparingAvatar] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarFileError, setAvatarFileError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditFormValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: { username: "", fullName: "", phone: "" },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      username: profile.username || "",
      fullName: profile.fullName,
      phone: profile.phone || "",
    });
  }, [profile, reset]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

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

  const selectAvatarFile = async (source?: File) => {
    if (!source) return;

    setAvatarFileError(null);
    setIsPreparingAvatar(true);
    try {
      const prepared = await prepareAvatarImage(source);
      setAvatarFile(prepared);
      setAvatarPreviewUrl(URL.createObjectURL(prepared));
    } catch (prepareError) {
      setAvatarFile(null);
      setAvatarPreviewUrl(null);
      setAvatarFileError(
        prepareError instanceof Error
          ? prepareError.message
          : "Không thể xử lý ảnh đã chọn.",
      );
    } finally {
      setIsPreparingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const onAvatarSubmit = async () => {
    if (!avatarFile) {
      setAvatarFileError("Vui lòng chọn một ảnh đại diện hợp lệ trước.");
      return;
    }

    setIsSavingAvatar(true);
    try {
      const nextProfile = await userService.uploadAvatar(avatarFile);
      setProfile(nextProfile);
      syncHeaderIdentity(nextProfile);
      setAvatarFile(null);
      setAvatarPreviewUrl(null);
      setAvatarFileError(null);
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
  };

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
                avatarUrl={avatarPreviewUrl || profile.avatarUrl}
                fullName={profile.fullName}
                className="size-28"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isPreparingAvatar || isSavingAvatar}
                className="absolute bottom-1 right-0 grid size-9 place-items-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Chọn ảnh đại diện"
              >
                <Camera className="size-4" />
              </button>
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
            onSubmit={(event) => {
              event.preventDefault();
              void onAvatarSubmit();
            }}
            className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
            noValidate
          >
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => void selectAvatarFile(event.target.files?.[0])}
            />

            <div
              className={`rounded-xl border-2 border-dashed px-5 py-6 text-center transition ${
                avatarFileError
                  ? "border-rose-300 bg-rose-50"
                  : "border-slate-300 bg-white hover:border-emerald-400"
              }`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void selectAvatarFile(event.dataTransfer.files?.[0]);
              }}
            >
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                <ImageUp className="size-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-slate-900">
                {avatarFile
                  ? "Ảnh đã sẵn sàng để tải lên"
                  : "Chọn hoặc kéo ảnh đại diện vào đây"}
              </p>
              {avatarFile ? (
                <p className="mt-1 text-xs font-medium text-emerald-700">
                  WebP 512 × 512 px · {Math.max(1, Math.round(avatarFile.size / 1024))} KB
                </p>
              ) : (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  JPEG, PNG hoặc WebP · vuông 1:1 · 256–2048 px · tối đa 1 MB
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Hệ thống tự chuyển sang WebP 512 × 512, chất lượng 83%, loại bỏ metadata;
                dung lượng lý tưởng 50–200 KB.
              </p>
              {avatarFileError ? (
                <p className="mt-2 text-sm font-semibold text-rose-600" role="alert">
                  {avatarFileError}
                </p>
              ) : null}

              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isSavingAvatar || isPreparingAvatar}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 text-sm font-bold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100 hover:text-emerald-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500 sm:w-auto"
                >
                  {isPreparingAvatar ? (
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-emerald-800/30 border-t-emerald-800"
                      aria-hidden="true"
                    />
                  ) : (
                    <ImageUp className="size-4" aria-hidden="true" />
                  )}
                  {isPreparingAvatar ? "Đang xử lý..." : "Chọn ảnh"}
                </button>
                <Button
                  type="submit"
                  isLoading={isSavingAvatar}
                  disabled={!avatarFile || isPreparingAvatar}
                  className="w-full sm:w-auto"
                >
                  {isSavingAvatar ? "Đang tải lên..." : "Tải lên và cập nhật"}
                </Button>
              </div>
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
