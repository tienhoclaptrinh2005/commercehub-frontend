"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  CircleAlert,
  CircleUserRound,
  Clock3,
  ContactRound,
  Send,
  Store,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useAppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useMyProfile } from "@/hooks/api/useUserProfile";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  sellerRegistrationSchema,
  type SellerRegistrationFormValues,
} from "@/lib/validations/seller-registration.schema";
import { getApiErrorMessage } from "@/services/api";
import { shopService } from "@/services/shop.service";
import type { ShopApplication } from "@/types";

export function SellerRegistrationScreen() {
  const modal = useAppModal();
  const { syncCurrentUser } = useAuth();
  const { profile, isLoading, error, refresh } = useMyProfile();
  const [application, setApplication] = useState<ShopApplication | null>(null);
  const [isLoadingApplication, setIsLoadingApplication] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SellerRegistrationFormValues>({
    resolver: zodResolver(sellerRegistrationSchema),
    defaultValues: {
      name: "",
      username: "",
      contactInfo: "",
      applicationReason: "",
      acceptedTerms: false,
    },
  });

  useEffect(() => {
    if (!profile || profile.shopStatus) return;
    reset({
      name: "",
      username: profile.username || "",
      contactInfo: "",
      applicationReason: "",
      acceptedTerms: false,
    });
  }, [profile, reset]);

  useEffect(() => {
    if (!profile?.shopStatus) return;
    let cancelled = false;
    shopService
      .getMyApplication()
      .then((result) => {
        if (!cancelled) setApplication(result);
      })
      .catch(() => {
        // shopStatus từ profile vẫn đủ để hiển thị trạng thái an toàn.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingApplication(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.shopStatus]);

  const usernameLocked = profile?.usernameChangeAllowed === false;
  const reasonLength = useWatch({ control, name: "applicationReason" }).length;

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const result = await shopService.register({
        name: values.name.trim(),
        username: values.username.trim().toLowerCase(),
        contactInfo: values.contactInfo.trim(),
        applicationReason: values.applicationReason.trim() || undefined,
        acceptedTerms: true,
      });
      setApplication(result);
      setIsLoadingApplication(false);
      await Promise.all([refresh(), syncCurrentUser()]);
      modal.showSuccess({
        title: "Đã gửi yêu cầu đăng ký",
        description:
          "Hồ sơ đang chờ quản trị viên duyệt. Tài khoản của bạn vẫn là BUYER cho đến khi được duyệt.",
        confirmLabel: "Đã hiểu",
      });
    } catch (requestError) {
      modal.showError({
        title: "Không thể gửi yêu cầu",
        description: getApiErrorMessage(
          requestError,
          "Không thể gửi yêu cầu đăng ký bán hàng",
        ),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isLoading && !profile) {
    return <RegistrationLoading />;
  }

  if (!profile) {
    return (
      <StatusCard
        icon={CircleAlert}
        iconClass="bg-rose-50 text-rose-600"
        title="Không thể tải thông tin tài khoản"
        description={error || "Vui lòng kiểm tra kết nối và thử lại."}
        action={
          <button type="button" onClick={() => void refresh()} className="font-bold text-emerald-700 underline">
            Thử tải lại
          </button>
        }
      />
    );
  }

  const currentStatus = application?.status ?? profile.shopStatus;
  if (currentStatus === "PENDING") {
    return (
      <StatusCard
        icon={Clock3}
        iconClass="bg-amber-50 text-amber-600"
        title="Hồ sơ đang chờ duyệt"
        description="Bạn chưa có role SELLER. Quản trị viên cần duyệt hồ sơ trước khi bạn có thể đăng sản phẩm và quản lý gian hàng."
        application={application}
        loading={isLoadingApplication}
      />
    );
  }

  if (currentStatus === "REJECTED") {
    return (
      <StatusCard
        icon={CircleAlert}
        iconClass="bg-rose-50 text-rose-600"
        title="Yêu cầu đăng ký đã bị từ chối"
        description="Theo chính sách hiện tại, hồ sơ đã bị từ chối không thể gửi lại. Bạn vẫn tiếp tục sử dụng tài khoản với role BUYER."
        application={application}
        loading={isLoadingApplication}
      />
    );
  }

  if (currentStatus === "ACTIVE" || profile.roles.includes("SELLER")) {
    return (
      <StatusCard
        icon={BadgeCheck}
        iconClass="bg-emerald-50 text-emerald-600"
        title="Gian hàng đã được duyệt"
        description="Tài khoản đã có quyền SELLER và có thể sử dụng trang quản lý bán hàng."
        action={
          <Link href="/seller" className="inline-flex h-11 items-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white">
            Quản lý gian hàng
          </Link>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-10 sm:px-6 sm:py-14">
      <header className="mx-auto max-w-2xl text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Store className="size-6" />
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
          Đăng ký bán hàng
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
          Gửi hồ sơ để quản trị viên xét duyệt trước khi bắt đầu kinh doanh sản phẩm số.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="mx-auto mt-8 max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-8">
        <FormField id="shopName" label="Tên shop / Thương hiệu *" error={errors.name?.message}>
          <div className="relative">
            <Store className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input id="shopName" maxLength={255} placeholder="Ví dụ: Tạp Hóa MMO Official" hasError={Boolean(errors.name)} {...register("name")} />
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Khi hồ sơ được duyệt, tên hiển thị của tài khoản sẽ đồng bộ với tên shop và không thể đổi lại.
          </p>
        </FormField>

        <FormField id="sellerUsername" label="Username của tài khoản *" error={errors.username?.message}>
          <div className="relative">
            <CircleUserRound className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              id="sellerUsername"
              maxLength={100}
              placeholder="chodemofficial"
              readOnly={usernameLocked}
              hasError={Boolean(errors.username)}
              className={usernameLocked ? "cursor-not-allowed bg-slate-100 text-slate-500" : undefined}
              {...register("username")}
            />
          </div>
          <p className={`rounded-lg px-3 py-2 text-xs leading-5 ${usernameLocked ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-800"}`}>
            {usernameLocked
              ? "Bạn đã đổi username một lần rồi. Username hiện tại sẽ được dùng cho hồ sơ seller."
              : "Bạn có thể chọn username cuối cùng tại đây. Gửi hồ sơ sẽ chốt lượt đổi username duy nhất."}
          </p>
        </FormField>

        <FormField id="contactInfo" label="Thông tin liên hệ (Zalo / Telegram / Facebook) *" error={errors.contactInfo?.message}>
          <div className="relative">
            <ContactRound className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input id="contactInfo" maxLength={255} placeholder="Để admin có thể liên hệ xác minh" hasError={Boolean(errors.contactInfo)} {...register("contactInfo")} />
          </div>
        </FormField>

        <FormField id="applicationReason" label="Lý do đăng ký / Giới thiệu ngắn về nguồn hàng" error={errors.applicationReason?.message}>
          <textarea
            id="applicationReason"
            rows={5}
            maxLength={500}
            placeholder="Bạn dự định bán sản phẩm gì? Nguồn hàng như thế nào?..."
            className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-[15px] leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 ${errors.applicationReason ? "border-rose-400" : "border-slate-200"}`}
            {...register("applicationReason")}
          />
          <p className="text-right text-xs text-slate-400">{reasonLength}/500 ký tự</p>
        </FormField>

        <div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <input type="checkbox" className="mt-1 size-4 rounded border-slate-300 accent-emerald-600" {...register("acceptedTerms")} />
            <span>Tôi xác nhận thông tin cung cấp là chính xác và đồng ý với quy chế người bán của CommerceHub.</span>
          </label>
          {errors.acceptedTerms ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.acceptedTerms.message}</p> : null}
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          <Send className="size-[18px]" />
          {isSubmitting ? "Đang gửi hồ sơ..." : "Gửi đăng ký"}
        </Button>

        <p className="text-center text-xs leading-5 text-slate-400">
          Gửi yêu cầu không cấp quyền SELLER ngay. Tài khoản chỉ được nâng quyền sau khi quản trị viên duyệt.
        </p>
      </form>
    </div>
  );
}

function RegistrationLoading() {
  return <div className="mx-auto my-14 h-[560px] max-w-2xl animate-pulse rounded-3xl border border-slate-200 bg-white" />;
}

function StatusCard({
  icon: Icon,
  iconClass,
  title,
  description,
  action,
  application,
  loading = false,
}: {
  icon: LucideIcon;
  iconClass: string;
  title: string;
  description: string;
  action?: ReactNode;
  application?: ShopApplication | null;
  loading?: boolean;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/50 sm:p-10">
        <span className={`mx-auto grid size-16 place-items-center rounded-2xl ${iconClass}`}><Icon className="size-8" /></span>
        <h1 className="mt-5 text-2xl font-black text-slate-950">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">{description}</p>
        {loading ? <div className="mx-auto mt-6 h-24 max-w-md animate-pulse rounded-2xl bg-slate-100" /> : application ? (
          <dl className="mx-auto mt-6 grid max-w-md gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left text-sm sm:grid-cols-2">
            <div><dt className="text-xs font-bold uppercase text-slate-400">Tên gian hàng</dt><dd className="mt-1 font-bold text-slate-800">{application.name}</dd></div>
            <div><dt className="text-xs font-bold uppercase text-slate-400">Username</dt><dd className="mt-1 font-bold text-slate-800">@{application.username}</dd></div>
          </dl>
        ) : null}
        {action ? <div className="mt-7">{action}</div> : null}
      </section>
    </div>
  );
}
