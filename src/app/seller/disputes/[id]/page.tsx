import type { Metadata } from "next";

import { DisputeDetailScreen } from "@/components/dispute/DisputeDetailScreen";

export const metadata: Metadata = { title: "Chi tiết khiếu nại" };

export default async function SellerDisputeDetailPage({ params }: PageProps<"/seller/disputes/[id]">) {
  const { id } = await params;
  return <DisputeDetailScreen mode="seller" id={Number(id)} />;
}
