"use client";

import { useParams } from "next/navigation";

import {
  PublicProfileBody,
  PublicProfileError,
  PublicProfileSkeleton,
} from "@/components/profile/PublicProfileBody";
import { usePublicProfile } from "@/hooks/api/usePublicProfile";
import { createMockShopProducts } from "@/lib/public-profile.mock";

export default function PublicUserPage() {
  const params = useParams<{ username: string }>();
  const username = params.username || "";
  const { profile, isLoading, error, refresh } = usePublicProfile(username);

  if (isLoading && !profile) {
    return <PublicProfileSkeleton />;
  }

  if (!profile) {
    return (
      <PublicProfileError
        message={error || "Người dùng không tồn tại hoặc hồ sơ không còn khả dụng."}
        onRetry={() => void refresh()}
      />
    );
  }

  // Theo luồng đã chốt, thành viên từ cấp 2 có khả năng bán hàng.
  // TODO BACKEND: public profile cần trả sellerProfile/shopId để tải sản phẩm thật theo username.
  const sellerEnabled = Number(profile.userLevel ?? 1) >= 2;
  const hasSellerActivity = Number(profile.successfulSaleCount ?? 0) > 0;
  const mockProducts = sellerEnabled && hasSellerActivity ? createMockShopProducts(profile) : [];

  return (
    <PublicProfileBody
      profile={{
        name: profile.fullName,
        handle: profile.username,
        avatarUrl: profile.avatarUrl,
        joinedAt: profile.createdAt,
        completedPurchaseCount: Number(profile.completedPurchaseCount ?? 0),
        successfulSaleCount: Number(profile.successfulSaleCount ?? 0),
        userLevel: profile.userLevel,
        sellerEnabled,
        statusLabel: "Đang hoạt động",
        messageHref: `/chat?username=${encodeURIComponent(profile.username)}`,
        products: mockProducts,
        productsLoading: false,
        productsAreMock: mockProducts.length > 0,
      }}
    />
  );
}
