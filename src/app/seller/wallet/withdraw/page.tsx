import type { Metadata } from "next";

import { WithdrawForm } from "@/components/wallet/WithdrawForm";

export const metadata: Metadata = {
  title: "Yêu cầu rút tiền",
};

export default function SellerWithdrawPage() {
  return <WithdrawForm />;
}
