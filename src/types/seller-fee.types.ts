export interface SellerFeeConfig {
  id: number;
  feeRate: number;
  minFeeAmount: number;
  maxFeeAmount: number | null;
  description: string | null;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil: string | null;
}

export interface SellerFeeSummary {
  id: number | null;
  shopId: number;
  periodYear: number;
  periodMonth: number;
  totalSales: number;
  totalFee: number;
  totalNet: number;
  totalRefunded: number;
  orderCount: number;
  disputeCount: number;
  updatedAt: string | null;
}

export interface SellerFeeLedger {
  id: number;
  orderItemId: number;
  orderId: number;
  shopId: number;
  feeRateSnapshot: number;
  saleAmount: number;
  feeAmount: number;
  sellerNetAmount: number;
  adjustedFeeAmount: number | null;
  adjustedSellerNet: number | null;
  adjustmentReason: string | null;
  status: "PENDING" | "COLLECTED" | "CANCELLED";
  feeIncurredAt: string;
  collectedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}
