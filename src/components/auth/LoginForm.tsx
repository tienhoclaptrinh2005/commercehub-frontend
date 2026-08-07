"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/auth/useAuth";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isSubmitting, error, clearError } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => clearError(), [clearError]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      router.replace("/");
    } catch {
      // Lỗi đã được chuẩn hóa và hiển thị bởi auth store.
    }
  });

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 lg:hidden">
          <ShieldCheck className="size-3.5" />
          Giao dịch số an toàn
        </div>
        <p className="mb-2 text-sm font-semibold text-emerald-700">Chào mừng trở lại</p>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-[36px]">
          Đăng nhập tài khoản
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-slate-500">
          Tiếp tục mua bán sản phẩm số trên CommerceHub.
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

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
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
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
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
        </FormField>

        <Button type="submit" isLoading={isSubmitting} className="mt-2">
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Đăng ký miễn phí
        </Link>
      </p>

      <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-400">
        <ShieldCheck className="size-4 text-emerald-600" />
        Phiên đăng nhập được bảo vệ bằng JWT
      </div>
    </div>
  );
}
