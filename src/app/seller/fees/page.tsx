import type { Metadata } from "next";

import { SellerFeesScreen } from "@/components/seller/fees/SellerFeesScreen";

export const metadata: Metadata = {
  title: "Phí sàn",
};

export default function SellerFeesPage() {
  return <SellerFeesScreen />;
}
