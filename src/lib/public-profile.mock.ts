import type { ProductSummary, PublicUserProfile } from "@/types";

// TODO BACKEND:
// GET /api/v1/users/{username} chưa trả sellerProfile/shopId.
// Danh sách này chỉ giúp hoàn thiện/kiểm tra UI gian hàng trên hồ sơ user cấp 2+
// và phải được xóa sau khi backend có thể trả sản phẩm thật theo username.
export function createMockShopProducts(profile: PublicUserProfile): ProductSummary[] {
  const common = {
    shopId: -1,
    shopName: profile.username,
    categoryId: -1,
    categoryName: "Dữ liệu mẫu",
    shortDescription: null,
    description: null,
    productType: "DIGITAL",
    status: "ACTIVE" as const,
    stockCount: 0,
    thumbnailUrl: null,
    imageUrls: [],
    createdAt: profile.createdAt,
    updatedAt: profile.createdAt,
  };

  return [
    {
      ...common,
      id: -101,
      name: "Sản phẩm số giao ngay (mẫu)",
      slug: "mock-instant-product",
      deliveryType: "INSTANT",
      soldCount: 0,
      minPrice: 49_000,
      variants: [
        {
          id: -1001,
          productId: -101,
          name: "30 ngày",
          durationDays: 30,
          price: 49_000,
          sortOrder: 1,
          status: "ACTIVE",
          stockCount: 0,
        },
      ],
    },
    {
      ...common,
      id: -102,
      name: "Dịch vụ kỹ thuật số (mẫu)",
      slug: "mock-digital-service",
      deliveryType: "PRE_ORDER",
      soldCount: 0,
      minPrice: 79_000,
      variants: [
        {
          id: -1002,
          productId: -102,
          name: "Cơ bản",
          durationDays: 30,
          price: 79_000,
          sortOrder: 1,
          status: "ACTIVE",
          stockCount: 0,
        },
        {
          id: -1003,
          productId: -102,
          name: "Nâng cao",
          durationDays: 90,
          price: 149_000,
          sortOrder: 2,
          status: "ACTIVE",
          stockCount: 0,
        },
      ],
    },
    {
      ...common,
      id: -103,
      name: "Tài khoản số chính hãng (mẫu)",
      slug: "mock-digital-account",
      deliveryType: "INSTANT",
      soldCount: 0,
      minPrice: 25_000,
      variants: [
        {
          id: -1004,
          productId: -103,
          name: "1 tháng",
          durationDays: 30,
          price: 25_000,
          sortOrder: 1,
          status: "ACTIVE",
          stockCount: 0,
        },
      ],
    },
  ];
}
