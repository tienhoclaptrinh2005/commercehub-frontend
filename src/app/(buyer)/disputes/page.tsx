import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DisputeListScreen } from "@/components/dispute/DisputeListScreen";

export const metadata: Metadata = { title: "Khiếu nại của tôi" };

export default function BuyerDisputesPage() {
  return <ProtectedRoute><DisputeListScreen mode="buyer" /></ProtectedRoute>;
}
