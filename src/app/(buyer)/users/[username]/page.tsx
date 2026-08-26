"use client";

import { useParams } from "next/navigation";

import {
  PublicProfileBody,
  PublicProfileError,
  PublicProfileSkeleton,
} from "@/components/profile/PublicProfileBody";
import { usePublicProfile } from "@/hooks/api/usePublicProfile";
import { useShopProducts } from "@/hooks/api/useProducts";

export default function PublicUserPage() {
  const params = useParams<{ username: string }>();
  const username = params.username || "";
  const { profile, isLoading, error, refresh } = usePublicProfile(username);
  const shopProducts = useShopProducts(profile?.shopId ?? undefined);

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

  // Quyền bán hàng phải lấy từ role thật; cấp độ không thay thế phân quyền.
  const sellerEnabled = (profile.roles ?? []).includes("SELLER");
  const hasPublicShop = typeof profile.shopId === "number";

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
        roles: profile.roles ?? [],
        statusLabel: "Đang hoạt động",
        messageHref: `/chat?username=${encodeURIComponent(profile.username)}`,
        products: hasPublicShop ? shopProducts.products : [],
        productsLoading: hasPublicShop && shopProducts.isLoading,
        productsError: hasPublicShop ? shopProducts.error : null,
        onRetryProducts: hasPublicShop ? shopProducts.refresh : undefined,
      }}
    />
  );
}
