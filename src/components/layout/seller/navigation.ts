import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShoppingBag,
  TicketPercent,
  WalletCards,
} from "lucide-react";

export interface SellerNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
  notificationKey?: "recentInstantOrders" | "activePreOrders" | "activeDisputes";
}

export const sellerNavigation: SellerNavigationItem[] = [
  {
    label: "Tổng quan",
    href: "/seller",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Sản phẩm",
    href: "/seller/products",
    icon: PackageCheck,
    available: true,
  },
  {
    label: "Tất cả đơn hàng",
    href: "/seller/orders",
    icon: ShoppingBag,
    available: true,
  },
  {
    label: "Đơn giao ngay",
    href: "/seller/orders/instant",
    icon: PackageCheck,
    available: true,
    notificationKey: "recentInstantOrders",
  },
  {
    label: "Đơn đặt hàng",
    href: "/seller/orders/pre-orders",
    icon: Clock3,
    available: true,
    notificationKey: "activePreOrders",
  },
  {
    label: "Khiếu nại",
    href: "/seller/disputes",
    icon: ShieldAlert,
    available: true,
    notificationKey: "activeDisputes",
  },
  {
    label: "Ví & tài chính",
    href: "/seller/wallet",
    icon: WalletCards,
    available: true,
  },
  {
    label: "Phí sàn",
    href: "/seller/fees",
    icon: ReceiptText,
    available: true,
  },
  {
    label: "Mã giảm giá",
    href: "/seller/vouchers",
    icon: TicketPercent,
    available: false,
  },
  {
    label: "Cấu hình",
    href: "/seller/shop/edit",
    icon: Settings,
    available: false,
  },
];
