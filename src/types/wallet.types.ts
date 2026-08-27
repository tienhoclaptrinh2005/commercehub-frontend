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
  description: string | null;
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
