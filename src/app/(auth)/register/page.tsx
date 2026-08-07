import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký",
  description: "Tạo tài khoản CommerceHub miễn phí.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
