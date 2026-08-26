import { DisputeDetailScreen } from "@/components/dispute/DisputeDetailScreen";

export default async function AdminDisputeDetailPage({ params }: PageProps<"/admin/disputes/[id]">) {
  const { id } = await params;
  return <DisputeDetailScreen mode="admin" id={Number(id)} />;
}
