import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { DisputeDetailScreen } from "@/components/dispute/DisputeDetailScreen";

export const metadata: Metadata = { title: "Chi tiết khiếu nại" };

export default async function BuyerDisputeDetailPage({ params }: PageProps<"/disputes/[id]">) {
  const { id } = await params;
  return <ProtectedRoute><DisputeDetailScreen mode="buyer" id={Number(id)} /></ProtectedRoute>;
}
