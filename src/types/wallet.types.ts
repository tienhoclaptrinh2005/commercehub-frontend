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
  status: DepositStatus;
  expiresAt: string;
  paidAt: string | null;
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

export type WithdrawalStatus = "PENDING" | "APPROVED" | "DONE" | "REJECTED";

export interface WithdrawalHistoryItem {
  id: number;
  amount: number;
  fee: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  adminNote: string | null;
  transferReference: string | null;
  approvedByUsername: string | null;
  processorUsername: string | null;
  createdAt: string;
  approvedAt: string | null;
  processedAt: string | null;
}

export interface DepositRequest {
  amount: number;
  idempotencyKey: string;
}

export type DepositStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "REVIEW_REQUIRED";

export interface DepositQrSession {
  id: number;
  transactionCode: string;
  paymentCode: string;
  amount: number;
  status: DepositStatus;
  qrUrl: string;
  bankCode: string;
  bankAccountNumber: string;
  accountName: string;
  expiresAt: string;
  paidAt: string | null;
}
