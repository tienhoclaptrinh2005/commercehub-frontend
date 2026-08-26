import type { Metadata } from "next";

import { DisputeListScreen } from "@/components/dispute/DisputeListScreen";

export const metadata: Metadata = { title: "Khiếu nại" };

export default function SellerDisputesPage() {
  return <DisputeListScreen mode="seller" />;
}
