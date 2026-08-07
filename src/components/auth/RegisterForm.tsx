"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: createAccount, isSubmitting, error, clearError } = useAuth();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });
  const password = useWatch({ control, name: "password" });

  useEffect(() => clearError(), [clearError]);

  const onSubmit = handleSubmit(async ({ fullName, email, password: rawPassword }) => {
    try {
      await createAccount({ fullName, email, password: rawPassword });
      router.replace("/");
    } catch {
      // Lỗi đã được chuẩn hóa và hiển thị bởi auth store.
    }
  });

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold text-emerald-700">Bắt đầu miễn phí</p>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[36px]">
          Tạo tài khoản mới
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-slate-500">
          Chỉ mất một phút để tham gia cộng đồng CommerceHub.
        </p>
      </div>

      {error ? (
        <div
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField id="fullName" label="Họ và tên" error={errors.fullName?.message}>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Nguyễn Văn An"
              hasError={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              {...register("fullName")}
            />
          </div>
        </FormField>

        <FormField id="email" label="Email" error={errors.email?.message}>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              hasError={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          </div>
        </FormField>

        <FormField id="password" label="Mật khẩu" error={errors.password?.message}>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Tối thiểu 6 ký tự"
              hasError={Boolean(errors.password)}
              className="pr-12"
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span
              className={`grid size-4 place-items-center rounded-full ${
                password?.length >= 6
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Check className="size-3" />
            </span>
            Ít nhất 6 ký tự
          </div>
        </FormField>

        <FormField
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          error={errors.confirmPassword?.message}
        >
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              hasError={Boolean(errors.confirmPassword)}
              className="pr-12"
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
            >
              {showConfirmPassword ? (
                <EyeOff className="size-[18px]" />
              ) : (
                <Eye className="size-[18px]" />
              )}
            </button>
          </div>
        </FormField>

        <div>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-5 text-slate-600">
            <input
              type="checkbox"
              className="mt-0.5 size-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-600"
              aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
              {...register("acceptTerms")}
            />
            <span>
              Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của CommerceHub.
            </span>
          </label>
          {errors.acceptTerms ? (
            <p id="acceptTerms-error" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
              {errors.acceptTerms.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" isLoading={isSubmitting} className="mt-1">
          {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
