import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { CreateDisputeScreen } from "@/components/dispute/CreateDisputeScreen";

export const metadata: Metadata = { title: "Tạo khiếu nại" };

export default async function CreateDisputePage({
  params,
}: PageProps<"/orders/[orderId]/items/[itemId]/complain">) {
  const { orderId, itemId } = await params;
  return (
    <ProtectedRoute>
      <CreateDisputeScreen orderId={Number(orderId)} orderItemId={Number(itemId)} />
    </ProtectedRoute>
  );
}
