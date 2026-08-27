"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { useAppModal } from "@/components/ui/app-modal";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/profile.schema";
import { getApiErrorMessage } from "@/services/api";
import { userService } from "@/services/user.service";

export function ChangePasswordForm() {
  const modal = useAppModal();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await userService.changePassword(values);
      reset();
      modal.showSuccess({
        title: "Đổi mật khẩu thành công",
        description: "Mật khẩu mới đã được cập nhật cho tài khoản của bạn.",
        confirmLabel: "Hoàn tất",
      });
    } catch (requestError) {
      modal.showError({
        title: "Không thể đổi mật khẩu",
        description: getApiErrorMessage(requestError, "Không thể đổi mật khẩu"),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
        <span className="grid size-11 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <KeyRound className="size-5" />
        </span>
        <div>
          <h2 className="font-bold text-slate-950">Tạo mật khẩu mới</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Mật khẩu mới cần có ít nhất 6 ký tự và khác mật khẩu hiện tại.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 max-w-xl space-y-5" noValidate>
        <PasswordField
          id="oldPassword"
          label="Mật khẩu hiện tại"
          visible={showOldPassword}
          toggle={() => setShowOldPassword((current) => !current)}
          error={errors.oldPassword?.message}
          inputProps={register("oldPassword")}
          autoComplete="current-password"
        />
        <PasswordField
          id="newPassword"
          label="Mật khẩu mới"
          visible={showNewPassword}
          toggle={() => setShowNewPassword((current) => !current)}
          error={errors.newPassword?.message}
          inputProps={register("newPassword")}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirmPassword"
          label="Xác nhận mật khẩu mới"
          visible={showConfirmPassword}
          toggle={() => setShowConfirmPassword((current) => !current)}
          error={errors.confirmPassword?.message}
          inputProps={register("confirmPassword")}
          autoComplete="new-password"
        />

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            Tài khoản đăng nhập hoàn toàn bằng Google có thể không đổi được mật khẩu và backend sẽ trả thông báo phù hợp.
          </div>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </Button>
      </form>
    </section>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  visible: boolean;
  toggle: () => void;
  error?: string;
  autoComplete: string;
  inputProps: UseFormRegisterReturn;
}

function PasswordField({ id, label, visible, toggle, error, autoComplete, inputProps }: PasswordFieldProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder="••••••••"
          hasError={Boolean(error)}
          className="pr-12"
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {visible ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
        </button>
      </div>
    </FormField>
  );
}
