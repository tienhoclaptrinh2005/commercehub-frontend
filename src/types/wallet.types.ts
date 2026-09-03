export interface WalletSummary {
  availableBalance: number;
  holdBalance: number;
  status: string;
}

export interface WalletTransaction {
  id: string;
  transactionType: string;
  balanceType: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId: number | null;
  referenceType: string | null;
  referenceCode: string | null;
  description: string | null;
  createdAt: string;
}

export type WalletTransactionCategory =
  | "ALL"
  | "DEPOSIT"
  | "PAYMENT"
  | "WITHDRAWAL"
  | "REFUND"
  | "SALE"
  | "FEE"
  | "ADJUSTMENT";

export interface DepositHistoryItem {
  id: number;
  amount: number;
  provider: string;
  transactionCode: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  processedAt: string | null;
  createdAt: string;
}

export interface WithdrawalRequest {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  idempotencyKey: string;
}

export interface DepositRequest {
  amount: number;
}
