import type { Metadata } from "next";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { CreateDisputeScreen } from "@/components/dispute/CreateDisputeScreen";

export const metadata: Metadata = { title: "Tạo khiếu nại" };

export default async function CreateDisputePage({
  params,
}: PageProps<"/orders/[orderCode]/items/[itemId]/complain">) {
  const { orderCode, itemId } = await params;
  return (
    <ProtectedRoute>
      <CreateDisputeScreen orderCode={orderCode} orderItemId={Number(itemId)} />
    </ProtectedRoute>
  );
}
