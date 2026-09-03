import type { Metadata } from "next";

import { WalletTransactionHistoryScreen } from "@/components/wallet/WalletTransactionHistoryScreen";

export const metadata: Metadata = {
  title: "Biến động số dư | CommerceHub",
  description: "Lịch sử nạp tiền, thanh toán, hoàn tiền và giao dịch ví.",
};

export default function WalletTransactionsPage() {
  return <WalletTransactionHistoryScreen />;
}
