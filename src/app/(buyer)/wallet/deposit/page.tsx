import type { Metadata } from "next";

import { DepositScreen } from "@/components/wallet/DepositScreen";

export const metadata: Metadata = {
  title: "Nạp tiền",
  description: "Nạp tiền vào ví CommerceHub qua VNPay.",
};

export default function DepositPage() {
  return <DepositScreen />;
}
