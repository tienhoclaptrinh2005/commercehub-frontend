import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfileShell } from "@/components/profile/ProfileShell";

export const metadata: Metadata = {
  title: "Hồ sơ của tôi",
  description: "Xem thông tin hồ sơ và cấp độ tài khoản CommerceHub.",
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileShell
        active="overview"
        title="Hồ sơ của tôi"
        description="Theo dõi thông tin tài khoản, cấp độ thành viên và trạng thái xác minh."
      >
        <ProfileOverview />
      </ProfileShell>
    </ProtectedRoute>
  );
}

