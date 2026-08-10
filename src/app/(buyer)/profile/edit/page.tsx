import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { ProfileShell } from "@/components/profile/ProfileShell";

export const metadata: Metadata = {
  title: "Cập nhật profile",
  description: "Cập nhật thông tin hồ sơ CommerceHub.",
};

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileShell
        active="edit"
        title="Cập nhật profile"
        description="Quản lý ảnh đại diện, tên hiển thị, username và số điện thoại của bạn."
      >
        <ProfileEditForm />
      </ProfileShell>
    </ProtectedRoute>
  );
}

