import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { ProfileShell } from "@/components/profile/ProfileShell";

export const metadata: Metadata = {
  title: "Đổi mật khẩu",
  description: "Thay đổi mật khẩu tài khoản CommerceHub.",
};

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ProfileShell
        active="password"
        title="Đổi mật khẩu"
        description="Sử dụng mật khẩu mạnh và không chia sẻ mật khẩu với bất kỳ ai."
      >
        <ChangePasswordForm />
      </ProfileShell>
    </ProtectedRoute>
  );
}
