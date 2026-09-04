import { z } from "zod";

const usernamePattern = /^[a-zA-Z0-9_.]+$/;

export const sellerRegistrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Tên gian hàng cần có ít nhất 5 ký tự")
    .max(255, "Tên gian hàng không được quá 255 ký tự"),
  username: z
    .string()
    .trim()
    .min(3, "Username cần có ít nhất 3 ký tự")
    .max(100, "Username không được quá 100 ký tự")
    .regex(usernamePattern, "Chỉ được dùng chữ, số, dấu chấm và gạch dưới"),
  contactInfo: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập thông tin liên hệ")
    .max(255, "Thông tin liên hệ không được quá 255 ký tự"),
  applicationReason: z
    .string()
    .trim()
    .max(500, "Phần giới thiệu không được quá 500 ký tự"),
  acceptedTerms: z.boolean().refine((accepted) => accepted, {
    message: "Bạn cần đồng ý với quy chế người bán",
  }),
});

export type SellerRegistrationFormValues = z.infer<
  typeof sellerRegistrationSchema
>;
