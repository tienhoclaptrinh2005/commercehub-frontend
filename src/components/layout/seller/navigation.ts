import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  LayoutDashboard,
  Landmark,
  MessageSquareText,
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
  dividerBefore?: boolean;
  notificationKey?: "recentInstantOrders" | "activePreOrders" | "activeDisputes" | "withdrawalUpdates" | "unreadMessages";
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
    label: "Tin nhắn",
    href: "/chat",
    icon: MessageSquareText,
    available: true,
    notificationKey: "unreadMessages",
  },
  {
    label: "Tất cả đơn hàng",
    href: "/seller/orders",
    icon: ShoppingBag,
    available: true,
    dividerBefore: true,
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
    dividerBefore: true,
  },
  {
    label: "Yêu cầu rút tiền",
    href: "/seller/wallet/withdraw",
    icon: Landmark,
    available: true,
    notificationKey: "withdrawalUpdates",
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
    dividerBefore: true,
  },
  {
    label: "Cấu hình",
    href: "/seller/shop/edit",
    icon: Settings,
    available: false,
  },
];
