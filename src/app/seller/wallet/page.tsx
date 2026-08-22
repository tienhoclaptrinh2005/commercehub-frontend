import type { Metadata } from "next";

import { SellerWalletOverview } from "@/components/wallet/SellerWalletOverview";

export const metadata: Metadata = {
  title: "Ví & tài chính",
};

export default function SellerWalletPage() {
  return <SellerWalletOverview />;
}
