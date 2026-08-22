import { z } from "zod";

export const MIN_WITHDRAWAL_AMOUNT = 500_000;
export const MAX_WITHDRAWAL_AMOUNT = 500_000_000;

export const withdrawalSchema = z.object({
  amount: z
    .string()
    .min(1, "Vui lòng nhập số tiền muốn rút")
    .refine((value) => Number(value) >= MIN_WITHDRAWAL_AMOUNT, {
      message: "Số tiền rút tối thiểu là 500.000đ",
    })
    .refine((value) => Number(value) <= MAX_WITHDRAWAL_AMOUNT, {
      message: "Số tiền rút tối đa là 500.000.000đ",
    }),
  bankName: z.string().trim().min(1, "Vui lòng chọn ngân hàng"),
  accountNumber: z
    .string()
    .trim()
    .min(6, "Số tài khoản phải có ít nhất 6 chữ số")
    .max(50, "Số tài khoản không được quá 50 chữ số")
    .regex(/^\d+$/, "Số tài khoản chỉ được chứa chữ số"),
  accountName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập tên chủ tài khoản")
    .max(100, "Tên chủ tài khoản không được quá 100 ký tự")
    .regex(/^[\p{L}\s.'-]+$/u, "Tên chủ tài khoản chứa ký tự không hợp lệ"),
});

export type WithdrawalFormValues = z.infer<typeof withdrawalSchema>;
