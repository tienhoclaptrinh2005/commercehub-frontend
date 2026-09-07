import type { LucideIcon } from "lucide-react";
import {
  Clock3,
  LayoutDashboard,
  PackageCheck,
  ReceiptText,
  Settings,
  ShieldAlert,
  ShoppingBag,
  Store,
  TicketPercent,
  WalletCards,
} from "lucide-react";

export interface SellerNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
  available: boolean;
}

export const sellerNavigation: SellerNavigationItem[] = [
  {
    label: "Tổng quan",
    href: "/seller",
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Gian hàng",
    href: "/seller/shop",
    icon: Store,
    available: false,
  },
  {
    label: "Sản phẩm",
    href: "/seller/products",
    icon: PackageCheck,
    available: true,
  },
  {
    label: "Đơn hàng",
    href: "/seller/orders",
    icon: ShoppingBag,
    available: false,
  },
  {
    label: "Đơn đặt trước",
    href: "/seller/pre-orders",
    icon: Clock3,
    available: false,
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
    available: false,
  },
  {
    label: "Mã giảm giá",
    href: "/seller/vouchers",
    icon: TicketPercent,
    available: false,
  },
  {
    label: "Khiếu nại",
    href: "/seller/disputes",
    icon: ShieldAlert,
    available: true,
  },
  {
    label: "Cấu hình",
    href: "/seller/shop/edit",
    icon: Settings,
    available: false,
  },
];
