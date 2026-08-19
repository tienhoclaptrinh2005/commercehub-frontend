import type { Metadata } from "next";

import { SellerDashboard } from "@/components/seller/dashboard/SellerDashboard";

export const metadata: Metadata = {
  title: "Tổng quan",
};

export default function SellerDashboardPage() {
  return <SellerDashboard />;
}
