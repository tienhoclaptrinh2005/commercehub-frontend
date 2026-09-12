import { z } from "zod";

const vietnamPhonePattern = /^(0[35789])\d{8}$/;
const usernamePattern = /^[a-zA-Z0-9_.]+$/;

export const profileEditSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username cần có ít nhất 3 ký tự")
    .max(100, "Username không được quá 100 ký tự")
    .regex(usernamePattern, "Chỉ được dùng chữ, số, dấu chấm và gạch dưới"),
  fullName: z
    .string()
    .trim()
    .min(2, "Họ và tên cần có ít nhất 2 ký tự")
    .max(50, "Họ và tên không được quá 50 ký tự"),
  phone: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || vietnamPhonePattern.test(value), {
      message: "Số điện thoại Việt Nam không đúng định dạng",
    }),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu mới")
      .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((values) => values.newPassword !== values.oldPassword, {
    path: ["newPassword"],
    message: "Mật khẩu mới không được trùng mật khẩu hiện tại",
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
